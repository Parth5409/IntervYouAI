package org.intervyouai.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "placement_drives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tpo_id", nullable = false)
    private User tpo;

    @NotBlank
    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @NotBlank
    @Column(name = "job_description", nullable = false, columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "min_cgpa", precision = 3, scale = 2)
    private BigDecimal minCgpa;

    @ElementCollection
    @CollectionTable(name = "drive_skills", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "skill")
    private Set<String> skillsRequired;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private DriveStatus status;

    public enum DriveStatus {
        DRAFT, ACTIVE, COMPLETED
    }
}
