package org.intervyouai.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibleStudentResponse {
    private UUID profileId;
    private UUID userId;
    private String fullName;
    private String email;
    private BigDecimal currentCgpa;
    private String branch;
    private Set<String> skills;
    private int matchPercentage;
    private Set<String> matchedSkills;
}
