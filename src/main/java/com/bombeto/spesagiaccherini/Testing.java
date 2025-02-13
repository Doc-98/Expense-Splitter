package com.bombeto.spesagiaccherini.demo;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

public class Testing extends Application {
    
    @SuppressWarnings("DataFlowIssue")
    @Override
    public void start(Stage stage) throws Exception {
        
//        Parent root = FXMLLoader.load(getClass().getClassLoader().getResource("./demo-root.fxml"));
//        Scene scene = new Scene(root, Color.AQUA);
//
        FXMLLoader fxmlLoader = new FXMLLoader(Testing.class.getClassLoader().getResource("/demo-root.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 800, 600);

        Image icon = new Image("./icon.png");
        
        stage.getIcons().add(icon);
        stage.setTitle("La Spesa Giacchevini");
        stage.setScene(scene);
        stage.show();
    }
    
    public static void main(String[] args) {
        launch(args);
    }
}
