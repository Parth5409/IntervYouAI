package org.intervyouai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenericResponse<T> {
    private T data;
    private String message;
    private boolean success;

    public static <T> GenericResponse<T> success(T data) {
        return GenericResponse.<T>builder()
                .data(data)
                .success(true)
                .message("Operation successful")
                .build();
    }
}
