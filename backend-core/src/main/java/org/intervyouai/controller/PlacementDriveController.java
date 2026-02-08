package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.PlacementDriveRequest;
import org.intervyouai.dto.PlacementDriveResponse;
import org.intervyouai.security.UserDetailsImpl;
import org.intervyouai.service.PlacementDriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drives")
public class PlacementDriveController {

    @Autowired
    private PlacementDriveService placementDriveService;

    @PostMapping("/{driveId}/assign")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<Void> assignDrive(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID driveId) {
        placementDriveService.assignDriveToStudents(userDetails.getId(), driveId);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<PlacementDriveResponse> createDrive(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody PlacementDriveRequest request) {
        return ResponseEntity.ok(placementDriveService.createDrive(userDetails.getId(), request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TPO', 'STUDENT')")
    public ResponseEntity<List<PlacementDriveResponse>> getDrives(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        boolean isTpo = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TPO"));

        if (isTpo) {
            return ResponseEntity.ok(placementDriveService.getDrivesForTpo(userDetails.getId()));
        } else {
            return ResponseEntity.ok(placementDriveService.getAvailableDrivesForStudent(userDetails.getId()));
        }
    }
}
