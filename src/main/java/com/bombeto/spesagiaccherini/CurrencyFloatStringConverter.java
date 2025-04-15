package com.bombeto.spesagiaccherini;

import javafx.util.converter.FloatStringConverter;

public class CurrencyFloatStringConverter extends FloatStringConverter {
    
    String currency;
    
    public CurrencyFloatStringConverter(String currency) {
        this.currency = currency;
    }
    
    @Override
    public String toString(Float value) {
        String str = super.toString(value);
        if(str.length() - str.indexOf(".") == 2) str = str + "0";
        if(currency != null) return str + " " + currency;
        else return str;
    }
}
