package com.bombeto.spesagiaccherini;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FileHandler {
    
    private final File in;
    private File out;
    BufferedReader reader;
    String regex;
    
    public FileHandler() throws FileNotFoundException {
        in = new File(Objects.requireNonNull(FileHandler.class.getResource("spesa.txt")).getFile());
        if(!in.exists()) throw new RuntimeException("\n\nError: No input file found\n\n");
        out = new File("out_0.txt");
        for(int i = 1; out.exists(); i++){
            out = new File("out_"+i+".txt");
        }
        reader = new BufferedReader(new FileReader(in));
    }
    
    public FileHandler(File selectedFile) throws FileNotFoundException {
        in = selectedFile;
        if(!in.exists()) throw new RuntimeException("\n\nError: No input file found\n\n");
        out = new File("out_0.txt");
        for(int i = 1; out.exists(); i++){
            out = new File("out_"+i+".txt");
        }
        reader = new BufferedReader(new FileReader(in));
    }
    
    public List<ShopItem> getReceiptList_UNES() throws IOException {
        
        List<ShopItem> list = new ArrayList<>();
        ShopItem item;
        String line = reader.readLine();
        float f;
        
        while(line != null) {
            item = getNewEntry_UNES(line);
            line = reader.readLine();
            f = checkSale_UNES(line);
            if(item != null) {
                if(f != 0) item.addToCost(f);
                list.add(item);
            }
            
        }
        mergeDuplicates(list);
        return list;
    }
    
    public List<ShopItem> getReceiptList_EVERLI() throws IOException {
        
        List<ShopItem> list = new ArrayList<>();
        ShopItem item;
        
        while((item = getNewEntry_EVERLI()) != null) {
            list.add(item);
        }
        return list;
    }
    
    public void writeReceipt(List<ShopItem> list, float total) throws IOException {
        
        StringBuilder sb = new StringBuilder();
        File check = new File("receipt_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yy_HH-mm")) + ".tsv");
        
        sb.append("NOME\tPREZZO\tQUANTITÀ\tCOMPRATORI\n");
        
        for(ShopItem item : list){
            sb.append(item.toTSV() + "\n");
        }
        
        sb.append("TOTALE\t" + String.format("%.2f", total) + "\n");
        
        try (FileWriter writer = new FileWriter(check)) {
            writer.write(sb.toString());
        }
    }
    
    public void writeString(String str) throws IOException {
        try (FileWriter writer = new FileWriter(out)) {
            writer.write(str + "\n");
        }
    }
    
    private ShopItem getNewEntry_UNES(String line) {
        
        regex = "(.*)(\\s+[A-Z]\\s+)(\\d+(,|[.])\\d{2})\\s*$";
        
        if(!line.matches(regex)) return null;
        
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(line);
        
        if(matcher.find()) {
            String name = matcher.group(1);
            String price = matcher.group(3);
            price = price.replace(",", ".");
            return new ShopItem(name.strip(), Float.parseFloat(price));
        }
        else throw new RuntimeException("\n\nError: MissMatch\n\n");
    }
    
    private float checkSale_UNES(String line) {
        
        if(line == null) return 0;
        
        regex = "(.*)(-\\d+(,|[.])\\d{2})(-S)";
        
        if(!line.matches(regex)) return 0;
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(line);
        if(matcher.find()) {
            return Float.parseFloat(matcher.group(2).replace(",", "."));
        }
        else return 0;
    }
    
    private ShopItem getNewEntry_EVERLI() throws IOException {
        
        regex = "(\\d+)( Pieces? - )(.*)";
        String priceRegex = "(-)?(\\d{1,2})+(,|[.])?(\\d{1,2})?( €)$", line = reader.readLine(), itemName, temp;
        int amount;
        
        if(line == null) return null;
        
        while(!line.matches(regex)) {
            line = reader.readLine();
            if(line == null) return null;
        }
        
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(line);
        
        if(matcher.find()) {
            amount = Integer.parseInt(matcher.group(1));
            itemName = matcher.group(3);
        } else throw new RuntimeException("\n\nError: MissMatch\n\n");
        
        while(!line.matches(priceRegex)) {
            line = reader.readLine();
            if(line == null) return null;
        }
        
        // ! REMEMBER BECAUSE OF THIS YOU NEED ONE LINE BETWEEN THE PREVIOUS ITEM PRICE AND THE NEXT ITEM NAME !
        // * Possible fix, make the line variable an attribute and keep the last result saved.
        temp = reader.readLine();
        if(temp != null && temp.matches(priceRegex)) {
            line = temp;
        }
        
        line = line.replaceFirst("( €)", "");
        line = line.replaceFirst(",", ".");
        return new ShopItem(itemName, Float.parseFloat(line), amount);
    }
    
    public void mergeDuplicates(List<ShopItem> list) {
        for(int i = 0; i < list.size(); i++) {
            for(int j = i + 1; j < list.size(); j++) {
                if(list.get(i).equals(list.get(j))) {
                    list.remove(j);
                    list.get(i).incrementAmount();
                }
            }
        }
    }
}