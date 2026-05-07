package org.intervyouai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DepartmentAnalyticsDTO {
    private String branchName;
    private int totalStudents;
    private int averageOverallScore;
    private int averageTechnicalScore;
    private int averageCommunicationScore;
}
