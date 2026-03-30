package org.intervyouai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class InterviewSessionResponse {
    private UUID id;
    private String status;
    private String companyName;
    private String sessionType;
    private Integer overallScore;
    private LocalDateTime createdAt;
    private Integer durationMinutes;
    private UUID driveId;
    private String context;
}
