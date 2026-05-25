package server.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import server.domainmodel.User;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface managing User database transactions.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // Find active user account by unique secure email configuration
    Optional<User> findByEmail(String email);
}
