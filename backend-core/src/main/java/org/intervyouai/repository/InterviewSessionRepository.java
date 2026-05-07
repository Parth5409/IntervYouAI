package org.intervyouai.repository;

import org.intervyouai.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
    List<InterviewSession> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<InterviewSession> findByStudentOrganizationId(UUID organizationId);
}
