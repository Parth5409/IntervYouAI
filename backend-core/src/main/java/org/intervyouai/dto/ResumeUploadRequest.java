package org.intervyouai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResumeUploadRequest {
    @NotBlank
    private String resumeUrl;
    
    private String resumeFilename;
}
