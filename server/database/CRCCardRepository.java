package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.CRCCard;
import java.util.List;

/**
 * Spring Data JPA Repository interface managing CRC index cards.
 */
@Repository
public interface CRCCardRepository extends JpaRepository<CRCCard, String> {
    
    // Retrieve cards associated with an active workspace dossier
    List<CRCCard> findByProjectId(String projectId);
}
