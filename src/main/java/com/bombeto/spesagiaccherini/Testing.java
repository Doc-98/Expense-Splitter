package com.bombeto.spesagiaccherini;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import javax.swing.*;
import java.net.URISyntaxException;
import java.util.Objects;

public class Testing extends Application {

    public static Image appIcon, aboutIcon;

    static {
            appIcon = new Image(Objects.requireNonNull(Testing.class.getResource("media/cg_logo_2.png")).toString());
            aboutIcon = new Image(Objects.requireNonNull(Testing.class.getResource("media/cg_logo_1.png")).toString());
    }

    @Override
    public void start(Stage stage) throws Exception {
        
        FXMLLoader loader = new FXMLLoader(Testing.class.getResource("table-scene-root.fxml"));
        Parent root = loader.load();
        Controller controller = loader.getController();
        controller.setStage(stage);
        Scene scene = new Scene(root);
        scene.getStylesheets().add(Objects.requireNonNull(getClass().getResource("stylesheet.css")).toExternalForm());

        stage.getIcons().add(appIcon);
        stage.setTitle("La Spesa Giacchevini");
        stage.setScene(scene);
        stage.show();
    }
    
    public static void main(String[] args) {
        launch(args);
    }
}
