package org.intervyouai.service;

import lombok.RequiredArgsConstructor;
import org.intervyouai.dto.event.DriveAssignedEvent;
import org.intervyouai.dto.event.ResumeUploadedEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${spring.kafka.topics.resume-events:resume-events}")
    private String resumeEventsTopic;

    @Value("${spring.kafka.topics.drive-events:drive-events}")
    private String driveEventsTopic;

    public void publishResumeUploadedEvent(ResumeUploadedEvent event) {
        kafkaTemplate.send(resumeEventsTopic, event.getStudentId().toString(), event);
    }

    public void publishDriveAssignedEvent(DriveAssignedEvent event) {
        kafkaTemplate.send(driveEventsTopic, event.getStudentId().toString(), event);
    }
}