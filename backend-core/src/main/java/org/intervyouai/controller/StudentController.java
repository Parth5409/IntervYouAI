package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.BulkStudentDTO;
import org.intervyouai.dto.GenericResponse;
import org.intervyouai.dto.StudentProfileRequest;
import org.intervyouai.dto.StudentResponse;
import org.intervyouai.security.UserDetailsImpl;
import org.intervyouai.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import org.intervyouai.dto.ResumeUploadRequest;
import java.util.Set;

@RestController
@RequestMapping("/api/core/v1/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PutMapping("/{userId}/skills")
    public ResponseEntity<Void> updateSkills(
            @PathVariable UUID userId,
            @RequestBody Set<String> skills) {
        studentService.updateSkills(userId, skills);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> uploadResume(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ResumeUploadRequest request) {
        studentService.uploadResume(userDetails.getId(), request.getResumeUrl(), request.getResumeFilename());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<GenericResponse<StudentResponse>> createProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(GenericResponse.success(studentService.createProfile(userDetails.getId(), request)));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<GenericResponse<StudentResponse>> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(GenericResponse.success(studentService.getProfile(userDetails.getId())));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<List<StudentResponse>>> getAllStudents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(GenericResponse.success(studentService.getAllStudentsByTpoOrganization(userDetails.getId())));
    }

    @PostMapping("/bulk-import")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<List<StudentResponse>>> bulkImport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody List<BulkStudentDTO> students) {
        return ResponseEntity.ok(GenericResponse.success(studentService.bulkImportStudents(userDetails.getId(), students)));
    }

    @PutMapping("/{profileId}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<StudentResponse>> updateStudent(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID profileId,
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(GenericResponse.success(studentService.updateStudent(userDetails.getId(), profileId, request)));
    }

    @DeleteMapping("/{profileId}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<Void>> deleteStudent(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID profileId) {
        studentService.deleteStudent(userDetails.getId(), profileId);
        return ResponseEntity.ok(GenericResponse.success(null));
    }

    @DeleteMapping("/bulk-delete")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<Void>> bulkDeleteStudents(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody List<UUID> profileIds) {
        studentService.bulkDeleteStudents(userDetails.getId(), profileIds);
        return ResponseEntity.ok(GenericResponse.success(null));
    }

    @PostMapping("/backfill-skills")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<String>> backfillSkills(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        studentService.backfillSkills(userDetails.getId());
        return ResponseEntity.ok(GenericResponse.success("Backfill process initiated for eligible resumes."));
    }
}