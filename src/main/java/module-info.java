module com.bombeto.spesagiaccherini {
    requires javafx.fxml;
    requires org.apache.pdfbox;
    requires org.controlsfx.controls;
    
    
    opens com.bombeto.spesagiaccherini to javafx.fxml;
    exports com.bombeto.spesagiaccherini;
}