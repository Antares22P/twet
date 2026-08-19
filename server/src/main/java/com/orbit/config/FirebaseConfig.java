package com.orbit.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.FirebaseDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${orbit.firebase.database-url}")
    private String databaseUrl;

    @Value("${orbit.firebase.service-account-path:}")
    private String serviceAccountPath;

    @Bean
    public FirebaseDatabase firebaseDatabase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseDatabase.getInstance();
        }

        if (serviceAccountPath != null && !serviceAccountPath.trim().isEmpty()) {
            File saFile = new File(serviceAccountPath);
            if (saFile.exists()) {
                try (FileInputStream serviceAccount = new FileInputStream(saFile)) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setDatabaseUrl(databaseUrl)
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    FirebaseApp app = FirebaseApp.initializeApp(options);
                    log.info("Firebase Admin SDK initialized with service account for URL: {}", databaseUrl);
                    return FirebaseDatabase.getInstance(app);
                } catch (Exception e) {
                    log.warn("Failed to initialize Firebase with service account: {}", e.getMessage());
                }
            } else {
                log.info("Service account file not found at {}. Firebase operations will use client-side RTDB & proxy mode.", serviceAccountPath);
            }
        } else {
            log.info("Firebase service account path not specified. Backend is operating in proxy/routing mode with client-side RTDB integration.");
        }

        return null;
    }
}
