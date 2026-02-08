package org.intervyouai.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriveAssignedEvent {
    private UUID driveId;
    private UUID studentId;
    private String companyName;
}
