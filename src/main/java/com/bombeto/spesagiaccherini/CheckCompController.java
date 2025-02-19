package com.bombeto.spesagiaccherini;

import javafx.fxml.FXML;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.util.List;

public class CheckCompController {

    private TableView<ShopItem> table;
    private List<ShopItem> items;
    private Stage compilationStage, confirmationStage;
    private Scene confirmationScene;
    private int index;

    @FXML
    private TextField itemName, itemPrice, itemAmount, itemBuyers;
    @FXML
    private Button prevButton, nextButton, deleteButton, confirmButton;
    @FXML
    private Label currentItemIndex_Label;

    public CheckCompController(TableView<ShopItem> table, Stage compilationStage, Stage confirmationStage) {
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
        currentItem.setPrice(Float.parseFloat(itemPrice.getText()));
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
        itemPrice.setText(String.valueOf(currentItem.getPrice()));
        itemAmount.setText(String.valueOf(currentItem.getAmount()));
        itemBuyers.setText(String.valueOf(currentItem.getBuyersString()));
        currentItemIndex_Label.setText("(" + (index + 1) + ")");
        itemBuyers.requestFocus();
    }

    private void deleteSelectedItem() {
        items.remove(index);
        table.refresh();
        updateCurrentItem();
    }

}
