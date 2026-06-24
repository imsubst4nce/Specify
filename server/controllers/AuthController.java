package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import server.database.UserRepository;
import server.domainmodel.User;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

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

        String passwordHash = passwordEncoder.encode(password);
        String userId = UUID.randomUUID().toString().substring(0, 9);
        User newUser = new User(userId, name, email, passwordHash);

        userRepository.save(newUser);

        response.put("message", "User registered successfully");
        response.put("user", newUser);
        response.put("token", userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

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
        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.put("message", "Login successful");
        response.put("user", user);
        response.put("token", user.getId());

        return ResponseEntity.ok(response);
    }

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
                result.add(m);
            }
        }
        return ResponseEntity.ok(result);
    }

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

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            response.put("error", "Incorrect current password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");

        if (name != null) user.setName(name);
        if (email != null && !email.equalsIgnoreCase(user.getEmail())) {
            Optional<User> existingEmail = userRepository.findByEmail(email);
            if (existingEmail.isPresent()) {
                response.put("error", "Email is already taken by another user");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            user.setEmail(email);
        }
        if (password != null && !password.trim().isEmpty()) {
            String newHash = passwordEncoder.encode(password);
            user.setPassword(newHash);
        }

        userRepository.save(user);

        response.put("message", "Profile updated successfully");
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Map<String, Object>> deleteProfile(
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
            response.put("error", "Current password is required to delete profile");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            response.put("error", "Incorrect current password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        userRepository.delete(user);
        response.put("message", "Profile deleted successfully");
        return ResponseEntity.ok(response);
    }
}