package org.intervyouai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.intervyouai.dto.*;
import org.intervyouai.model.PlacementDrive;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@AutoConfigureMockMvc
public class FeatureVerificationTest {

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

    @AfterEach
    void tearDown() {
        placementDriveRepository.deleteAll();
        studentProfileRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();
    }

    @Test
    @Transactional
    void shouldBulkImportStudentsWithDefaultPasswords() throws Exception {
        // 1. Setup Organization and TPO
        OrganizationRequest orgRequest = new OrganizationRequest();
        orgRequest.setName("Techno Institute");
        orgRequest.setCode("KIT");
        orgRequest.setAdminEmail("admin@kit.edu");
        orgRequest.setAdminPassword("admin123");
        orgRequest.setAdminName("Admin");
        mockMvc.perform(post("/api/v1/organizations").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(orgRequest))).andExpect(status().isOk());

        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setEmail("admin@kit.edu");
        adminLogin.setPassword("admin123");
        String adminToken = objectMapper.readTree(mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(adminLogin))).andReturn().getResponse().getContentAsString()).get("accessToken").asText();

        SignupRequest tpoRequest = new SignupRequest();
        tpoRequest.setEmail("tpo@kit.edu");
        tpoRequest.setPassword("tpo123");
        tpoRequest.setFullName("Prof. TPO");
        tpoRequest.setRole(UserRole.TPO);
        mockMvc.perform(post("/api/v1/admin/tpo/create").header("Authorization", "Bearer " + adminToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(tpoRequest))).andExpect(status().isOk());

        String tpoToken = objectMapper.readTree(mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new LoginRequest(){{setEmail("tpo@kit.edu"); setPassword("tpo123");}}))).andReturn().getResponse().getContentAsString()).get("accessToken").asText();

        // 2. Perform Bulk Import
        BulkStudentDTO s1 = new BulkStudentDTO();
        s1.setEmail("s1@kit.edu");
        s1.setFullName("Student One");
        s1.setPrn("1001");
        s1.setBranch("CS");
        s1.setCurrentCgpa(8.5);

        BulkStudentDTO s2 = new BulkStudentDTO();
        s2.setEmail("s2@kit.edu");
        s2.setFullName("Student Two");
        s2.setPrn("1002");
        s2.setBranch("IT");
        s2.setCurrentCgpa(7.5);

        mockMvc.perform(post("/api/v1/students/bulk-import")
                .header("Authorization", "Bearer " + tpoToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(s1, s2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].prn", is("1001")))
                .andExpect(jsonPath("$[1].prn", is("1002")));

        // 3. Verify Login with Default Password (ST + CODE + PRN) -> STKIT1001
        LoginRequest studentLogin = new LoginRequest();
        studentLogin.setEmail("s1@kit.edu");
        studentLogin.setPassword("STKIT1001");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("ROLE_STUDENT")));
    }

    @Test
    @Transactional
    void shouldCreateDriveWithExtractedSkills() throws Exception {
        // 1. Setup TPO (Minimal setup)
        OrganizationRequest orgRequest = new OrganizationRequest();
        orgRequest.setName("Skill Univ");
        orgRequest.setCode("SU");
        orgRequest.setAdminEmail("admin@su.edu");
        orgRequest.setAdminPassword("admin123");
        orgRequest.setAdminName("Admin");
        mockMvc.perform(post("/api/v1/organizations").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(orgRequest))).andExpect(status().isOk());

        String adminToken = objectMapper.readTree(mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new LoginRequest(){{setEmail("admin@su.edu"); setPassword("admin123");}}))).andReturn().getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(post("/api/v1/admin/tpo/create").header("Authorization", "Bearer " + adminToken).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new SignupRequest(){{setEmail("tpo@su.edu"); setPassword("tpo123"); setFullName("TPO"); setRole(UserRole.TPO);}}))).andExpect(status().isOk());

        String tpoToken = objectMapper.readTree(mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new LoginRequest(){{setEmail("tpo@su.edu"); setPassword("tpo123");}}))).andReturn().getResponse().getContentAsString()).get("accessToken").asText();

        // 2. Create Drive
        PlacementDriveRequest driveRequest = new PlacementDriveRequest();
        driveRequest.setCompanyName("AI Corp");
        driveRequest.setJobDescription("Looking for a Java Developer with Spring Boot knowledge.");

        mockMvc.perform(post("/api/v1/drives")
                .header("Authorization", "Bearer " + tpoToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(driveRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("AI Corp")));

        // 3. Verify Skills were extracted (from AiIntegrationService mock)
        List<PlacementDrive> drives = placementDriveRepository.findAll();
        assertTrue(!drives.isEmpty());
        PlacementDrive savedDrive = drives.get(0);
        assertTrue(savedDrive.getSkillsRequired().contains("Java"));
        assertTrue(savedDrive.getSkillsRequired().contains("Spring Boot"));
    }
}
