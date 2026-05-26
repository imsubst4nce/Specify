package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.UseCase;
import java.util.List;

@Repository
public interface UseCaseRepository extends JpaRepository<UseCase, String> {
    List<UseCase> findByProjectId(String projectId);
}
