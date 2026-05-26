package server.domainmodel;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.FetchType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "crc_cards")
public class CRCCard {

    @Id
    @Column(nullable = false, unique = true)
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "crc_card_responsibilities", joinColumns = @JoinColumn(name = "crc_card_id"))
    @Column(name = "responsibility", columnDefinition = "TEXT")
    private List<String> responsibilities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "crc_card_collaborators", joinColumns = @JoinColumn(name = "crc_card_id"))
    @Column(name = "collaborator_name")
    private List<String> collaborators = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "crc_card_linked_usecases", joinColumns = @JoinColumn(name = "crc_card_id"))
    @Column(name = "usecase_id")
    private List<String> linkedUseCaseIds = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public CRCCard() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }

    public List<String> getCollaborators() { return collaborators; }
    public void setCollaborators(List<String> collaborators) { this.collaborators = collaborators; }

    public List<String> getLinkedUseCaseIds() { return linkedUseCaseIds; }
    public void setLinkedUseCaseIds(List<String> linkedUseCaseIds) { this.linkedUseCaseIds = linkedUseCaseIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
