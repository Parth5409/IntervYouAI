package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.OrganizationRequest;
import org.intervyouai.model.Organization;
import org.intervyouai.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.intervyouai.security.UserDetailsImpl;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.intervyouai.repository.UserRepository;

import org.intervyouai.dto.GenericResponse;
import org.intervyouai.dto.OrganizationResponse;

@RestController
@RequestMapping("/api/core/v1/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<GenericResponse<OrganizationResponse>> getMyOrganization(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        org.intervyouai.model.User admin = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (admin.getOrganization() == null) {
            throw new RuntimeException("No organization associated with this admin account.");
        }
        
        return ResponseEntity.ok(GenericResponse.success(convertToResponse(admin.getOrganization())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<GenericResponse<OrganizationResponse>> updateMyOrganization(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody org.intervyouai.dto.OrganizationRequest request) {
        org.intervyouai.model.User admin = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (admin.getOrganization() == null) {
            throw new RuntimeException("No organization associated with this admin account.");
        }

        Organization updated = organizationService.updateOrganization(admin.getOrganization().getId(), request);
        return ResponseEntity.ok(GenericResponse.success(convertToResponse(updated)));
    }

    private OrganizationResponse convertToResponse(Organization org) {
        if (org == null) return null;
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .code(org.getCode())
                .address(org.getAddress())
                .contactEmail(org.getContactEmail())
                .websiteUrl(org.getWebsiteUrl())
                .active(org.isActive())
                .build();
    }
}
