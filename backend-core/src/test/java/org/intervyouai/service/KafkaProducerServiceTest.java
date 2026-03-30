package org.intervyouai.service;

import org.intervyouai.dto.event.ResumeUploadedEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class KafkaProducerServiceTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private KafkaProducerService kafkaProducerService;

    @Test
    public void testPublishResumeUploadedEvent() {
        // Set the topic value manually as @Value doesn't work in unit tests without Spring context
        ReflectionTestUtils.setField(kafkaProducerService, "resumeEventsTopic", "resume-events");

        UUID studentId = UUID.randomUUID();
        String resumeUrl = "http://example.com/resume.pdf";
        ResumeUploadedEvent event = new ResumeUploadedEvent(studentId, resumeUrl);

        kafkaProducerService.publishResumeUploadedEvent(event);

        verify(kafkaTemplate).send(eq("resume-events"), eq(studentId.toString()), eq(event));
    }
}
