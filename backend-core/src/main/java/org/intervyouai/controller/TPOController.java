package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.TPOProfileRequest;
import org.intervyouai.model.TPOProfile;
import org.intervyouai.security.UserDetailsImpl;
import org.intervyouai.service.TPOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/v1/tpo/profile")
public class TPOController {

    @Autowired
    private TPOService tpoService;

    @PostMapping
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<TPOProfile>> createProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody TPOProfileRequest request) {
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(tpoService.createProfile(userDetails.getId(), request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<TPOProfile>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(tpoService.getProfile(userDetails.getId())));
    }
}
