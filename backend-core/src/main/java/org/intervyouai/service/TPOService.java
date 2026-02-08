package org.intervyouai.service;

import org.intervyouai.dto.TPOProfileRequest;
import org.intervyouai.model.TPOProfile;
import org.intervyouai.model.User;
import org.intervyouai.repository.TPOProfileRepository;
import org.intervyouai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class TPOService {

    @Autowired
    private TPOProfileRepository tpoProfileRepository;

    @Autowired
    private UserRepository userRepository;

    public TPOProfile createProfile(UUID userId, TPOProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TPOProfile profile = TPOProfile.builder()
                .user(user)
                .designation(request.getDesignation())
                .department(request.getDepartment())
                .officePhone(request.getOfficePhone())
                .build();

        return tpoProfileRepository.save(profile);
    }

    public TPOProfile getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return tpoProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}
