package org.intervyouai.service;

import org.intervyouai.dto.PlacementDriveRequest;
import org.intervyouai.dto.PlacementDriveResponse;
import org.intervyouai.model.PlacementDrive;
import org.intervyouai.model.User;
import org.intervyouai.repository.PlacementDriveRepository;
import org.intervyouai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
public class PlacementDriveService {

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiIntegrationService aiIntegrationService;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Autowired
    private org.intervyouai.repository.StudentProfileRepository studentProfileRepository;

    @Transactional
    public void assignDriveToStudents(UUID tpoId, UUID driveId) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));

        if (!drive.getTpo().getId().equals(tpoId)) {
            throw new RuntimeException("Unauthorized: You did not create this drive");
        }

        // Find all students in the same organization meeting the CGPA criteria
        UUID orgId = drive.getTpo().getOrganization().getId();
        List<org.intervyouai.model.StudentProfile> eligibleStudents = studentProfileRepository.findAll().stream()
                .filter(s -> s.getUser().getOrganization().getId().equals(orgId))
                .filter(s -> s.getCurrentCgpa() != null && BigDecimal.valueOf(s.getCurrentCgpa()).compareTo(drive.getMinCgpa()) >= 0)
                .collect(Collectors.toList());

        for (org.intervyouai.model.StudentProfile student : eligibleStudents) {
            kafkaProducerService.publishDriveAssignedEvent(
                    org.intervyouai.dto.event.DriveAssignedEvent.builder()
                            .driveId(driveId)
                            .studentId(student.getUser().getId())
                            .companyName(drive.getCompanyName())
                            .build()
            );
        }
    }

    @Transactional
    public PlacementDriveResponse createDrive(UUID tpoId, PlacementDriveRequest request) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));

        Set<String> skills = aiIntegrationService.extractSkillsFromJd(request.getJobDescription());

        PlacementDrive drive = PlacementDrive.builder()
                .tpo(tpo)
                .companyName(request.getCompanyName())
                .jobDescription(request.getJobDescription())
                .minCgpa(request.getMinCgpa())
                .skillsRequired(skills)
                .build();

        drive = placementDriveRepository.save(drive);

        return mapToResponse(drive);
    }

    public List<PlacementDriveResponse> getDrivesForTpo(UUID tpoId) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        
        return placementDriveRepository.findAll().stream() // Ideally filter by TPO or Organization
                .filter(drive -> drive.getTpo().getId().equals(tpoId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PlacementDriveResponse> getAvailableDrivesForStudent(UUID studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Return drives created by TPOs of the SAME Organization
        return placementDriveRepository.findAll().stream()
                .filter(drive -> drive.getTpo().getOrganization().getId().equals(student.getOrganization().getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PlacementDriveResponse mapToResponse(PlacementDrive drive) {
        return PlacementDriveResponse.builder()
                .id(drive.getId())
                .companyName(drive.getCompanyName())
                .jobDescription(drive.getJobDescription())
                .minCgpa(drive.getMinCgpa())
                .tpoName(drive.getTpo().getFullName())
                .createdAt(drive.getCreatedAt())
                .build();
    }
}
