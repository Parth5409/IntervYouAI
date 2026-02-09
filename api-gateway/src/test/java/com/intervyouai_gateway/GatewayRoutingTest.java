package com.intervyouai_gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * This test verifies that the Gateway properly routes requests to the actual running services.
 * Ensure backend-core (8081) and ai-engine (8000) are running before executing this.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("live-test") // Use a separate profile if needed
public class GatewayRoutingTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void testAiEngineRouting_Live() {
        // AI Engine ping endpoint
        ResponseEntity<String> response = restTemplate.getForEntity("/api/engine/ping", String.class);
        
        assertThat(response.getStatusCode()).describedAs("AI Engine should be reachable through gateway").isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("pong");
    }

    @Test
    public void testCoreBackendRouting_Live() {
        // Backend Core test endpoint
        ResponseEntity<String> response = restTemplate.getForEntity("/api/core/v1/test/ping", String.class);
        
        assertThat(response.getStatusCode()).describedAs("Core Backend should be reachable through gateway").isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("pong");
    }
}