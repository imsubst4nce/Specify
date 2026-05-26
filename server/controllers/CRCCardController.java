package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import server.database.CRCCardRepository;
import server.database.ProjectRepository;
import server.database.UserRepository;
import server.domainmodel.CRCCard;
import server.domainmodel.Project;
import server.domainmodel.User;

import java.util.*;

@RestController
@RequestMapping("/api/projects/{projectId}/crccards")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CRCCardController {

    @Autowired
    private CRCCardRepository crcCardRepository;

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
    public ResponseEntity<List<CRCCard>> getCRCCards(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(crcCardRepository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<CRCCard> createCRCCard(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @RequestBody CRCCard crcCardPayload) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (crcCardPayload.getClassName() == null || crcCardPayload.getClassName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String id = UUID.randomUUID().toString().substring(0, 9);
        crcCardPayload.setId(id);
        crcCardPayload.setProjectId(projectId);
        if (crcCardPayload.getResponsibilities() == null) crcCardPayload.setResponsibilities(new ArrayList<>());
        if (crcCardPayload.getCollaborators() == null) crcCardPayload.setCollaborators(new ArrayList<>());
        if (crcCardPayload.getLinkedUseCaseIds() == null) crcCardPayload.setLinkedUseCaseIds(new ArrayList<>());

        CRCCard saved = crcCardRepository.save(crcCardPayload);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CRCCard> updateCRCCard(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @PathVariable("id") String id,
            @RequestBody CRCCard crcCardPayload) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<CRCCard> opt = crcCardRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        CRCCard card = opt.get();
        if (crcCardPayload.getClassName() != null) card.setClassName(crcCardPayload.getClassName());
        if (crcCardPayload.getDescription() != null) card.setDescription(crcCardPayload.getDescription());
        if (crcCardPayload.getResponsibilities() != null) card.setResponsibilities(crcCardPayload.getResponsibilities());
        if (crcCardPayload.getCollaborators() != null) card.setCollaborators(crcCardPayload.getCollaborators());
        if (crcCardPayload.getLinkedUseCaseIds() != null) card.setLinkedUseCaseIds(crcCardPayload.getLinkedUseCaseIds());

        CRCCard saved = crcCardRepository.save(card);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCRCCard(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @PathVariable("id") String id) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<CRCCard> opt = crcCardRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        CRCCard card = opt.get();
        card.getResponsibilities().clear();
        card.getCollaborators().clear();
        card.getLinkedUseCaseIds().clear();
        crcCardRepository.saveAndFlush(card);

        crcCardRepository.delete(card);

        Map<String, String> res = new HashMap<>();
        res.put("message", "CRC Card deleted successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/link")
    public ResponseEntity<CRCCard> linkUseCases(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @PathVariable("id") String id,
            @RequestBody Map<String, List<String>> payload) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<CRCCard> opt = crcCardRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        CRCCard card = opt.get();
        List<String> useCaseIds = payload.get("linkedUseCaseIds");
        if (useCaseIds != null) {
            card.setLinkedUseCaseIds(useCaseIds);
            crcCardRepository.save(card);
        }

        return ResponseEntity.ok(card);
    }
}
