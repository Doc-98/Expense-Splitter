package com.bombeto.spesagiaccherini;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.File;
import java.net.URL;
import java.nio.file.Paths;
import java.util.Objects;

public class Testing extends Application {

    @Override
    public void start(Stage stage) throws Exception {
        
    
//        String str = Objects.requireNonNull(Testing.class.getResource("table-scene-root.fxml")).toString();
//
//        System.out.println();
//        System.out.println();
//        System.out.println(str);
//        System.out.println();
//        System.out.println();
        
        
        FXMLLoader loader = new FXMLLoader();
        Parent root = loader.load(Testing.class.getResourceAsStream("table-scene-root.fxml"));
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
