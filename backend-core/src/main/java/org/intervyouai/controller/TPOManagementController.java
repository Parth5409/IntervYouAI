package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.SignupRequest;
import org.intervyouai.model.User;
import org.intervyouai.model.UserRole;
import org.intervyouai.repository.UserRepository;
import org.intervyouai.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/v1/admin/tpo")
public class TPOManagementController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<?> createTPO(@AuthenticationPrincipal UserDetailsImpl adminDetails,
                                       @Valid @RequestBody SignupRequest request) {
        
        User admin = userRepository.findById(adminDetails.getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User tpo = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(UserRole.TPO)
                .organization(admin.getOrganization()) // Link to Admin's Organization
                .isActive(true)
                .build();

        userRepository.save(tpo);

        return ResponseEntity.ok("TPO created successfully for organization: " + admin.getOrganization().getName());
    }
}
