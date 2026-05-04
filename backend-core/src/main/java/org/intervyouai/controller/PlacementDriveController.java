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
@RequestMapping("/api/core/v1/drives")
public class PlacementDriveController {

    @Autowired
    private PlacementDriveService placementDriveService;

    @PostMapping("/{driveId}/assign")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<Void> assignDrive(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID driveId,
            @RequestBody(required = false) List<UUID> studentIds) {
        placementDriveService.assignDriveToStudents(userDetails.getId(), driveId, studentIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/extract-skills")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<java.util.Set<String>>> extractSkills(
            @RequestBody org.intervyouai.service.AiIntegrationService.JDExtractionRequest request) {
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(placementDriveService.extractSkillsFromJd(request.getJob_description())));
    }

    @GetMapping("/{driveId}/eligible-students")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<List<org.intervyouai.dto.EligibleStudentResponse>>> getEligibleStudents(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID driveId) {
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(placementDriveService.getEligibleStudentsWithMatching(userDetails.getId(), driveId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<PlacementDriveResponse>> createDrive(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody PlacementDriveRequest request) {
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(placementDriveService.createDrive(userDetails.getId(), request)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('TPO', 'STUDENT')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<List<PlacementDriveResponse>>> getDrives(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        boolean isTpo = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TPO"));

        if (isTpo) {
            return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(placementDriveService.getDrivesForTpo(userDetails.getId())));
        } else {
            return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(placementDriveService.getAvailableDrivesForStudent(userDetails.getId())));
        }
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<List<PlacementDriveResponse>>> getStudentDrives(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(placementDriveService.getAvailableDrivesForStudent(userDetails.getId())));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('TPO', 'STUDENT')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<PlacementDriveResponse>> getDriveDetails(
            @PathVariable UUID id) {
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(placementDriveService.getDriveById(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<org.intervyouai.dto.GenericResponse<Void>> deleteDrive(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID id) {
        placementDriveService.deleteDrive(userDetails.getId(), id);
        return ResponseEntity.ok(org.intervyouai.dto.GenericResponse.success(null));
    }
}
