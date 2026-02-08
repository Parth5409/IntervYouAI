package org.intervyouai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.intervyouai.model.UserRole;

@Getter
@Setter
public class SignupRequest {
    @NotBlank
    @Size(max = 255)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private String fullName;

    private String organizationCode;

    private UserRole role;
}
