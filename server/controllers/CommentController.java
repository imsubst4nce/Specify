package server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import server.database.CommentRepository;
import server.database.ProjectRepository;
import server.database.UserRepository;
import server.domainmodel.Comment;
import server.domainmodel.Project;
import server.domainmodel.User;

import java.util.*;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

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

    @GetMapping("/{targetType}/{targetId}")
    public ResponseEntity<List<Comment>> getComments(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("targetType") String targetType,
            @PathVariable("targetId") String targetId) {

        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!targetType.equalsIgnoreCase("usecase") && !targetType.equalsIgnoreCase("crccard")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        List<Comment> comments = commentRepository.findByTargetTypeAndTargetIdOrderByCreatedAtAsc(targetType.toLowerCase(), targetId);

        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody Comment commentPayload) {

        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String projectId = commentPayload.getProjectId();
        if (projectId == null || !hasAccess(user, projectId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String type = commentPayload.getTargetType();
        if (type == null || (!type.equalsIgnoreCase("usecase") && !type.equalsIgnoreCase("crccard"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (commentPayload.getText() == null || commentPayload.getText().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String id = UUID.randomUUID().toString().substring(0, 9);
        commentPayload.setId(id);
        commentPayload.setUserId(user.getId());
        commentPayload.setUserName(user.getName());

        Comment saved = commentRepository.save(commentPayload);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable("id") String id) {

        User user = resolveUser(tokenHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Comment> opt = commentRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Comment comment = opt.get();
        if (!comment.getUserId().equals(user.getId())) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Only the author of this comment can delete it");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        commentRepository.deleteById(id);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Comment deleted successfully");
        return ResponseEntity.ok(res);
    }
}
