package org.intervyouai.controller;

import org.intervyouai.dto.GenericResponse;
import org.intervyouai.model.User;
import org.intervyouai.repository.PlacementDriveRepository;
import org.intervyouai.repository.StudentProfileRepository;
import org.intervyouai.repository.UserRepository;
import org.intervyouai.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/core/v1/analytics")
public class AnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private org.intervyouai.service.ReportService reportService;

    @GetMapping("/tpo-overview")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<Map<String, Object>>> getTpoOverview(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User tpo = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        
        if (tpo.getOrganization() == null) {
            throw new RuntimeException("Organization not found for TPO");
        }

        java.util.UUID orgId = tpo.getOrganization().getId();

        long totalStudents = studentProfileRepository.countByUserOrganizationId(orgId);
        long activeDrives = placementDriveRepository.countByTpoOrganizationId(orgId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("activeDrives", activeDrives);
        stats.put("placedPercentage", "62%"); // Placeholder
        stats.put("readinessIndex", "7.8"); // Placeholder

        return ResponseEntity.ok(GenericResponse.success(stats));
    }

    @GetMapping("/tpo-reports")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<GenericResponse<org.intervyouai.dto.TpoReportResponse>> getTpoReports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User tpo = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("TPO not found"));
        
        if (tpo.getOrganization() == null) {
            throw new RuntimeException("Organization not found for TPO");
        }

        return ResponseEntity.ok(GenericResponse.success(reportService.getTpoReport(tpo.getOrganization().getId())));
    }

    @GetMapping("/admin-overview")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<GenericResponse<Map<String, Object>>> getAdminOverview(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User admin = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        if (admin.getOrganization() == null) {
            throw new RuntimeException("Organization not found for Admin");
        }

        java.util.UUID orgId = admin.getOrganization().getId();

        long activeTpos = userRepository.countByOrganizationAndRole(admin.getOrganization(), org.intervyouai.model.UserRole.TPO);

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeTpos", activeTpos);
        stats.put("totalData", "4.2GB"); // Placeholder
        stats.put("uptime", "99.9%"); // Placeholder
        stats.put("activeLicenses", "2,500"); // Placeholder

        return ResponseEntity.ok(GenericResponse.success(stats));
    }
}
