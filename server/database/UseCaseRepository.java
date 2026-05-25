package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.UseCase;
import java.util.List;

/**
 * Spring Data JPA Repository interface managing UseCase specifications.
 */
@Repository
public interface UseCaseRepository extends JpaRepository<UseCase, String> {
    
    // List all use cases defined in a given requirements dossier
    List<UseCase> findByProjectId(String projectId);
}
