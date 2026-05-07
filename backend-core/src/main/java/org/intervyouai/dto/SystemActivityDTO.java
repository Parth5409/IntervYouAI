package org.intervyouai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class SystemActivityDTO {
    private String id;
    private LocalDateTime timestamp;
    private String eventType;
    private String description;
    private String actorName;
}
