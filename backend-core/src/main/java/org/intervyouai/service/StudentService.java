package org.intervyouai.service;

import org.intervyouai.dto.StudentProfileRequest;
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
    public void uploadResume(UUID userId, String resumeUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setResumeUrl(resumeUrl);
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
    public List<StudentProfile> bulkImportStudents(UUID tpoId, List<BulkStudentDTO> students) {
        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        Organization org = tpo.getOrganization();

        List<StudentProfile> createdProfiles = new ArrayList<>();

        for (BulkStudentDTO dto : students) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                continue; // Skip existing emails or handle update
            }

            // Generate default password (e.g., ST<CODE><PRN>)
            String defaultPassword = "ST" + org.getCode() + dto.getPrn();

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

            createdProfiles.add(studentProfileRepository.save(profile));
        }
        return createdProfiles;
    }

    public StudentProfile createProfile(UUID userId, StudentProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .prn(request.getPrn())
                .branch(request.getBranch())
                .currentSemester(request.getCurrentSemester())
                .currentCgpa(request.getCurrentCgpa())
                .passingYear(request.getPassingYear())
                .skills(request.getSkills())
                .resumeUrl(request.getResumeUrl())
                .careerGoal(request.getCareerGoal())
                .build();

        return studentProfileRepository.save(profile);
    }

    public StudentProfile getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}
