package org.intervyouai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.intervyouai.dto.event.InterviewFeedbackEvent;
import org.intervyouai.model.InterviewSession;
import org.intervyouai.repository.InterviewSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FeedbackConsumerServiceTest {

    @Mock
    private InterviewSessionRepository sessionRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private FeedbackConsumerService feedbackConsumerService;

    @Test
    public void testConsumeFeedback_Success() throws Exception {
        UUID sessionId = UUID.randomUUID();
        InterviewSession session = new InterviewSession();
        session.setId(sessionId);

        InterviewFeedbackEvent event = new InterviewFeedbackEvent();
        event.setSessionId(sessionId);
        event.setOverallScore(85);
        event.setFeedback(Map.of("strength", "Java"));
        event.setTranscript("Mock Transcript");

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"json\":\"mock\"}");

        feedbackConsumerService.consumeFeedback(event);

        verify(sessionRepository).save(session);
        verify(objectMapper).writeValueAsString(event.getFeedback());
        verify(objectMapper).writeValueAsString(event.getTranscript());
    }
}
