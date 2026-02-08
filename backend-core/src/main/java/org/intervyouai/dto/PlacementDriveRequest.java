package org.intervyouai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class PlacementDriveRequest {
    @NotBlank
    private String companyName;

    @NotBlank
    private String jobDescription;

    private BigDecimal minCgpa;
}
