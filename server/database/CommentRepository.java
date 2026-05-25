package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.Comment;
import java.util.List;

/**
 * Spring Data JPA Repository interface managing collaborative board comments.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    
    // Retrieve comments mapped to specific usecase or crccard elements
    List<Comment> findByTargetTypeAndTargetIdOrderByCreatedAtAsc(String targetType, String targetId);
    
    // Cascade-delete comments when a project dossier is deleted
    void deleteByProjectId(String projectId);
}
