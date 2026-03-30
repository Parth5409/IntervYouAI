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

    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<org.intervyouai.dto.GenericResponse<java.util.List<org.intervyouai.dto.UserResponse>>> listTPOs(@AuthenticationPrincipal UserDetailsImpl adminDetails) {
        User admin = userRepository.findById(adminDetails.getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        java.util.List<User> tpos = userRepository.findByOrganizationAndRole(admin.getOrganization(), UserRole.TPO);

        java.util.List<org.intervyouai.dto.UserResponse> response = tpos.stream()
                .map(tpo -> org.intervyouai.dto.UserResponse.builder()
                        .id(tpo.getId())
                        .email(tpo.getEmail())
                        .fullName(tpo.getFullName())
                        .role(tpo.getRole().name())
                        .organizationName(tpo.getOrganization().getName())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(response));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<String>> createTPO(@AuthenticationPrincipal UserDetailsImpl adminDetails,
                                       @Valid @RequestBody SignupRequest request) {
        
        User admin = userRepository.findById(adminDetails.getId())
                .orElseThrow(() -> new org.intervyouai.exception.ResourceNotFoundException("Admin not found"));

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(org.intervyouai.dto.GenericResponse.error("Unable to create account. Email may already be in use."));
        }

        User tpo = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(UserRole.TPO)
                .organization(admin.getOrganization())
                .isActive(true)
                .build();

        userRepository.save(tpo);

        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success("TPO_CREATED_SUCCESSFULLY"));
    }

    @DeleteMapping("/{tpoId}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<String>> deleteTPO(
            @AuthenticationPrincipal UserDetailsImpl adminDetails,
            @PathVariable java.util.UUID tpoId) {
        User admin = userRepository.findById(adminDetails.getId())
                .orElseThrow(() -> new org.intervyouai.exception.ResourceNotFoundException("Admin not found"));

        if (admin.getOrganization() == null) {
            throw new org.intervyouai.exception.ResourceNotFoundException("Admin has no associated organization");
        }

        User tpo = userRepository.findById(tpoId)
                .orElseThrow(() -> new org.intervyouai.exception.ResourceNotFoundException("TPO not found"));

        if (tpo.getOrganization() == null || !tpo.getOrganization().getId().equals(admin.getOrganization().getId()) || tpo.getRole() != UserRole.TPO) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to delete this user");
        }

        userRepository.delete(tpo);
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success("TPO_DEPROVISIONED_SUCCESSFULLY"));
    }
}
