package org.intervyouai.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InterviewFeedbackEvent {
    private UUID sessionId;
    private Map<String, Object> feedback;
    private Object transcript;
    private Integer overallScore;
}
