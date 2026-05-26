package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import server.database.CRCCardRepository;
import server.database.ProjectRepository;
import server.database.UseCaseRepository;
import server.database.UserRepository;
import server.domainmodel.CRCCard;
import server.domainmodel.Project;
import server.domainmodel.UseCase;
import server.domainmodel.User;
import server.services.DiagramGeneratorService;

import java.util.*;

@RestController
@RequestMapping("/api/projects/{projectId}/diagrams")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class DiagramController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UseCaseRepository useCaseRepository;

    @Autowired
    private CRCCardRepository crcCardRepository;

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

    @GetMapping("/usecases")
    public ResponseEntity<Map<String, String>> getUseCaseDiagram(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @RequestParam(value = "tool", defaultValue = "plantuml") String tool) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<UseCase> useCases = useCaseRepository.findByProjectId(projectId);
        DiagramGeneratorService.UseCaseScriptStrategy strategy = DiagramGeneratorService.getUseCaseStrategy(tool);
        String compiledScript = strategy.generate(useCases);

        Map<String, String> response = new HashMap<>();
        response.put("tool", tool);
        response.put("script", compiledScript);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/classes")
    public ResponseEntity<Map<String, String>> getClassDiagram(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("projectId") String projectId,
            @RequestParam(value = "tool", defaultValue = "plantuml") String tool) {

        User user = resolveUser(tokenHeader);
        if (user == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<CRCCard> crcCards = crcCardRepository.findByProjectId(projectId);
        
        StringBuilder sb = new StringBuilder();
        if ("plantuml".equalsIgnoreCase(tool)) {
            sb.append("@startuml\n' Class / CRC Card Diagram\n\n");
            for (CRCCard card : crcCards) {
                String safeClass = card.getClassName().replaceAll("[^a-zA-Z0-9]", "_");
                sb.append("class ").append(safeClass).append(" {\n");
                for (String resp : card.getResponsibilities()) {
                    sb.append("  ").append(resp).append("\n");
                }
                sb.append("}\n");
                for (String coll : card.getCollaborators()) {
                    if (coll != null && !coll.trim().isEmpty()) {
                        String safeColl = coll.trim().replaceAll("[^a-zA-Z0-9]", "_");
                        sb.append(safeClass).append(" ..> ").append(safeColl).append(" : collaborates\n");
                    }
                }
                sb.append("\n");
            }
            sb.append("@endum\n");
        } else {
            sb.append("// Nomnoml CRC Diagram\n");
            for (CRCCard card : crcCards) {
                String safeClass = card.getClassName().replaceAll("[^a-zA-Z0-9]", "_");
                sb.append("[").append(safeClass).append("|");
                for (String resp : card.getResponsibilities()) {
                    sb.append(resp).append(";");
                }
                sb.append("]\n");
                for (String coll : card.getCollaborators()) {
                    if (coll != null && !coll.trim().isEmpty()) {
                        String safeColl = coll.trim().replaceAll("[^a-zA-Z0-9]", "_");
                        sb.append("[").append(safeClass).append("] -> [").append(safeColl).append("]\n");
                    }
                }
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("tool", tool);
        response.put("script", sb.toString());

        return ResponseEntity.ok(response);
    }
}