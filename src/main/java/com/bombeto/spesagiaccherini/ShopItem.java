package com.bombeto.spesagiaccherini;

import java.util.*;

public class ShopItem {
    
    private String itemName;
    private float price;
    private float totalPrice;
    private int amount;
    // TODO: CHECK THAT THE INTEGERS ARE NEVER BIGGER THAN AMOUNT
    private final Map<String, Integer> buyers = new HashMap<>();
    
    /**
     * Generates an empty {@code ShopItem} with an empty {@code itemName}, both {@code price} and {@code totalPrice} set to 0 and {@code amount} set to 1.
     */
    public ShopItem() {
        this.itemName = "";
        this.price = 0;
        this.totalPrice = 0;
        this.amount = 1;
    }
    
    /**
     * Generates a {@code ShopItem} with the given {@code itemName} and {@code price}. Defaults the {@code amount} to 1 and therefore both the attributes for the unit price and total price of the item will be the same.
     *
     * @param itemName Name for the item.<br>
     *
     * @param price Price for the item. Is assigned to both the {@code price} and {@code totalPrice} of the item.<br>
     */
    public ShopItem(String itemName, float price) {
        this.itemName = itemName;
        this.price = price;
        this.totalPrice = price;
        this.amount = 1;
    }
    
    
    /**
     * Generates a {@code ShopItem} with the given {@code itemName}, {@code price} and {@code amount}.<br>
     * Based on the {@code priceType} flag its possible to switch between having {@code price} assigned to the price of a single unit of the item or the total price for the whole {@code amount}.
     *
     * @param itemName Name of the item.<br>
     *
     * @param price Based on the {@code priceType} parameter, this becomes the price of one unit of the item or the {@code totalPrice} for the whole {@code amount}.<br>
     *
     * @param amount How many of this item are considered for the {@code totalPrice}<br>
     *
     * @param priceType If set to {@code true}, {@code price} is assigned to the {@code totalPrice} of the item and the {@code price} attribute is calculated by dividing {@code totalPrice} by {@code amount}.<br>
     *                  If set to {@code false} {@code price} is assigned to the {@code price} of the item and the {@code totalPrice} attribute is calculated by multiplying {@code price} by {@code amount}.
     */
    public ShopItem(String itemName, float price, int amount, boolean priceType) {
        this.itemName = itemName;
        this.amount = amount;
        if(priceType) {
            this.totalPrice = price;
            updatePrice();
        } else {
            this.price = price;
            updateTotalPrice();
        }
        
    }
    
    /**
     * Generates a copy of the {@code ShopItem} passed as a parameter.
     *
     * @param item The item to copy.
     */
    public ShopItem(ShopItem item) {
        this.itemName = item.getItemName();
        this.price = item.getPrice();
        this.totalPrice = item.getTotalPrice();
        this.amount = item.getAmount();
        this.buyers.putAll(item.getBuyersMap());
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                  GETTERS
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    public String getItemName() {
        return itemName;
    }
    
    public float getTotalPrice() {
        return totalPrice;
    }
    
    public float getPrice() {
        return price;
    }
    
    public int getAmount() {
        return amount;
    }
    
    public List<String> getBuyers() {
        return buyers.keySet().stream().toList();
    }
    
    public Map<String, Integer> getBuyersMap() { return buyers; }
    
    public String getBuyersString() {
        return String.join(", ", buyers.keySet());
    }
    
    public String getBuyersString(String customDelimiter) {
        return String.join(customDelimiter, buyers.keySet());
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
                this.buyers.put("A", this.amount);
                this.buyers.put("D", this.amount);
            }
            case "3" -> {
                this.buyers.put("A", this.amount);
                this.buyers.put("D", this.amount);
                this.buyers.put("G", this.amount);
            }
            default -> {
                StringTokenizer st = new StringTokenizer(buyers);
                String buyer;
                while(st.hasMoreTokens()) {
                    buyer = st.nextToken().toUpperCase();
                    
                    if(this.buyers.containsKey(buyer)) {
                        this.buyers.merge(buyer, 1, Integer::sum);
                    } else this.buyers.put(buyer, this.amount);
                    
                }
            }
        }
        //this.getBuyers().sort(String::compareTo);
    }
    
    private void setPrice(float price) {
        this.price = Math.round(price * 100) / 100f;
        updateTotalPrice();
    }
    
    public void setPrice(String price) {
        float priceFloat = Float.parseFloat(price);
        setPrice(priceFloat);
    }
    
    public void setTotalPrice(float totalPrice) {
        this.totalPrice = Math.round(totalPrice * 100) / 100f;
        updatePrice();
    }
    
    public void setTotalPrice(String totalPrice) {
        float totalPriceFloat = Float.parseFloat(totalPrice);
        setTotalPrice(totalPriceFloat);
    }
    
    public void setAmount(int newAmount) {
        this.amount = newAmount;
        updateTotalPrice();
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                  MISCELANEOUS
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    public void incrementAmount() {
        this.amount++;
        this.totalPrice += this.price;
    }
    
    public void addToTotalPrice(float f) {
        this.totalPrice += f;
        updatePrice();
    }
    
    public void addToPrice(float f) {
        this.price += f;
        updateTotalPrice();
    }
    
    public void mergeEquals(ShopItem other) {
        if(!this.equals(other)) throw new AssertionError("Objects not equal");
        this.setAmount(this.amount + other.getAmount());
        for(String buyer : other.buyers.keySet()) {
            this.buyers.merge(buyer, other.buyers.get(buyer), Integer::sum);
        }
    }
    
    /**
    * Two {@code ShopItem} objects are considered equals when their name and their cost of one unit are the same.<br>
     * So when both their {@code itemName} attribute and {@code price} are equals.
    */
    public boolean equals(ShopItem item2) {
        return this.itemName.equals(item2.itemName) && this.price == item2.price;
    }
    
    public String toTSV() {
        StringBuilder sb = new StringBuilder();
        sb.append(itemName + "\t" + totalPrice + "\t" + amount + "\t");
        for(String buyer : buyers.keySet()) {
            sb.append(buyer + " ");
        }
        return sb.toString();
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                  PRIVATE
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    
    /**
     * Updates the {@code price} attribute by dividing {@code totalPrice} by {@code amount}.<br>
     * Is used whenever the {@code totalPrice} attribute is changed to maintain coherent the relation with the {@code price} attribute.
     */
    private void updatePrice() {
        this.price = Math.round((this.totalPrice / this.amount) * 100) / 100f;
    }
    
    /**
     * Updates the {@code totalPrice} attribute by multiplying {@code price} by {@code amount}.<br>
     * Is used whenever the {@code price} attribute is changed to maintain coherent the relation with the {@code totalPrice} attribute.
     */
    private void updateTotalPrice() {
        float newTotalPrice = Math.round((this.price * this.amount) * 100) / 100f;
        if(Math.abs(newTotalPrice - this.totalPrice) >= this.price) {
            this.totalPrice = newTotalPrice;
        }
    }
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                  OVERRIDES
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(amount + " - " + itemName + " -> " + String.format("%.2f", totalPrice) + "€");
        if(!buyers.isEmpty()) {
            sb.append("\n\nComprato da: ");
            for(String buyer : buyers.keySet()) {
                sb.append(buyer + " ");
            }
        }
        return sb.toString();
    }

    @Override
    public boolean equals(Object obj) {
        if(obj instanceof ShopItem other) {
            return this.itemName.equals(other.getItemName()) && this.price == other.price;
        }
        return false;
    }
}