package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.OrganizationRequest;
import org.intervyouai.model.Organization;
import org.intervyouai.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<Organization> createOrganization(@Valid @RequestBody OrganizationRequest request) {
        return ResponseEntity.ok(organizationService.createOrganization(request));
    }

    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }
}
