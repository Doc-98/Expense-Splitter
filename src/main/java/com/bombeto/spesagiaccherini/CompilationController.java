package com.bombeto.spesagiaccherini;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.GridPane;
import javafx.stage.Stage;

import java.util.List;

public class CompilationController {

    private TableView<ShopItem> table;
    private List<ShopItem> items;
    private Stage compilationStage, confirmationStage;
    private int index;
    private boolean isFirstEvent;

    @FXML
    private TextField itemName, itemPrice, itemAmount, itemBuyers;
    @FXML
    private Label currentItemIndex_Label;
    @FXML
    private GridPane grid;

    public CompilationController(TableView<ShopItem> table, Stage compilationStage, Stage confirmationStage) {
        this.table = table;
        this.compilationStage = compilationStage;
        this.confirmationStage = confirmationStage;
    }

    @FXML
    private void initialize() {
        this.index = 0;
        
        if(itemName != null) {
            items = table.getItems();
            updateCurrentItem();
        }
        
        grid.addEventFilter(KeyEvent.KEY_PRESSED, event -> {
            if (event.getCode() == KeyCode.ENTER) {
                if(isFirstEvent) {
                    handleConfirmButton();
                    isFirstEvent = false;
                } else isFirstEvent = true;
                event.consume();
            }
        });
    }

    @FXML
    private void handlePrevButton() {
        if(index > 0) index--;
        else index = items.size() - 1;
        updateCurrentItem();
    }

    @FXML
    private void handleNextButton() {
        if(index < items.size() - 1) index++;
        else index = 0;
        updateCurrentItem();
    }

    @FXML
    private void handleDeleteButton() {
        confirmationStage.showAndWait();
    }

    @FXML
    private void handleConfirmButton() {
        ShopItem currentItem = items.get(index);
        currentItem.setItemName(itemName.getText());
        currentItem.setTotalPrice(Float.parseFloat(itemPrice.getText()));
        currentItem.setAmount(Integer.parseInt(itemAmount.getText()));
        currentItem.setBuyers(itemBuyers.getText());
        table.refresh();
        if(index == items.size() - 1) compilationStage.close();
        else handleNextButton();
    }

    @FXML
    private void confirmDeleteButton() {
        deleteSelectedItem();
        confirmationStage.close();
    }

    @FXML
    private void abortDeleteButton() {
        confirmationStage.close();
    }

    private void updateCurrentItem() {
        ShopItem currentItem = items.get(index);
        itemName.setText(currentItem.getItemName());
        itemPrice.setText(String.valueOf(currentItem.getTotalPrice()));
        itemAmount.setText(String.valueOf(currentItem.getAmount()));
        itemBuyers.setText(String.valueOf(currentItem.getBuyersString()));
        currentItemIndex_Label.setText("(" + (index + 1) + ")");
//        itemBuyers.requestFocus();
    }

    private void deleteSelectedItem() {
        items.remove(index);
        table.refresh();
        updateCurrentItem();
    }

}
