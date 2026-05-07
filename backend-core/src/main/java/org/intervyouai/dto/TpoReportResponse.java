package org.intervyouai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class TpoReportResponse {
    private List<StudentPerformanceDTO> performanceData;
    private List<DriveAnalyticsDTO> driveData;
    private List<DepartmentAnalyticsDTO> departmentData;
    private List<SystemActivityDTO> activityData;
    private Map<String, Integer> overallAnalytics;
}
