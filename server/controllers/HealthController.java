package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class HealthController {

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "ok");

        if (dataSource != null) {
            try (Connection c = dataSource.getConnection()) {
                boolean valid = c.isValid(2);
                res.put("dbConnected", valid);
                res.put("db", valid ? "connected" : "unresponsive");
            } catch (Exception e) {
                res.put("dbConnected", false);
                res.put("dbError", e.getMessage());
            }
        } else {
            res.put("dbConnected", "unknown");
            res.put("db", "no-datasource-configured");
        }

        return ResponseEntity.ok(res);
    }
}
