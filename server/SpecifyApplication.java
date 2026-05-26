package server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main Class for the Specify backend using Spring Boot
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "server.database")
@EntityScan(basePackages = "server.domainmodel")
public class SpecifyApplication {

    public static void main(String[] args) {
        System.out.println("Starting Specify backend...");
        SpringApplication.run(SpecifyApplication.class, args);
    }
}