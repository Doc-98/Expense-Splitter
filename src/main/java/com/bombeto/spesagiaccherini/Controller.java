package com.bombeto.spesagiaccherini;

import javafx.application.Platform;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Group;
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
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.util.converter.FloatStringConverter;
import javafx.util.converter.IntegerStringConverter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.TreeMap;

import static com.bombeto.spesagiaccherini.Testing.aboutIcon;
import static com.bombeto.spesagiaccherini.Testing.appIcon;

public class Controller {
    
    private Stage stage;
    public void setStage(Stage stage) {
        this.stage = stage;
    }
    
    @FXML
    TableView<ShopItem> table;
    @FXML
    AnchorPane pane;
    @FXML
    BorderPane totalsPane;
    @FXML
    Group addNewItemGroup;
    @FXML
    TextField newItemName, newItemPrice, newItemQuantity, newItemBuyers;
    
    private double zoomFactor = 1.0;
    private int scrollIndex = 0;
    
    @FXML
    private void initialize() throws IOException {
        
        setup();
        
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
        addNewItemGroup.addEventFilter(KeyEvent.KEY_PRESSED, event -> {
            // addNewItem() already ignores cases with empty names, however this is left here as an additional safety net
            if(event.getCode() == KeyCode.ENTER && !newItemName.getText().isEmpty()) {
                addNewItem();
                event.consume();
            }
        });
    }
    
    @FXML
    private void openNewFile() throws IOException {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Open Resource File");
        fileChooser.setInitialDirectory(new File(System.getProperty("user.home")));
        fileChooser.getExtensionFilters().addAll(
                new FileChooser.ExtensionFilter("Text Files", "*.txt"),
                new FileChooser.ExtensionFilter("All files", "*.*")
        );
        File selectedFile = fileChooser.showOpenDialog(stage);
        if (selectedFile != null) {
            table.getItems().clear();
            populate(selectedFile);
        } else throw new FileNotFoundException();
    }
    
    @FXML
    private void closeFile() {
        table.getItems().clear();
    }
    
    @FXML
    private void exitApplication() {
        Platform.exit();
    }
    
    @FXML
    private void calculate() throws URISyntaxException {
        int n;
        List<ShopItem> items = table.getItems();
        TreeMap<String, Float> theCheck = new TreeMap<String, Float>();
        for(ShopItem item : items) {
            n = item.getBuyers().size();
            for(String buyer : item.getBuyers()) {
                addEntry(theCheck, buyer, item.getPrice()/n);
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

    @FXML
    private void setupCheckCompilation() throws IOException {
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

        FXMLLoader loader = new FXMLLoader(Testing.class.getResource("checkcomp-root.fxml"));
        CheckCompController compController = new CheckCompController(table, compilatioStage, confirmationStage);
        loader.setController(compController);
        Parent compilationRoot = loader.load();
        loader = new FXMLLoader(Testing.class.getResource("confirm-elim-root.fxml"));
        loader.setController(compController);
        Parent confirmRoot = loader.load();



        Scene compilationScene = new Scene(compilationRoot);
        Scene confirmationScene = new Scene(confirmRoot);

        confirmationStage.setScene(confirmationScene);
        confirmationStage.initModality(Modality.WINDOW_MODAL);

        compilatioStage.setScene(compilationScene);
        compilatioStage.initModality(Modality.WINDOW_MODAL);

        compilatioStage.showAndWait();
    }

    @FXML
    private void addNewItem() {

        String name = newItemName.getText();
        if(name.isEmpty()) return;

        Optional<String> temp = newItemPrice.getText().isEmpty() ? Optional.empty() : Optional.of(newItemPrice.getText());
        float price = Float.parseFloat(temp.orElse("0"));

        temp = newItemQuantity.getText().isEmpty() ? Optional.empty() : Optional.of(newItemQuantity.getText());
        int quantity = Integer.parseInt(temp.orElse("1"));

        String buyers = newItemBuyers.getText();

        System.out.println(name + " " + price + " " + quantity + " " + buyers);

        ShopItem item = new ShopItem(name, price, quantity);
        item.setBuyers(buyers);

        newItemName.clear();
        newItemPrice.clear();
        newItemQuantity.clear();
        newItemBuyers.clear();

        ObservableList<ShopItem> items = table.getItems();
        int index = items.indexOf(item);
        if(index != -1) {
            items.get(index).mergeEquals(item);
        }else items.add(item);
        table.refresh();
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
    private void about() throws URISyntaxException {
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
            table.getItems().add(items.remove(0));
        }
    }
    
    private void populate(File selectedFile) throws IOException {
        //Populate the table
        List<ShopItem> items = new FileHandler(selectedFile).getReceiptList_UNES();
        
        while(!items.isEmpty()) {
            table.getItems().add(items.remove(0));
        }
    }
    
    private int getVisibleRow(int scrollIndex) {
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

    private void setup() {
        
        //Set up the table
        
        TableColumn<ShopItem, String> itemNameCol = new TableColumn<>("Articolo");
        itemNameCol.setCellValueFactory(new PropertyValueFactory<>("itemName"));
        itemNameCol.setCellFactory(TextFieldTableCell.forTableColumn());
        itemNameCol.setOnEditCommit(event -> {
            event.getRowValue().setItemName(event.getNewValue());
            table.refresh();
            event.consume();
        });
        
        TableColumn<ShopItem, Float> priceCol = new TableColumn<>("Prezzo");
        priceCol.setCellValueFactory(new PropertyValueFactory<>("price"));
        priceCol.setCellFactory(TextFieldTableCell.forTableColumn(new FloatStringConverter()));
        priceCol.setOnEditCommit(event -> {
            event.getRowValue().setPrice(event.getNewValue());
            table.refresh();
            event.consume();
        });
        
        TableColumn<ShopItem, Integer> amountCol = new TableColumn<>("Quantità");
        amountCol.setCellValueFactory(new PropertyValueFactory<>("amount"));
        amountCol.setCellFactory(TextFieldTableCell.forTableColumn(new IntegerStringConverter()));
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
        
        
        
        table.getColumns().addAll(itemNameCol, priceCol, amountCol, buyersCol);
    }
}
