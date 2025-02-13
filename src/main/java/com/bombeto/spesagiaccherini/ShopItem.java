package com.bombeto.spesagiaccherini;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

public class ShopItem {
    
    private String itemName;
    private float price;
    private int amount;
    private final List<String> buyers = new ArrayList<>();
    
    
    public ShopItem() {
        this.itemName = "";
    }
    
    public ShopItem(String itemName, float price) {
        this.itemName = itemName;
        this.price = price;
        this.amount = 1;
    }
    
    public ShopItem(String itemName, float price, int amount) {
        this.itemName = itemName;
        this.price = price;
        this.amount = amount;
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                  GETTERS
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    public String getItemName() {
        return itemName;
    }
    
    public float getPrice() {
        return price;
    }
    
    public int getAmount() {
        return amount;
    }
    
    public List<String> getBuyers() {
        return buyers;
    }
    
    public String getBuyersString() {
        return String.join(",", buyers);
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                  SETTERS
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    
    public void setBuyers(String buyers) {
        this.buyers.clear();
        switch (buyers) {
            case "" -> {
                this.buyers.add("A");
                this.buyers.add("D");
            }
            case "3" -> {
                this.buyers.add("A");
                this.buyers.add("D");
                this.buyers.add("G");
            }
            default -> {
                StringTokenizer st = new StringTokenizer(buyers);
                while(st.hasMoreTokens()) {
                    this.buyers.add(st.nextToken());
                }
            }
        }
    }
    
    public void setPrice(float price) {
        this.price = Math.round(price * 100) / 100f;
    }
    
    public void setAmount(int newAmount) {
        float temp = this.price/this.amount;
        setPrice(temp*newAmount);
        this.amount = newAmount;
    }
    
    public void incrementAmount() {
        float temp = price/amount;
        addToCost(temp);
        this.amount++;
    }
    
    public void addToCost(float f) {
        this.price += f;
    }
    
    public boolean equals(ShopItem item2) {
        return this.itemName.equals(item2.getItemName()) && this.price == item2.getPrice();
    }
    
    public String toTSV() {
        StringBuilder sb = new StringBuilder();
        sb.append(itemName + "\t" + price + "\t" + amount + "\t");
        for(String buyer : buyers) {
            sb.append(buyer + " ");
        }
        return sb.toString();
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(amount + " - " + itemName + " -> " + String.format("%.2f", price) + "€");
        if(buyers != null) {
            sb.append("\n\nComprato da: ");
            for(String buyer : buyers) {
                sb.append(buyer + " ");
            }
        }
        return sb.toString();
    }
}