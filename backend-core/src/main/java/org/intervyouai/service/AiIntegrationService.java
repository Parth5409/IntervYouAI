package org.intervyouai.service;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashSet;
import java.util.Set;

@Service
public class AiIntegrationService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${intervyouai.ai-engine.url:http://localhost:8000}")
    private String aiEngineUrl;

    public Set<String> extractSkillsFromJd(String jobDescription) {
        String url = aiEngineUrl + "/api/engine/analysis/extract-skills";

        JDExtractionRequest request = new JDExtractionRequest();
        request.setJob_description(jobDescription);

        try {
            JDExtractionResponse response = restTemplate.postForObject(url, request, JDExtractionResponse.class);
            return response != null ? response.getSkills() : new HashSet<>();
        } catch (Exception e) {
            // Log error and return empty or default skills as fallback
            return Set.of("General");
        }
    }

    @Getter
    @Setter
    public static class JDExtractionRequest {
        private String job_description;
    }

    @Getter
    @Setter
    public static class JDExtractionResponse {
        private Set<String> skills;
    }
}