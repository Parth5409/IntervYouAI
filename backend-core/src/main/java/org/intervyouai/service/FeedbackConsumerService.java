package org.intervyouai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.intervyouai.dto.event.InterviewFeedbackEvent;
import org.intervyouai.model.InterviewSession;
import org.intervyouai.repository.InterviewSessionRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackConsumerService {

    private final InterviewSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${spring.kafka.topics.feedback:interview-feedback}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void consumeFeedback(InterviewFeedbackEvent event) {
        log.info("Received feedback event for session: {}", event.getSessionId());
        
        try {
            InterviewSession session = sessionRepository.findById(event.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found: " + event.getSessionId()));

            session.setOverallScore(event.getOverallScore());
            session.setFeedback(objectMapper.writeValueAsString(event.getFeedback()));
            session.setTranscript(objectMapper.writeValueAsString(event.getTranscript()));

            sessionRepository.save(session);
            log.info("Successfully updated session {} with feedback and scores", event.getSessionId());
        } catch (Exception e) {
            log.error("Error processing feedback event for session {}: {}", event.getSessionId(), e.getMessage());
        }
    }
}
