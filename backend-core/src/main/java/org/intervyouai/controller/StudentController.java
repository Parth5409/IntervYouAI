package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.BulkStudentDTO;
import org.intervyouai.dto.StudentProfileRequest;
import org.intervyouai.model.StudentProfile;
import org.intervyouai.security.UserDetailsImpl;
import org.intervyouai.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.intervyouai.dto.ResumeUploadRequest;

@RestController
@RequestMapping("/api/core/v1/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> uploadResume(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ResumeUploadRequest request) {
        studentService.uploadResume(userDetails.getId(), request.getResumeUrl());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfile> createProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(studentService.createProfile(userDetails.getId(), request));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfile> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(studentService.getProfile(userDetails.getId()));
    }

    @PostMapping("/bulk-import")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<List<StudentProfile>> bulkImport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody List<BulkStudentDTO> students) {
        return ResponseEntity.ok(studentService.bulkImportStudents(userDetails.getId(), students));
    }
}
