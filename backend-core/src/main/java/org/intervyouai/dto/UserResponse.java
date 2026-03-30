package org.intervyouai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private Set<String> skills;
    private String prn;
    private String branch;
    private String currentSemester;
    private BigDecimal currentCgpa;
    private Integer passingYear;
    private String resumeUrl;
    private String resumeFilename;
    private String organizationName;
    private String organizationCode;
}
