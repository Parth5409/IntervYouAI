package org.intervyouai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class PlacementDriveResponse {
    private UUID id;
    private String companyName;
    private String jobDescription;
    private BigDecimal minCgpa;
    private String tpoName;
    private LocalDateTime createdAt;
    private String status;
}
