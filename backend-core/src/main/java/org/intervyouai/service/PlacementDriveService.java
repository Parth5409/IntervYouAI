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
    public void assignDriveToStudents(UUID tpoId, UUID driveId, List<UUID> specificStudentIds) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));

        if (!drive.getTpo().getId().equals(tpoId)) {
            throw new RuntimeException("Unauthorized: You did not create this drive");
        }

        List<UUID> studentIdsToAssign;
        if (specificStudentIds != null && !specificStudentIds.isEmpty()) {
            studentIdsToAssign = specificStudentIds;
        } else {
            // Fallback to all eligible students if no list provided
            UUID orgId = drive.getTpo().getOrganization().getId();
            studentIdsToAssign = studentProfileRepository.findEligibleStudents(orgId, drive.getMinCgpa()).stream()
                    .map(s -> s.getUser().getId())
                    .collect(Collectors.toList());
        }

        for (UUID studentId : studentIdsToAssign) {
            kafkaProducerService.publishDriveAssignedEvent(
                    org.intervyouai.dto.event.DriveAssignedEvent.builder()
                            .driveId(driveId)
                            .studentId(studentId)
                            .companyName(drive.getCompanyName())
                            .build()
            );
        }
    }

    public List<org.intervyouai.dto.EligibleStudentResponse> getEligibleStudentsWithMatching(UUID tpoId, UUID driveId) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));

        if (!drive.getTpo().getId().equals(tpoId)) {
            throw new RuntimeException("Unauthorized: You did not create this drive");
        }

        UUID orgId = drive.getTpo().getOrganization().getId();
        List<org.intervyouai.model.StudentProfile> eligibleStudents = studentProfileRepository.findEligibleStudents(orgId, drive.getMinCgpa());
        
        Set<String> requiredSkills = drive.getSkillsRequired() != null ? drive.getSkillsRequired() : Set.of();

        return eligibleStudents.stream().map(student -> {
            Set<String> studentSkills = student.getSkills() != null ? student.getSkills() : Set.of();
            
            Set<String> intersection = studentSkills.stream()
                    .filter(s -> requiredSkills.stream().anyMatch(rs -> rs.equalsIgnoreCase(s)))
                    .collect(Collectors.toSet());
            
            int matchPercentage = 0;
            if (!requiredSkills.isEmpty()) {
                matchPercentage = (int) ((double) intersection.size() / requiredSkills.size() * 100);
            }

            return org.intervyouai.dto.EligibleStudentResponse.builder()
                    .profileId(student.getId())
                    .userId(student.getUser().getId())
                    .fullName(student.getUser().getFullName())
                    .email(student.getUser().getEmail())
                    .currentCgpa(student.getCurrentCgpa())
                    .branch(student.getBranch())
                    .skills(studentSkills)
                    .matchPercentage(matchPercentage)
                    .matchedSkills(intersection)
                    .build();
        })
        .sorted((a, b) -> b.getMatchPercentage() - a.getMatchPercentage())
        .collect(Collectors.toList());
    }

    @Transactional
    public PlacementDriveResponse createDrive(UUID tpoId, PlacementDriveRequest request) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));

        Set<String> skills = request.getSkillsRequired();
        if (skills == null || skills.isEmpty()) {
            skills = aiIntegrationService.extractSkillsFromJd(request.getJobDescription());
        }

        PlacementDrive drive = PlacementDrive.builder()
                .tpo(tpo)
                .companyName(request.getCompanyName())
                .jobDescription(request.getJobDescription())
                .minCgpa(request.getMinCgpa())
                .minLpa(request.getMinLpa())
                .maxLpa(request.getMaxLpa())
                .activeModules(request.getActiveModules())
                .configJson(request.getConfigJson())
                .skillsRequired(skills)
                .status(PlacementDrive.DriveStatus.ACTIVE)
                .build();

        drive = placementDriveRepository.save(drive);

        return mapToResponse(drive);
    }

    public List<PlacementDriveResponse> getDrivesForTpo(UUID tpoId) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        
        return placementDriveRepository.findByTpoId(tpoId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PlacementDriveResponse> getAvailableDrivesForStudent(UUID studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        org.intervyouai.model.StudentProfile profile = studentProfileRepository.findByUser(student)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        BigDecimal cgpa = profile.getCurrentCgpa() != null ? profile.getCurrentCgpa() : BigDecimal.ZERO;

        // Return drives created by TPOs of the SAME Organization that meet the CGPA criteria
        return placementDriveRepository.findEligibleDrives(student.getOrganization().getId(), cgpa).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PlacementDriveResponse getDriveById(UUID driveId) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));
        return mapToResponse(drive);
    }

    public Set<String> extractSkillsFromJd(String jd) {
        return aiIntegrationService.extractSkillsFromJd(jd);
    }

    @Transactional
    public void deleteDrive(UUID tpoId, UUID driveId) {
        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() -> new org.intervyouai.exception.ResourceNotFoundException("Drive not found"));

        if (!drive.getTpo().getId().equals(tpoId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: You did not create this drive");
        }

        drive.setStatus(PlacementDrive.DriveStatus.ARCHIVED);
        placementDriveRepository.save(drive);
    }

    private PlacementDriveResponse mapToResponse(PlacementDrive drive) {
        return PlacementDriveResponse.builder()
                .id(drive.getId())
                .companyName(drive.getCompanyName())
                .jobDescription(drive.getJobDescription())
                .minCgpa(drive.getMinCgpa())
                .minLpa(drive.getMinLpa())
                .maxLpa(drive.getMaxLpa())
                .activeModules(drive.getActiveModules())
                .configJson(drive.getConfigJson())
                .tpoName(drive.getTpo().getFullName())
                .createdAt(drive.getCreatedAt())
                .status(drive.getStatus() != null ? drive.getStatus().name() : null)
                .build();
    }
}
