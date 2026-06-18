package server.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Spring initializer to load .env file into the application context
 */
public class DotenvPropertyInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            // Get the current working directory
            String currentDir = System.getProperty("user.dir");
            System.out.println("Current working directory: " + currentDir);
            
            // Look for .env file in config subdirectory
            Path envPath = Paths.get(currentDir, "config", ".env");
            
            Dotenv dotenv;
            
            if (Files.exists(envPath)) {
                System.out.println("Found .env file at: " + envPath.toAbsolutePath());
                // Load from the config directory
                dotenv = Dotenv.configure()
                        .directory(Paths.get(currentDir, "config").toString())
                        .load();
            } else {
                System.out.println("No .env file found at: " + envPath.toAbsolutePath());
                // Try loading from current directory if config/.env doesn't exist
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }

            // Convert dotenv properties to a Map
            Map<String, Object> properties = new HashMap<>();
            dotenv.entries().forEach(entry -> 
                properties.put(entry.getKey(), entry.getValue())
            );

            if (!properties.isEmpty()) {
                System.out.println("Loaded " + properties.size() + " properties from .env");
            }

            // Add to Spring's property sources
            MapPropertySource propertySource = new MapPropertySource("dotenv", properties);
            applicationContext.getEnvironment().getPropertySources().addFirst(propertySource);
        } catch (Exception e) {
            System.err.println("Error loading .env file: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
