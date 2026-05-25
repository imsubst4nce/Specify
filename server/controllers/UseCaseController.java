package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import server.database.ProjectRepository;
import server.database.UseCaseRepository;
import server.database.UserRepository;
import server.domainmodel.Project;
import server.domainmodel.UseCase;
import server.domainmodel.User;

import java.util.*;

/**
 * Spring REST Controller managing Use Case specifications in projects.
 */
@RestController
@RequestMapping("/api/projects/{projectId}/usecases")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UseCaseController {

    @Autowired
    private UseCaseRepository useCaseRepository;

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

    private boolean hasAccess(User user, String projectId) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return false;
        Project p = projectOpt.get();
        return p.getOwnerId().equals(user.getId()) || 
               p.getSharedWith().stream().anyMatch(email -> email.equalsIgnoreCase(user.getEmail()));
    }

    @GetMapping
    public ResponseEntity<List<UseCase>> getUseCases(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(useCaseRepository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<UseCase> createUseCase(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @RequestBody UseCase useCasePayload) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (useCasePayload.getTitle() == null || useCasePayload.getTitle().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String id = UUID.randomUUID().toString().substring(0, 9);
        useCasePayload.setId(id);
        useCasePayload.setProjectId(projectId);
        if (useCasePayload.getActors() == null) useCasePayload.setActors(new ArrayList<>());
        if (useCasePayload.getMainFlow() == null) useCasePayload.setMainFlow(new ArrayList<>());

        UseCase saved = useCaseRepository.save(useCasePayload);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UseCase> updateUseCase(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @PathVariable("id") String id,
            @RequestBody UseCase useCasePayload) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<UseCase> opt = useCaseRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        UseCase uc = opt.get();
        if (useCasePayload.getTitle() != null) uc.setTitle(useCasePayload.getTitle());
        if (useCasePayload.getActors() != null) uc.setActors(useCasePayload.getActors());
        if (useCasePayload.getPreconditions() != null) uc.setPreconditions(useCasePayload.getPreconditions());
        if (useCasePayload.getMainFlow() != null) uc.setMainFlow(useCasePayload.getMainFlow());
        if (useCasePayload.getPostconditions() != null) uc.setPostconditions(useCasePayload.getPostconditions());

        UseCase saved = useCaseRepository.save(uc);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUseCase(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @PathVariable("id") String id) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!useCaseRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        useCaseRepository.deleteById(id);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Use case deleted successfully");
        return ResponseEntity.ok(res);
    }
}
