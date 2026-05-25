package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.Project;
import java.util.List;

/**
 * Spring Data JPA Repository interface mapping Project domain objects to the database table.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
     
    // Find all projects owned by a specific userId
    List<Project> findByOwnerId(String ownerId);
    
    // Find projects where user is listed under shared collaborators
    List<Project> findBySharedWithContaining(String email);
}
