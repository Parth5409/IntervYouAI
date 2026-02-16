package org.intervyouai.controller;

import org.intervyouai.dto.GenericResponse;
import org.intervyouai.dto.UserResponse;
import org.intervyouai.model.StudentProfile;
import org.intervyouai.model.User;
import org.intervyouai.repository.StudentProfileRepository;
import org.intervyouai.repository.UserRepository;
import org.intervyouai.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/core/v1/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @GetMapping("/me")
    public ResponseEntity<GenericResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role("ROLE_" + user.getRole().name())
                .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                .organizationCode(user.getOrganization() != null ? user.getOrganization().getCode() : null);

        if (user.getRole().name().equals("STUDENT")) {
            Optional<StudentProfile> profile = studentProfileRepository.findByUser(user);
            profile.ifPresent(p -> {
                builder.skills(p.getSkills());
                builder.prn(p.getPrn());
                builder.branch(p.getBranch());
                builder.currentSemester(p.getCurrentSemester());
                builder.currentCgpa(p.getCurrentCgpa());
                builder.passingYear(p.getPassingYear());
            });
        }

        return ResponseEntity.ok(GenericResponse.success(builder.build()));
    }
}
