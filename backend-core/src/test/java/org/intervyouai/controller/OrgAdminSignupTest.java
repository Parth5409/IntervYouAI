package org.intervyouai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.intervyouai.dto.LoginRequest;
import org.intervyouai.dto.SignupRequest;
import org.intervyouai.model.UserRole;
import org.intervyouai.repository.OrganizationRepository;
import org.intervyouai.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;

@SpringBootTest
@AutoConfigureMockMvc
public class OrgAdminSignupTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();
    }

    @Test
    void shouldRegisterOrgAdminAndCreateOrganization() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("admin@neworg.edu");
        signupRequest.setPassword("Admin@123");
        signupRequest.setFullName("Org Admin");
        signupRequest.setRole(UserRole.ORG_ADMIN);
        signupRequest.setOrganizationName("New University");
        signupRequest.setOrganizationCode("NEWU");

        mockMvc.perform(post("/api/core/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Verify organization was created
        assert(organizationRepository.findByCode("NEWU").isPresent());

        // Verify login works
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@neworg.edu");
        loginRequest.setPassword("Admin@123");

        mockMvc.perform(post("/api/core/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("ROLE_ORG_ADMIN")));
    }

    @Test
    void shouldFailRegisterOrgAdminWithoutOrgDetails() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("admin@fail.edu");
        signupRequest.setPassword("Admin@123");
        signupRequest.setRole(UserRole.ORG_ADMIN);
        // Missing org name/code

        mockMvc.perform(post("/api/core/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }
}
