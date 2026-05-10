package org.intervyouai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.intervyouai.dto.*;
import org.intervyouai.model.UserRole;
import org.intervyouai.repository.*;
import org.intervyouai.model.RoundType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FullSystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

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

        // 4. TPO Logins
        LoginRequest tpoLogin = new LoginRequest();
        tpoLogin.setEmail("tpo@iitb.ac.in");
        tpoLogin.setPassword("tpo123");

        MvcResult tpoResult = mockMvc.perform(post("/api/core/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tpoLogin)))
                .andExpect(status().isOk())
                .andReturn();
        
        String tpoToken = objectMapper.readTree(tpoResult.getResponse().getContentAsString()).get("access_token").asText();

        // 5. TPO Bulk Imports Students
        BulkStudentDTO student1 = new BulkStudentDTO();
        student1.setEmail("rahul@iitb.ac.in");
        student1.setFullName("Rahul Kumar");
        student1.setPrn("2021001");
        student1.setBranch("CSE");
        student1.setCurrentCgpa(java.math.BigDecimal.valueOf(9.2));

        mockMvc.perform(post("/api/core/v1/students/bulk-import")
                .header("Authorization", "Bearer " + tpoToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(student1))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void shouldCreateDriveAndStartSession() throws Exception {
        // 1. Setup Organization & TPO
        OrganizationRequest orgRequest = new OrganizationRequest();
        orgRequest.setName("College of Engineering");
        orgRequest.setCode("COE");
        orgRequest.setAdminEmail("admin@coe.edu");
        orgRequest.setAdminPassword("admin123");
        orgRequest.setAdminName("Admin");
        mockMvc.perform(post("/api/core/v1/organizations").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(orgRequest))).andExpect(status().isOk());

        String adminToken = objectMapper.readTree(mockMvc.perform(post("/api/core/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new LoginRequest(){{setEmail("admin@coe.edu"); setPassword("admin123");}}))).andReturn().getResponse().getContentAsString()).get("access_token").asText();

        mockMvc.perform(post("/api/core/v1/admin/tpo/create").header("Authorization", "Bearer " + adminToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new SignupRequest(){{setEmail("tpo@coe.edu"); setPassword("tpo123"); setFullName("TPO"); setRole(UserRole.TPO);}}))).andExpect(status().isOk());

        String tpoToken = objectMapper.readTree(mockMvc.perform(post("/api/core/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new LoginRequest(){{setEmail("tpo@coe.edu"); setPassword("tpo123");}}))).andReturn().getResponse().getContentAsString()).get("access_token").asText();

        // 2. TPO Creates Drive
        PlacementDriveRequest driveRequest = new PlacementDriveRequest();
        driveRequest.setCompanyName("Google");
        driveRequest.setJobDescription("SWE Intern");
        driveRequest.setMinCgpa(java.math.BigDecimal.valueOf(8.0));
        driveRequest.setMinLpa(java.math.BigDecimal.valueOf(15.0));

        MvcResult driveResult = mockMvc.perform(post("/api/core/v1/drives")
                .header("Authorization", "Bearer " + tpoToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(driveRequest)))
                .andExpect(status().isOk())
                .andReturn();
        
        UUID driveId = UUID.fromString(objectMapper.readTree(driveResult.getResponse().getContentAsString()).get("data").get("id").asText());

        // 3. Student Signs Up and Joins Drive
        SignupRequest studentSignup = new SignupRequest();
        studentSignup.setEmail("student@coe.edu");
        studentSignup.setPassword("student123");
        studentSignup.setOrganizationCode("COE");
        studentSignup.setRole(UserRole.STUDENT);

        mockMvc.perform(post("/api/core/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentSignup)))
                .andExpect(status().isCreated());

        String studentToken = objectMapper.readTree(mockMvc.perform(post("/api/core/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new LoginRequest(){{setEmail("student@coe.edu"); setPassword("student123");}}))).andReturn().getResponse().getContentAsString()).get("access_token").asText();

        // 4. Student creates session for drive
        CreateSessionRequest sessionRequest = new CreateSessionRequest();
        sessionRequest.setDriveId(driveId);

        mockMvc.perform(post("/api/core/v1/session")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }
}
