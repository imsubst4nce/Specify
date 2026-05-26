package server;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;

/**
 * Main Entry Point class to boot up the Specify backend using standard executable Spring Boot.
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "server.database")
@EntityScan(basePackages = "server.domainmodel")
public class SpecifyApplication {

    public static void main(String[] args) {
        System.out.println("Starting Specify Requirements Workspace backend...");
        SpringApplication.run(SpecifyApplication.class, args);
    }

    @Bean
    public CommandLineRunner selfHealDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // Check and modify 'users' table
                List<String> userColumns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'",
                    String.class
                );
                if (userColumns.contains("password")) {
                    System.out.println("Applying database self-healing: Dropping obsolete column 'password' from 'users' table...");
                    jdbcTemplate.execute("ALTER TABLE users DROP COLUMN password");
                    System.out.println("Obsolete 'password' column dropped successfully.");
                }
                if (userColumns.contains("avatar_url")) {
                    System.out.println("Applying database self-healing: Modifying 'users.avatar_url' to LONGTEXT...");
                    jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL");
                    System.out.println("'users.avatar_url' column expanded to LONGTEXT.");
                }
            } catch (Exception e) {
                System.out.println("Self-healing users check error: " + e.getMessage());
            }

            try {
                // Check and modify 'comments' table
                List<String> commentColumns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments'",
                    String.class
                );
                if (commentColumns.contains("avatar_url")) {
                    System.out.println("Applying database self-healing: Modifying 'comments.avatar_url' to LONGTEXT...");
                    jdbcTemplate.execute("ALTER TABLE comments MODIFY COLUMN avatar_url LONGTEXT NULL");
                    System.out.println("'comments.avatar_url' column expanded to LONGTEXT.");
                }
            } catch (Exception e) {
                System.out.println("Self-healing comments check error: " + e.getMessage());
            }

            try {
                // Check and modify 'use_cases' table
                List<String> useCaseColumns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'use_cases'",
                    String.class
                );
                if (useCaseColumns.contains("main_flow")) {
                    System.out.println("Applying database self-healing: Dropping obsolete column 'main_flow' from 'use_cases' table...");
                    jdbcTemplate.execute("ALTER TABLE use_cases DROP COLUMN main_flow");
                    System.out.println("Obsolete 'main_flow' column dropped from 'use_cases' table.");
                }
                if (useCaseColumns.contains("actors")) {
                    System.out.println("Applying database self-healing: Dropping obsolete column 'actors' from 'use_cases' table...");
                    jdbcTemplate.execute("ALTER TABLE use_cases DROP COLUMN actors");
                    System.out.println("Obsolete 'actors' column dropped from 'use_cases' table.");
                }
            } catch (Exception e) {
                System.out.println("Self-healing use_cases check error: " + e.getMessage());
            }

            try {
                // Check and modify 'crc_cards' table
                List<String> crcColumns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crc_cards'",
                    String.class
                );
                if (crcColumns.contains("responsibilities")) {
                    System.out.println("Applying database self-healing: Dropping obsolete column 'responsibilities' from 'crc_cards' table...");
                    jdbcTemplate.execute("ALTER TABLE crc_cards DROP COLUMN responsibilities");
                    System.out.println("Obsolete 'responsibilities' column dropped from 'crc_cards' table.");
                }
                if (crcColumns.contains("collaborators")) {
                    System.out.println("Applying database self-healing: Dropping obsolete column 'collaborators' from 'crc_cards' table...");
                    jdbcTemplate.execute("ALTER TABLE crc_cards DROP COLUMN collaborators");
                    System.out.println("Obsolete 'collaborators' column dropped from 'crc_cards' table.");
                }
                if (crcColumns.contains("linked_use_case_ids")) {
                    System.out.println("Applying database self-healing: Dropping obsolete column 'linked_use_case_ids' from 'crc_cards' table...");
                    jdbcTemplate.execute("ALTER TABLE crc_cards DROP COLUMN linked_use_case_ids");
                    System.out.println("Obsolete 'linked_use_case_ids' column dropped from 'crc_cards' table.");
                }
            } catch (Exception e) {
                System.out.println("Self-healing crc_cards check error: " + e.getMessage());
            }
        };
    }
}