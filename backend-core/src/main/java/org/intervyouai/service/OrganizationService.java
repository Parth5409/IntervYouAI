package org.intervyouai.service;

import org.intervyouai.dto.OrganizationRequest;
import org.intervyouai.model.Organization;
import org.intervyouai.model.User;
import org.intervyouai.model.UserRole;
import org.intervyouai.repository.OrganizationRepository;
import org.intervyouai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Organization createOrganization(OrganizationRequest request) {
        if (organizationRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Organization with this code already exists.");
        }
        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new RuntimeException("Admin email is already registered.");
        }

        Organization org = Organization.builder()
                .name(request.getName())
                .code(request.getCode())
                .address(request.getAddress())
                .contactEmail(request.getContactEmail())
                .websiteUrl(request.getWebsiteUrl())
                .isActive(true)
                .build();

        org = organizationRepository.save(org);

        User admin = User.builder()
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(request.getAdminPassword()))
                .fullName(request.getAdminName())
                .role(UserRole.ORG_ADMIN)
                .organization(org)
                .isActive(true)
                .build();

        userRepository.save(admin);

        return org;
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }
}
