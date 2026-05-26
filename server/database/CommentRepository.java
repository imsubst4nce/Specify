package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.Comment;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByTargetTypeAndTargetIdOrderByCreatedAtAsc(String targetType, String targetId);
    void deleteByProjectId(String projectId);
}
