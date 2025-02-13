module com.bombeto.spesagiaccherini {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.desktop;
    
    
    opens com.bombeto.spesagiaccherini to javafx.fxml;
    exports com.bombeto.spesagiaccherini;
    
}