package org.intervyouai.repository;

import org.intervyouai.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, UUID> {
    List<PlacementDrive> findByTpoId(UUID tpoId);
    List<PlacementDrive> findByTpoOrganizationId(UUID organizationId);
    long countByTpoOrganizationId(UUID organizationId);

    @Query("SELECT d FROM PlacementDrive d WHERE d.tpo.organization.id = :orgId AND (d.minCgpa IS NULL OR d.minCgpa <= :cgpa)")
    List<PlacementDrive> findEligibleDrives(@Param("orgId") UUID orgId, @Param("cgpa") BigDecimal cgpa);
}
