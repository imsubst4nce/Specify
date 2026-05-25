package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import server.database.ProjectRepository;
import server.database.UserRepository;
import server.domainmodel.Project;
import server.domainmodel.User;

import java.util.*;

/**
 * Spring REST Controller managing Projects CRUD operations and Team sharing invitations.
 */
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private User resolveUser(String tokenHeader) {
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = tokenHeader.substring(7);
        return userRepository.findById(token).orElse(null);
    }

    /**
     * Lists active user projects directories (US4)
     */
    @GetMapping
    public ResponseEntity<List<Project>> listProjects(@RequestHeader("Authorization") String tokenHeader) {
        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Get projects owned by the user
        List<Project> owned = projectRepository.findByOwnerId(user.getId());
        
        // Get projects shared with the user's email
        List<Project> shared = projectRepository.findBySharedWithContaining(user.getEmail().toLowerCase());

        Set<Project> allProjects = new LinkedHashSet<>(owned);
        allProjects.addAll(shared);

        return ResponseEntity.ok(new ArrayList<>(allProjects));
    }

    /**
     * Fetches details of a specific requirements project dossier
     */
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("id") String id) {

        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Project project = projectOpt.get();
        boolean isOwner = project.getOwnerId().equals(user.getId());
        boolean isCollaborator = project.getSharedWith().stream()
                .anyMatch(email -> email.equalsIgnoreCase(user.getEmail()));

        if (!isOwner && !isCollaborator) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(project);
    }

    /**
     * Creates new software dossier folder (US5)
     */
    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody Project projectRequest) {

        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (projectRequest.getName() == null || projectRequest.getName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String id = UUID.randomUUID().toString().substring(0, 9);
        Project newProject = new Project(id, projectRequest.getName(), projectRequest.getDescription(), user.getId());
        newProject.setSharedWith(new ArrayList<>());

        Project saved = projectRepository.save(newProject);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Safe Project Deletion & cascading workspace scrubbing (US6)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("id") String id) {

        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Project project = projectOpt.get();
        if (!project.getOwnerId().equals(user.getId())) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Only the owner can delete the project");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        projectRepository.deleteById(id);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Project deleted successfully");
        return ResponseEntity.ok(res);
    }

    /**
     * Shares project model access coordinates with collaboration email (US18)
     */
    @PostMapping("/{id}/share")
    public ResponseEntity<Map<String, Object>> shareProject(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("id") String id,
            @RequestBody Map<String, String> payload) {

        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Project project = projectOpt.get();
        if (!project.getOwnerId().equals(user.getId())) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Only the project owner can share this project");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        String recipientEmail = payload.get("email");
        Map<String, Object> response = new HashMap<>();

        if (recipientEmail == null || !recipientEmail.contains("@")) {
            response.put("error", "Valid teammate's email address is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (recipientEmail.equalsIgnoreCase(user.getEmail())) {
            response.put("error", "You cannot share the project with yourself");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        List<String> shares = project.getSharedWith();
        if (shares == null) {
            shares = new ArrayList<>();
        }

        if (shares.stream().anyMatch(e -> e.equalsIgnoreCase(recipientEmail))) {
            response.put("error", "Project is already shared with this teammate");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        shares.add(recipientEmail.toLowerCase());
        project.setSharedWith(shares);
        projectRepository.save(project);

        response.put("message", "Project shared successfully with " + recipientEmail);
        response.put("sharedWith", shares);

        return ResponseEntity.ok(response);
    }
}
