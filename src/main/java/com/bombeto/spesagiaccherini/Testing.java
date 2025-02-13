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
        
        FXMLLoader loader = new FXMLLoader(Testing.class.getResource("demo-root.fxml"));
        Parent root = loader.load();
        Controller controller = loader.getController();
        controller.setStage(stage);
        Scene scene = new Scene(root, 2000, 1000);
        scene.getStylesheets().add(Objects.requireNonNull(getClass().getResource("stylesheet.css")).toExternalForm());
        
        Image icon = new Image(Objects.requireNonNull(Testing.class.getResource("media/icon.png")).toURI().toString());
        stage.getIcons().add(icon);
        stage.setTitle("La Spesa Giacchevini");
        stage.setScene(scene);
        stage.show();
    }
    
    public static void main(String[] args) {
        launch(args);
    }
}
