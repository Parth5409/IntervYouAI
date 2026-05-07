package org.intervyouai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class StudentPerformanceDTO {
    private String name;
    private String dept;
    private int score;
    private int sessions;
    private String status;
}
