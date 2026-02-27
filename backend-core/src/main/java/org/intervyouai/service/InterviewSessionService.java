package org.intervyouai.service;

import org.intervyouai.dto.CreateSessionRequest;
import org.intervyouai.dto.InterviewSessionResponse;
import org.intervyouai.model.InterviewSession;
import org.intervyouai.model.PlacementDrive;
import org.intervyouai.model.User;
import org.intervyouai.repository.InterviewSessionRepository;
import org.intervyouai.repository.PlacementDriveRepository;
import org.intervyouai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InterviewSessionService {

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public InterviewSessionResponse createSession(UUID studentId, CreateSessionRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        PlacementDrive drive = driveRepository.findById(request.getDriveId())
                .orElseThrow(() -> new RuntimeException("Drive not found"));

        // Verify Student eligibility (basic check: same organization)
        if (!student.getOrganization().getId().equals(drive.getTpo().getOrganization().getId())) {
            throw new RuntimeException("You are not eligible for this drive (Different Organization)");
        }

        InterviewSession session = InterviewSession.builder()
                .student(student)
                .drive(drive)
                .overallScore(0) // Initial score
                .build();

        session = sessionRepository.save(session);

        return InterviewSessionResponse.builder()
                .sessionId(session.getId())
                .status("CREATED")
                .companyName(drive.getCompanyName())
                .build();
    }

    public InterviewSessionResponse getSessionById(UUID sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return InterviewSessionResponse.builder()
                .sessionId(session.getId())
                .status(session.getStatus() != null ? session.getStatus().name() : "CREATED")
                .companyName(session.getDrive().getCompanyName())
                .build();
    }
}
