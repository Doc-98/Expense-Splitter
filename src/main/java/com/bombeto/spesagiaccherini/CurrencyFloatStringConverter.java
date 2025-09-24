package com.bombeto.spesagiaccherini;

import javafx.util.converter.FloatStringConverter;

public class CurrencyFloatStringConverter extends FloatStringConverter {
    
    String currency;
    
    public CurrencyFloatStringConverter(String currency) {
        this.currency = currency;
    }

    @Override
    public Float fromString(String value) {

        // If the specified value is null or zero-length, return null
        if (value == null) {
            return null;
        }

        value = value.trim();

        if (value.isEmpty()) {
            return null;
        }

        value = value.replace(",", ".");
        value = value.replaceAll(" " + currency, "");

        try {
            return Float.valueOf(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    @Override
    public String toString(Float value) {
        String str = super.toString(value);
        if(str.length() - str.indexOf(".") == 2) str = str + "0";
        if(currency != null) return str + " " + currency;
        else return str;
    }
}
