package org.intervyouai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.intervyouai.dto.*;
import org.intervyouai.model.UserRole;
import org.intervyouai.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;

@SpringBootTest
@AutoConfigureMockMvc
public class FullSystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @AfterEach
    void tearDown() {
        interviewSessionRepository.deleteAll();
        placementDriveRepository.deleteAll();
        studentProfileRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();
    }

    @Test
    void shouldCompleteFullOnboardingFlow() throws Exception {
        // 1. Create Organization (and Admin)
        OrganizationRequest orgRequest = new OrganizationRequest();
        orgRequest.setName("Indian Institute of Technology, Bombay");
        orgRequest.setCode("IITB");
        orgRequest.setAddress("Powai, Mumbai");
        orgRequest.setContactEmail("admin@iitb.ac.in");
        orgRequest.setAdminEmail("admin@iitb.ac.in");
        orgRequest.setAdminPassword("admin123");
        orgRequest.setAdminName("Admin User");

        mockMvc.perform(post("/api/core/v1/organizations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orgRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is("IITB")));

        // 2. Login as Admin
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setEmail("admin@iitb.ac.in");
        adminLogin.setPassword("admin123");

        MvcResult adminResult = mockMvc.perform(post("/api/core/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        
        String adminToken = objectMapper.readTree(adminResult.getResponse().getContentAsString()).get("access_token").asText();

        // 3. Admin creates TPO
        SignupRequest tpoRequest = new SignupRequest();
        tpoRequest.setEmail("tpo@iitb.ac.in");
        tpoRequest.setPassword("tpo123");
        tpoRequest.setFullName("Prof. Sharma");
        tpoRequest.setRole(UserRole.TPO);

        mockMvc.perform(post("/api/core/v1/admin/tpo/create")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tpoRequest)))
                .andExpect(status().isOk());

        // 4. Student Self-Signup with Organization Code
        SignupRequest studentRequest = new SignupRequest();
        studentRequest.setEmail("student@iitb.ac.in");
        studentRequest.setPassword("password123");
        studentRequest.setFullName("Rahul Sharma");
        studentRequest.setRole(UserRole.STUDENT);
        studentRequest.setOrganizationCode("IITB"); // Linking to IITB

        mockMvc.perform(post("/api/core/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentRequest)))
                .andExpect(status().isOk());

        // 5. Login Student
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("student@iitb.ac.in");
        loginRequest.setPassword("password123");

        MvcResult loginResult = mockMvc.perform(post("/api/core/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("access_token").asText();

        // 6. Create Student Profile
        StudentProfileRequest profileRequest = new StudentProfileRequest();
        profileRequest.setPrn("12345678");
        profileRequest.setBranch("Computer Science");
        profileRequest.setCurrentSemester("8");
        profileRequest.setCurrentCgpa(9.2);
        profileRequest.setPassingYear(2026);
        profileRequest.setSkills(Set.of("Java", "Spring Boot", "React"));

        mockMvc.perform(post("/api/core/v1/students/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prn", is("12345678")));

        // 7. Verify /user/me
        mockMvc.perform(get("/api/core/v1/user/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("student@iitb.ac.in")))
                .andExpect(jsonPath("$.data.role", is("STUDENT")))
                .andExpect(jsonPath("$.data.skills[0]", is("Java")));
    }

    @Test
    void shouldCreateDriveAndStartSession() throws Exception {
        // 1. Setup Org, Admin, TPO, Student
        // Organization
        OrganizationRequest orgRequest = new OrganizationRequest();
        orgRequest.setName("College of Engineering");
        orgRequest.setCode("COE");
        orgRequest.setAdminEmail("admin@coe.edu");
        orgRequest.setAdminPassword("admin123");
        orgRequest.setAdminName("Admin");
        
        mockMvc.perform(post("/api/core/v1/organizations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orgRequest)))
                .andExpect(status().isOk());

        // Admin Login
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setEmail("admin@coe.edu");
        adminLogin.setPassword("admin123");
        String adminToken = objectMapper.readTree(mockMvc.perform(post("/api/core/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin))).andReturn().getResponse().getContentAsString()).get("access_token").asText();

        // Create TPO
        SignupRequest tpoRequest = new SignupRequest();
        tpoRequest.setEmail("tpo@coe.edu");
        tpoRequest.setPassword("tpo123");
        tpoRequest.setFullName("TPO Staff");
        tpoRequest.setRole(UserRole.TPO);
        mockMvc.perform(post("/api/core/v1/admin/tpo/create")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tpoRequest)))
                .andExpect(status().isOk());

        // TPO Login
        LoginRequest tpoLogin = new LoginRequest();
        tpoLogin.setEmail("tpo@coe.edu");
        tpoLogin.setPassword("tpo123");
        String tpoToken = objectMapper.readTree(mockMvc.perform(post("/api/core/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tpoLogin))).andReturn().getResponse().getContentAsString()).get("access_token").asText();

        // Create Student
        SignupRequest studentRequest = new SignupRequest();
        studentRequest.setEmail("student@coe.edu");
        studentRequest.setPassword("student123");
        studentRequest.setFullName("Student One");
        studentRequest.setOrganizationCode("COE");
        studentRequest.setRole(UserRole.STUDENT);
        mockMvc.perform(post("/api/core/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentRequest)))
                .andExpect(status().isOk());

        // Student Login
        LoginRequest studentLogin = new LoginRequest();
        studentLogin.setEmail("student@coe.edu");
        studentLogin.setPassword("student123");
        String studentToken = objectMapper.readTree(mockMvc.perform(post("/api/core/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentLogin))).andReturn().getResponse().getContentAsString()).get("access_token").asText();

        // 2. TPO Creates Drive
        PlacementDriveRequest driveRequest = new PlacementDriveRequest();
        driveRequest.setCompanyName("Google");
        driveRequest.setJobDescription("Software Engineer");
        driveRequest.setMinCgpa(BigDecimal.valueOf(8.5));

        String driveResponse = mockMvc.perform(post("/api/core/v1/drives")
                .header("Authorization", "Bearer " + tpoToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(driveRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("Google")))
                .andReturn().getResponse().getContentAsString();
        
        String driveId = objectMapper.readTree(driveResponse).get("id").asText();

        // 3. Student Lists Drives
        mockMvc.perform(get("/api/core/v1/drives")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName", is("Google")));

        // 4. Student Starts Session
        CreateSessionRequest sessionRequest = new CreateSessionRequest();
        sessionRequest.setDriveId(UUID.fromString(driveId));

        mockMvc.perform(post("/api/core/v1/sessions")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CREATED")));
    }
}