package com.bombeto.spesagiaccherini;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import java.util.Objects;

public class Testing extends Application {

    @Override
    public void start(Stage stage) throws Exception {
        
//        String str = new PDFTextStripper().getText(Loader.loadPDF(new File("C:\\Users\\dvinc\\Downloads\\test.pdf")));
//
//        System.out.println(str);
        
        FXMLLoader loader = new FXMLLoader();
        Parent root = loader.load(Testing.class.getResourceAsStream("table-root.fxml"));
        Controller controller = loader.getController();
        controller.setStage(stage);
        Scene scene = new Scene(root);
        scene.getStylesheets().add(Objects.requireNonNull(getClass().getResource("stylesheet.css")).toExternalForm());

        stage.getIcons().add(new Image(Objects.requireNonNull(Testing.class.getResource("media/cg_logo_2.png")).toString()));
        stage.setTitle("La Spesa Giacchevini");
        stage.setScene(scene);
        stage.show();
    }
    
    public static void main(String[] args) {
        launch(args);
    }
}
