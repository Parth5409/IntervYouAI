package org.intervyouai.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponse {
    private UUID id;
    private UUID userId;
    private String email;
    private String fullName;
    private String prn;
    private String branch;
    private String currentSemester;
    private BigDecimal currentCgpa;
    private Integer passingYear;
    private Set<String> skills;
    private String resumeUrl;
    private String careerGoal;
}
