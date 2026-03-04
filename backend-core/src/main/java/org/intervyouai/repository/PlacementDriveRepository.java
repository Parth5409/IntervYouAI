package org.intervyouai.repository;

import org.intervyouai.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, UUID> {
    
    @Query("SELECT d FROM PlacementDrive d WHERE d.tpo.id = :tpoId AND d.status <> 'ARCHIVED'")
    List<PlacementDrive> findByTpoId(@Param("tpoId") UUID tpoId);

    @Query("SELECT d FROM PlacementDrive d WHERE d.tpo.organization.id = :organizationId AND d.status <> 'ARCHIVED'")
    List<PlacementDrive> findByTpoOrganizationId(@Param("organizationId") UUID organizationId);

    @Query("SELECT COUNT(d) FROM PlacementDrive d WHERE d.tpo.organization.id = :organizationId AND d.status <> 'ARCHIVED'")
    long countByTpoOrganizationId(@Param("organizationId") UUID organizationId);

    @Query("SELECT d FROM PlacementDrive d WHERE d.tpo.organization.id = :orgId AND (d.minCgpa IS NULL OR d.minCgpa <= :cgpa) AND d.status <> 'ARCHIVED'")
    List<PlacementDrive> findEligibleDrives(@Param("orgId") UUID orgId, @Param("cgpa") BigDecimal cgpa);
}
