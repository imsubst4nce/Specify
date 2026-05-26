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
@Table(name = "use_cases")
public class UseCase {

    @Id
    @Column(nullable = false, unique = true)
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(nullable = false)
    private String title;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "use_case_actors", joinColumns = @JoinColumn(name = "use_case_id"))
    @Column(name = "actor_name")
    private List<String> actors = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String preconditions;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "use_case_main_flow", joinColumns = @JoinColumn(name = "use_case_id"))
    @Column(name = "flow_step", columnDefinition = "TEXT")
    @OrderColumn(name = "step_index")
    private List<String> mainFlow = new ArrayList<>();

    @Column(name = "postconditions", columnDefinition = "TEXT")
    private String postconditions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public UseCase() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getActors() { return actors; }
    public void setActors(List<String> actors) { this.actors = actors; }

    public String getPreconditions() { return preconditions; }
    public void setPreconditions(String preconditions) { this.preconditions = preconditions; }

    public List<String> getMainFlow() { return mainFlow; }
    public void setMainFlow(List<String> mainFlow) { this.mainFlow = mainFlow; }

    public String getPostconditions() { return postconditions; }
    public void setPostconditions(String postconditions) { this.postconditions = postconditions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
