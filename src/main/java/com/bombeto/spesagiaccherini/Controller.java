package com.bombeto.spesagiaccherini;

import javafx.application.Platform;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.control.cell.TextFieldTableCell;
import javafx.scene.control.skin.TableViewSkin;
import javafx.scene.control.skin.VirtualFlow;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.ScrollEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.util.converter.IntegerStringConverter;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.controlsfx.control.ToggleSwitch;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.util.*;

public class Controller {
    
    private Stage stage;
    public void setStage(Stage stage) {
        this.stage = stage;
    }
    public Image appIcon = new Image(Objects.requireNonNull(Testing.class.getResource("media/cg_logo_2.png")).toString());
    public Image aboutIcon = new Image(Objects.requireNonNull(Testing.class.getResource("media/cg_logo_1.png")).toString());
    
    @FXML
    TableView<ShopItem> table;
    @FXML
    BorderPane totalsPane;
    @FXML
    HBox addNewItemBox;
    @FXML
    TextField newItemName, newItemPrice, newItemQuantity, newItemBuyers;
    @FXML
    ToggleSwitch priceTypeToggle;
    
    private double zoomFactor = 1.0;
    private int scrollIndex = 0;
    
    @FXML
    private void initialize() throws IOException {
        
        tableSetup();
        
        populate();
        
        // Zoom feature and scroll feature
        table.addEventFilter(ScrollEvent.SCROLL, event -> {
            if(event.isControlDown()) {
                double delta = event.getDeltaY() > 0 ? 1.1 : 0.9;
                double newZoomFactor = zoomFactor * delta;
                
                if (newZoomFactor >= 0.5 && newZoomFactor <= 2.0) {
                    double oldZoomFactor = zoomFactor;
                    zoomFactor = newZoomFactor;
                    
                    // Calculate the adjustment needed to keep the top-left corner anchored
                    double adjustmentFactor = zoomFactor - oldZoomFactor;
                    double translateX = table.getLayoutBounds().getWidth() * adjustmentFactor / 2;
                    double translateY = table.getLayoutBounds().getHeight() * adjustmentFactor / 2;
                    
                    table.setScaleX(zoomFactor);
                    table.setScaleY(zoomFactor);
                    
                    // Adjust translation to anchor to top-left
                    table.setTranslateX(table.getTranslateX() + translateX);
                    table.setTranslateY(table.getTranslateY() + translateY);
                }
                event.consume();
            } else {
                // Allow normal scrolling
                event.consume();  // Consume the event to avoid conflict with zooming
                
                // Scroll the table by the amount of delta Y
                double scrollAmount = event.getDeltaY() > 0 ? -1 : 1;  // Positive for down, negative for up
                scrollIndex += (int) scrollAmount;
                if(scrollAmount == 1) { if (getVisibleRow(-2) == table.getItems().size() - 1) scrollIndex = getVisibleRow(-1) + 1; }
                else { if (scrollIndex < 0) scrollIndex = 0; }
                table.scrollTo(scrollIndex);
            }
        });

        // Remove a selected row by pressing delete
        table.addEventFilter(KeyEvent.KEY_PRESSED, event -> {
            KeyCode keyCode = event.getCode();
            if(keyCode == KeyCode.DELETE) {
                removeRow();
                event.consume();
            }
        });

        // Add new item by pressing ENTER while in text fields
        addNewItemBox.addEventFilter(KeyEvent.KEY_PRESSED, event -> {
            // addNewItem() already ignores cases with empty names, however this is left here as an additional safety net
            if(event.getCode() == KeyCode.ENTER && !newItemName.getText().isEmpty()) {
                addNewItem();
                event.consume();
            }
        });

        // Switch between total price and unit price
        priceTypeToggle.setOnMouseReleased(_ -> {
            if(priceTypeToggle.isSelected()) newItemPrice.setPromptText("Prezzo Totale");
            else newItemPrice.setPromptText("Prezzo Unitario");
        });
    }
    
    File openFile() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Open Resource File");
        fileChooser.setInitialDirectory(new File(System.getProperty("user.home")));
        fileChooser.getExtensionFilters().addAll(
                new FileChooser.ExtensionFilter("Text Files", "*.txt"),
                new FileChooser.ExtensionFilter("PDF files", "*.pdf"),
                new FileChooser.ExtensionFilter("All files", "*.*")
        );

        return fileChooser.showOpenDialog(stage);
    }
    
    @FXML
    private void addNewFile() throws IOException {
        populate(openFile());
    }
    
    @FXML void cleanAddNewFile() throws IOException {
        table.getItems().clear();
        populate(openFile());
    }
    
    @FXML
    private void closeFile() {
        table.getItems().clear();
    }
    
    @FXML
    private void exitApplication() {
        Platform.exit();
    }
    
//    -- LEGACY --
//    @FXML
//    private void calculate() {
//        int n;
//        List<ShopItem> items = table.getItems();
//        TreeMap<String, Float> theCheck = new TreeMap<>();
//        for(ShopItem item : items) {
//            n = item.getBuyers().size();
//            for(String buyer : item.getBuyers()) {
//                addEntry(theCheck, buyer, item.getTotalPrice()/n);
//            }
//        }
//
//        Stage newStage = new Stage();
//        newStage.setTitle("Totali");
//        newStage.getIcons().add(appIcon);
//        Label totLabel = new Label();
//        totalsPane = new BorderPane();
//
//        totLabel.setText(printTheCheck(theCheck));
//        totalsPane.setCenter(totLabel);
//
//        Scene scene = new Scene(totalsPane, 300, 300);
//        newStage.setScene(scene);
//        newStage.show();
//    }
    
    @FXML
    private void calculate() {
        
        int currMin = 1;
        float tempCost;
        
        List<ShopItem> tempItems = new ArrayList<>();
        table.getItems().forEach(tableItem -> tempItems.add(new ShopItem(tableItem)));
        TreeMap<String, Float> theCheck = new TreeMap<>();
        List<String> minBuyersTemp = new ArrayList<>();
        Map<String, Integer> currentItemBuyersMap;
        
        for (ShopItem item : tempItems) {
            currentItemBuyersMap = item.getBuyersMap();
            while(item.getAmount() != 0) {
                // We save all the buyers that bought the least amount of this item
                for (Map.Entry<String, Integer> entry : currentItemBuyersMap.entrySet()) {
                    if (entry.getValue() < currMin) {
                        currMin = entry.getValue();
                        minBuyersTemp.clear();
                        minBuyersTemp.add(entry.getKey());
                    } else if (entry.getValue() == currMin) {
                        minBuyersTemp.add(entry.getKey());
                    }
                }
                
                item.setAmount(item.getAmount() - currMin);
                tempCost = (item.getPrice() * currMin) / currentItemBuyersMap.size();
                for(String buyer : item.getBuyers()) { // loop for all the buyers of the item
                    addEntry(theCheck, buyer, tempCost); // add to the check
                    if(minBuyersTemp.contains(buyer)) { // if the current one is in our temp list
                        // remove from both lists, we calculated his share and don't need it no more
                        minBuyersTemp.remove(buyer);
                        currentItemBuyersMap.remove(buyer);
                    } else {
                        currentItemBuyersMap.merge(buyer, -currMin, Integer::sum);
                    }
                }
                currMin = 1;
            }
        }
        
        Stage newStage = new Stage();
        newStage.setTitle("Totali");
        newStage.getIcons().add(appIcon);
        Label totLabel = new Label();
        totalsPane = new BorderPane();
        
        totLabel.setText(printTheCheck(theCheck));
        totalsPane.setCenter(totLabel);
        
        Scene scene = new Scene(totalsPane, 300, 300);
        newStage.setScene(scene);
        newStage.show();
    }

    @SuppressWarnings("SpellCheckingInspection")
    @FXML
    private void setupCheckCompilation() throws IOException {
        if (table.getItems().isEmpty()) return;
        Stage compilatioStage = new Stage();
        compilatioStage.setTitle("La Spesa Giaccherini - Compilazione Ricevuta");
        compilatioStage.getIcons().add(appIcon);
        compilatioStage.setResizable(false);
        compilatioStage.initOwner(stage);

        Stage confirmationStage = new Stage();
        confirmationStage.setTitle("Attenzione");
        confirmationStage.getIcons().add(appIcon);
        confirmationStage.setResizable(false);
        confirmationStage.initOwner(compilatioStage);

        FXMLLoader loader = new FXMLLoader(new URL("file:C:\\Users\\dvinc\\IdeaProjects\\SpesaGiaccherini\\target\\classes\\com\\bombeto\\spesagiaccherini\\checkcomp-root.fxml"));
        CompilationController compController = new CompilationController(table, compilatioStage, confirmationStage);
        loader.setController(compController);
        Parent compilationRoot = loader.load();
        loader = new FXMLLoader(new URL("file:C:\\Users\\dvinc\\IdeaProjects\\SpesaGiaccherini\\target\\classes\\com\\bombeto\\spesagiaccherini\\confirm-elim-root.fxml"));
        loader.setController(compController);
        Parent confirmRoot = loader.load();



        Scene compilationScene = new Scene(compilationRoot);
        Scene confirmationScene = new Scene(confirmRoot);
        
        compilatioStage.setScene(compilationScene);
        compilatioStage.initModality(Modality.WINDOW_MODAL);
        
        confirmationStage.setScene(confirmationScene);
        confirmationStage.initModality(Modality.WINDOW_MODAL);

        compilatioStage.showAndWait();
    }

    @FXML
    private void addNewItem() {

        String name = newItemName.getText();
        if(name.isEmpty()) return;
        
        Optional<String> temp = newItemPrice.getText().isEmpty() ? Optional.empty() : Optional.of(newItemPrice.getText());
        float price = temp.map(s -> Float.parseFloat(s.replace(",", "."))).orElse(0F);

        temp = newItemQuantity.getText().isEmpty() ? Optional.empty() : Optional.of(newItemQuantity.getText());
        int quantity = Integer.parseInt(temp.orElse("1"));
        
        String buyers = newItemBuyers.getText();

        //System.out.println(name + " " + price + " " + quantity + " " + buyers);
        
        ShopItem item;
        
        if(priceTypeToggle.isSelected())item = new ShopItem(name, price, quantity, true);
        else item = new ShopItem(name, price, quantity, false);
        
        item.setBuyers(buyers);

        newItemName.clear();
        newItemPrice.clear();
        newItemQuantity.clear();
        newItemBuyers.clear();

        ObservableList<ShopItem> items = table.getItems();
        int index = items.indexOf(item);
        if(index != -1) {
            table.getItems().get(index).mergeEquals(item);
        } else table.getItems().add(item);
        table.refresh();
        newItemName.requestFocus();
    }

    @FXML
    private void removeRow() {
        int tableIndex = table.getSelectionModel().getSelectedIndex();
        if(tableIndex != -1) {
            table.getItems().remove(tableIndex);
            table.refresh();
        }
    }

    @FXML
    private void about() {
        Stage newStage = new Stage();
        newStage.initOwner(stage);
        newStage.setTitle("About");
        newStage.getIcons().add(appIcon);
        Label aboutLabel = new Label();
        VBox vBox = new VBox();

        aboutLabel.setText("Questo programma é stato offerto da\n'Rimembranze S.r.l.'");
        aboutLabel.setAlignment(Pos.CENTER);
        aboutLabel.setStyle("-fx-text-alignment: center");

        ImageView imageView = new ImageView(aboutIcon);
        imageView.setPreserveRatio(true);
        imageView.setFitWidth(300);

        vBox.getChildren().add(aboutLabel);
        vBox.getChildren().add(imageView);
        vBox.setAlignment(Pos.CENTER);
        vBox.setSpacing(25);
        vBox.setPadding(new Insets(15, 30, 30, 30));

        Scene scene = new Scene(vBox);
        newStage.setScene(scene);
        newStage.initModality(Modality.WINDOW_MODAL);
        newStage.show();
    }
    
    public String printTheCheck(TreeMap<String, Float> theCheck) {
        StringBuilder str = new StringBuilder();
        float total = 0, partial;
        
        for(String entry : theCheck.keySet()) {
            partial = theCheck.get(entry);
            str.append("Spesa totale " + entry + ": " + String.format("%.2f", partial) + "€\n");
            total += partial;
        }
        str.append("\nSpesa complessiva: " + String.format("%.2f", total) + "€");
        System.out.println(str);
        return str.toString();
    }
    
    private void addEntry(TreeMap<String, Float> theCheck, String name, float cost) {
        theCheck.merge(name, cost, Float::sum);
    }
    
    private void populate() throws IOException {
        //Populate the table
        List<ShopItem> items = new FileHandler().getReceiptList_UNES();
        
        while(!items.isEmpty()) {
            table.getItems().add(items.removeFirst());
        }
    }
    
    // LEGACY
//    private void populate(File selectedFile) throws IOException {
//
//        List<ShopItem> items = null;
//
//        if(selectedFile.getName().endsWith(".pdf")) items = new FileHandler(new PDFTextStripper().getText(Loader.loadPDF(selectedFile))).getReceiptList_UNES();
//        else if(selectedFile.getName().endsWith(".txt")) {
//            CheckType checkType = getCheckType(selectedFile);
//            if(checkType == CheckType.EVERLI) items = new FileHandler(selectedFile).getReceiptList_EVERLI();
//            else if(checkType == CheckType.UNES) items = new FileHandler(selectedFile).getReceiptList_UNES();
//            else if (checkType == CheckType.DELIVEROO) items = new FileHandler(selectedFile).getReceiptList_UNES();
//            else System.out.println("\n\nATTENZIONE: getCheckType ritorna DEFAULT\n\n");
//        }
//        else throw new IllegalArgumentException("Unrecognized file type");
//
//        assert items != null;
//        while(!items.isEmpty()) {
//            table.getItems().add(items.removeFirst());
//        }
//    }
    
    private void populate(File selectedFile) throws IOException {

        List<ShopItem> items = null;
        String fileToText;

        if(selectedFile.getName().endsWith(".pdf")) fileToText = new PDFTextStripper().getText(Loader.loadPDF(selectedFile));
        else if(selectedFile.getName().endsWith(".txt")) fileToText = Files.readString(selectedFile.toPath());
        else throw new IllegalArgumentException("Unrecognized file type");

        switch (getCheckType(fileToText)) {
            case UNES -> items = new FileHandler(fileToText).getReceiptList_UNES();
            case EVERLI -> items = new FileHandler(fileToText).getReceiptList_EVERLI();
            case DELIVEROO -> items = new FileHandler(fileToText).getReceiptList_DELIVEROO();
            default -> System.out.println("\n\nATTENZIONE: getCheckType ritorna DEFAULT\n\n");
        }

        assert items != null;
        while(!items.isEmpty()) {
            table.getItems().add(items.removeFirst());
        }
    }
    
    public CheckType getCheckType(File selectedFile) throws IOException {
        String str = Files.readString(selectedFile.toPath());
        if(str.contains("UNES")) return CheckType.UNES;
        else if(str.contains("Everli")) return CheckType.EVERLI;
        else if (str.contains("DELIVEROO")) return CheckType.DELIVEROO;
        else return CheckType.DEFAULT;
    }
    
    public CheckType getCheckType(String str) {
        if(str.contains("UNES")) return CheckType.UNES;
        else if(str.contains("Everli")) return CheckType.EVERLI;
        else if (str.contains("Deliveroo")) return CheckType.DELIVEROO;
        else return CheckType.DEFAULT;
    }
    
    private int getVisibleRow(int scrollIndex) {
        if(table.getItems().isEmpty()) return 0;
        // Get the TableView's skin
        TableViewSkin<?> skin = (TableViewSkin<?>) table.getSkin();
        if (skin == null) return -1;
        
        // Access the VirtualFlow from the skin
        VirtualFlow<?> virtualFlow = (VirtualFlow<?>) skin.getChildren().stream()
                .filter(node -> node instanceof VirtualFlow)
                .findFirst()
                .orElse(null);
        
        if (virtualFlow == null) return -1;
        
        // Calculate the last visible row
        if(scrollIndex == -1) return virtualFlow.getFirstVisibleCell().getIndex();
        if(scrollIndex == -2) return virtualFlow.getLastVisibleCell().getIndex();
        else return -1;
    }

    private void tableSetup() {
        
        //Set up the table
        
        // * Given an "AdvancedTableColumn" class that extends the "TableColumn" class
        // * Possible method to group the first 3/4 lines of the following 5 column setups
        
        // ? The idea would be:
        // ? public AdvancedTableColumn<S, T>(String colName, String cellValueFactory, StringConverter strConverter, String style);
        
        TableColumn<ShopItem, String> itemNameCol = new TableColumn<>("Articolo");
        itemNameCol.setCellValueFactory(new PropertyValueFactory<>("itemName"));
        itemNameCol.setCellFactory(TextFieldTableCell.forTableColumn());
        itemNameCol.setOnEditCommit(event -> {
            event.getRowValue().setItemName(event.getNewValue());
            table.refresh();
            event.consume();
        });

        TableColumn<ShopItem, Float> unitPriceCol = new TableColumn<>("Prezzo Unitario");
        unitPriceCol.setCellValueFactory(new PropertyValueFactory<>("price"));
        unitPriceCol.setCellFactory(TextFieldTableCell.forTableColumn(new CurrencyFloatStringConverter("€")));
        unitPriceCol.setStyle("-fx-alignment: CENTER;");
        unitPriceCol.setOnEditCommit(event -> {
            try {
                event.getRowValue().setPrice(event.getNewValue().toString().replace(" €", ""));
            } catch (NullPointerException _) {
                System.out.println("- empty string or invalid number format");
            }
            table.refresh();
            event.consume();
        });


        TableColumn<ShopItem, Float> priceCol = new TableColumn<>("Prezzo Totale");
        priceCol.setCellValueFactory(new PropertyValueFactory<>("totalPrice"));
        priceCol.setCellFactory(TextFieldTableCell.forTableColumn(new CurrencyFloatStringConverter("€")));
        priceCol.setStyle("-fx-alignment: CENTER;");
        priceCol.setOnEditCommit(event -> {
            event.getRowValue().setTotalPrice(event.getNewValue().toString().replace(" €", ""));
            table.refresh();
            event.consume();
        });
        
        TableColumn<ShopItem, Integer> amountCol = new TableColumn<>("Quantità");
        amountCol.setCellValueFactory(new PropertyValueFactory<>("amount"));
        amountCol.setCellFactory(TextFieldTableCell.forTableColumn(new IntegerStringConverter()));
        amountCol.setStyle("-fx-alignment: CENTER;");
        amountCol.setOnEditCommit(event -> {
            event.getRowValue().setAmount(event.getNewValue());
            table.refresh();
            event.consume();
        });
        
        TableColumn<ShopItem, String> buyersCol = new TableColumn<>("Comprato Da");
        buyersCol.setCellValueFactory(new PropertyValueFactory<>("buyersString"));
        buyersCol.setCellFactory(TextFieldTableCell.forTableColumn());
        buyersCol.setOnEditCommit(event -> {
            event.getRowValue().setBuyers(event.getNewValue());
            table.refresh();
            event.consume();
        });
        
        table.getColumns().addAll(itemNameCol, unitPriceCol, amountCol, priceCol, buyersCol);
    }

}
