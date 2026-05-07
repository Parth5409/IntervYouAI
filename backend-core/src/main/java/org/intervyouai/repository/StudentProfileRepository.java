package org.intervyouai.repository;

import org.intervyouai.model.StudentProfile;
import org.intervyouai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    Optional<StudentProfile> findByUser(User user);
    
    Optional<StudentProfile> findByUserId(UUID userId);

    List<StudentProfile> findByUserOrganizationId(UUID orgId);

    long countByUserOrganizationId(UUID orgId);

    @Query("SELECT s FROM StudentProfile s WHERE s.user.organization.id = :orgId AND (:minCgpa IS NULL OR s.currentCgpa >= :minCgpa)")
    List<StudentProfile> findEligibleStudents(@Param("orgId") UUID orgId, @Param("minCgpa") BigDecimal minCgpa);

    @Query("SELECT s FROM StudentProfile s WHERE s.resumeUrl IS NOT NULL AND (s.skills IS EMPTY)")
    List<StudentProfile> findProfilesNeedingBackfill();
}
