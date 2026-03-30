package org.intervyouai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class BulkStudentDTO {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String fullName;
    @NotBlank
    private String prn;
    private String branch;
    private BigDecimal currentCgpa;
    private Integer passingYear;
}
