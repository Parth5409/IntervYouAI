package org.intervyouai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateSessionRequest {
    private UUID driveId;
}
