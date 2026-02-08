package org.intervyouai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private String address;
    private String contactEmail;
    private String websiteUrl;

    @NotBlank
    private String adminEmail;

    @NotBlank
    private String adminPassword;

    @NotBlank
    private String adminName;
}
