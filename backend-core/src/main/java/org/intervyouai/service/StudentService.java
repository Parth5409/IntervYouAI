package org.intervyouai.service;

import org.intervyouai.dto.StudentProfileRequest;
import org.intervyouai.dto.StudentResponse;
import org.intervyouai.model.StudentProfile;
import org.intervyouai.model.User;
import org.intervyouai.repository.StudentProfileRepository;
import org.intervyouai.repository.UserRepository;
import org.intervyouai.dto.BulkStudentDTO;
import org.intervyouai.model.Organization;
import org.intervyouai.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

@Service
public class StudentService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Transactional
    public void uploadResume(UUID userId, String resumeUrl, String resumeFilename) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    StudentProfile newProfile = StudentProfile.builder()
                            .user(user)
                            .build();
                    return studentProfileRepository.save(newProfile);
                });

        profile.setResumeUrl(resumeUrl);
        profile.setResumeFilename(resumeFilename);
        studentProfileRepository.save(profile);

        // Trigger AI processing
        kafkaProducerService.publishResumeUploadedEvent(
                org.intervyouai.dto.event.ResumeUploadedEvent.builder()
                        .studentId(userId)
                        .resumeUrl(resumeUrl)
                        .build()
        );
    }

    @Transactional
    public List<StudentResponse> bulkImportStudents(UUID tpoId, List<BulkStudentDTO> students) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        Organization org = tpo.getOrganization();

        List<StudentResponse> createdProfiles = new ArrayList<>();

        for (BulkStudentDTO dto : students) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                continue; // Skip existing emails or handle update
            }

            // Generate default password (e.g., ST<CODE><PRN>)
            String defaultPassword = "ST" + org.getCode().toUpperCase() + dto.getPrn();

            User user = User.builder()
                    .email(dto.getEmail())
                    .fullName(dto.getFullName())
                    .password(passwordEncoder.encode(defaultPassword))
                    .role(UserRole.STUDENT)
                    .organization(org)
                    .isActive(true)
                    .build();
            
            user = userRepository.save(user);

            StudentProfile profile = StudentProfile.builder()
                    .user(user)
                    .prn(dto.getPrn())
                    .branch(dto.getBranch())
                    .currentCgpa(dto.getCurrentCgpa())
                    .passingYear(dto.getPassingYear())
                    .build();

            createdProfiles.add(mapToResponse(studentProfileRepository.save(profile)));
        }
        return createdProfiles;
    }

    @Transactional
    public StudentResponse createProfile(UUID userId, StudentProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElse(new StudentProfile());
        
        profile.setUser(user);
        profile.setPrn(request.getPrn());
        profile.setBranch(request.getBranch());
        profile.setCurrentSemester(request.getCurrentSemester());
        profile.setCurrentCgpa(request.getCurrentCgpa());
        profile.setPassingYear(request.getPassingYear());
        profile.setSkills(request.getSkills());
        profile.setResumeUrl(request.getResumeUrl());
        profile.setResumeFilename(request.getResumeFilename());
        profile.setCareerGoal(request.getCareerGoal());

        return mapToResponse(studentProfileRepository.save(profile));
    }

    public StudentResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToResponse(profile);
    }

    public List<StudentResponse> getAllStudentsByTpoOrganization(UUID tpoId) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        return studentProfileRepository.findByUserOrganizationId(tpo.getOrganization().getId()).stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteStudent(UUID tpoId, UUID profileId) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        if (!profile.getUser().getOrganization().getId().equals(tpo.getOrganization().getId())) {
            throw new RuntimeException("Unauthorized: Student belongs to another organization");
        }

        User studentUser = profile.getUser();
        studentProfileRepository.delete(profile);
        userRepository.delete(studentUser);
    }

    @Transactional
    public void bulkDeleteStudents(UUID tpoId, List<UUID> profileIds) {
        for (UUID profileId : profileIds) {
            deleteStudent(tpoId, profileId);
        }
    }

    @Transactional
    public StudentResponse updateStudent(UUID tpoId, UUID profileId, StudentProfileRequest request) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        if (!profile.getUser().getOrganization().getId().equals(tpo.getOrganization().getId())) {
            throw new RuntimeException("Unauthorized: Student belongs to another organization");
        }

        User studentUser = profile.getUser();
        // Update user-level fields if provided
        // For now we don't have fullName in StudentProfileRequest, let's assume it's just profile fields
        // or we could expand StudentProfileRequest to include fullName if needed.
        
        profile.setPrn(request.getPrn());
        profile.setBranch(request.getBranch());
        profile.setCurrentSemester(request.getCurrentSemester());
        profile.setCurrentCgpa(request.getCurrentCgpa());
        profile.setPassingYear(request.getPassingYear());
        profile.setSkills(request.getSkills());
        profile.setCareerGoal(request.getCareerGoal());

        return mapToResponse(studentProfileRepository.save(profile));
    }

    private StudentResponse mapToResponse(StudentProfile profile) {
        if (profile == null) return null;
        return StudentResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                .prn(profile.getPrn())
                .branch(profile.getBranch())
                .currentSemester(profile.getCurrentSemester())
                .currentCgpa(profile.getCurrentCgpa())
                .passingYear(profile.getPassingYear())
                .skills(profile.getSkills())
                .resumeUrl(profile.getResumeUrl())
                .resumeFilename(profile.getResumeFilename())
                .careerGoal(profile.getCareerGoal())
                .build();
    }
}
