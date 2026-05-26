package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.CRCCard;
import java.util.List;

@Repository
public interface CRCCardRepository extends JpaRepository<CRCCard, String> {
    List<CRCCard> findByProjectId(String projectId);
}
