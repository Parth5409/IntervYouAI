package org.intervyouai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
public class StudentProfileRequest {
    @NotBlank
    private String prn;
    
    private String branch;
    private String currentSemester;
    private Double currentCgpa;
    private Integer passingYear;
    private Set<String> skills;
    private String resumeUrl;
    private String careerGoal;
}
