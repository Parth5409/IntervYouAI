package org.intervyouai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.intervyouai.config.RestTemplateConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RestClientTest(AiIntegrationService.class)
@Import(RestTemplateConfig.class)
public class AiIntegrationServiceTest {

    @Autowired
    private AiIntegrationService aiIntegrationService;

    @Autowired
    private MockRestServiceServer server;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldExtractSkillsViaApi() throws Exception {
        String jd = "Looking for a Java and Spring Boot expert.";
        
        AiIntegrationService.JDExtractionResponse mockResponse = new AiIntegrationService.JDExtractionResponse();
        mockResponse.setSkills(Set.of("Java", "Spring Boot"));

        // Mock the call to ai-engine
        this.server.expect(requestTo("http://localhost:8000/api/analysis/extract-skills"))
                .andExpect(jsonPath("$.job_description").value(jd))
                .andRespond(withSuccess(objectMapper.writeValueAsString(mockResponse), MediaType.APPLICATION_JSON));

        // Call the service
        Set<String> skills = aiIntegrationService.extractSkillsFromJd(jd);

        // Verify
        assertTrue(skills.contains("Java"));
        assertTrue(skills.contains("Spring Boot"));
    }
}
