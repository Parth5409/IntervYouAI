package org.intervyouai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
@Builder
public class DriveAnalyticsDTO {
    private String companyName;
    private Set<String> targetSkills;
    private int totalSessions;
    private int averageScore;
    private String status;
}
