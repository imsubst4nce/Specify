package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import server.database.UserRepository;
import server.domainmodel.User;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

/**
 * Spring REST Controller managing user registration, secure session logins, and profile revisions.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Handles User Session Sign Up / Account definition (US1)
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");

        Map<String, Object> response = new HashMap<>();

        if (name == null || email == null || password == null) {
            response.put("error", "Name, email and password are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            response.put("error", "A user with this email already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Standard mock BCrypt representation: simple base64 hash matching client expectation
        String passwordHash = Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8));
        String userId = UUID.randomUUID().toString().substring(0, 9);
        User newUser = new User(userId, name, email, passwordHash, null);

        userRepository.save(newUser);

        response.put("message", "User registered successfully");
        response.put("user", newUser);
        response.put("token", userId); // Simple token based on generated userId

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Handles User Session Logins
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        Map<String, Object> response = new HashMap<>();

        if (email == null || password == null) {
            response.put("error", "Email and password are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        User user = userOpt.get();
        String incomingHash = Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8));
        if (!user.getPassword().equals(incomingHash)) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.put("message", "Login successful");
        response.put("user", user);
        response.put("token", user.getId());

        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves currently authenticated session context
     */
    @GetMapping("/me")
    public ResponseEntity<User> getMe(@RequestHeader("Authorization") String tokenHeader) {
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = tokenHeader.substring(7);
        Optional<User> user = userRepository.findById(userId);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /**
     * Retrieves a list of all registered users as potential teammates (excluding current user)
     */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, String>>> listAllUsers(@RequestHeader("Authorization") String tokenHeader) {
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String currentUserId = tokenHeader.substring(7);
        if (!userRepository.existsById(currentUserId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<User> allUsers = userRepository.findAll();
        List<Map<String, String>> result = new ArrayList<>();
        for (User u : allUsers) {
            if (!u.getId().equals(currentUserId)) {
                Map<String, String> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("name", u.getName());
                m.put("email", u.getEmail());
                m.put("avatarUrl", u.getAvatarUrl());
                result.add(m);
            }
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Handles User Profile revisions (US2)
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody Map<String, String> payload) {

        Map<String, Object> response = new HashMap<>();

        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            response.put("error", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String userId = tokenHeader.substring(7);
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            response.put("error", "User session invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User user = userOpt.get();
        String currentPassword = payload.get("currentPassword");
        if (currentPassword == null) {
            response.put("error", "Current password is required for verification");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String currentHash = Base64.getEncoder().encodeToString(currentPassword.getBytes(StandardCharsets.UTF_8));
        if (!user.getPassword().equals(currentHash)) {
            response.put("error", "Incorrect current password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String name = payload.get("name");
        String email = payload.get("email");
        String avatarUrl = payload.get("avatarUrl");
        String password = payload.get("password");

        if (name != null) user.setName(name);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        if (email != null && !email.equalsIgnoreCase(user.getEmail())) {
            Optional<User> existingEmail = userRepository.findByEmail(email);
            if (existingEmail.isPresent()) {
                response.put("error", "Email is already taken by another user");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            user.setEmail(email);
        }
        if (password != null && !password.trim().isEmpty()) {
            String newHash = Base64.getEncoder().encodeToString(password.getBytes(StandardCharsets.UTF_8));
            user.setPassword(newHash);
        }

        userRepository.save(user);

        response.put("message", "Profile updated successfully");
        response.put("user", user);

        return ResponseEntity.ok(response);
    }
}