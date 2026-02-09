package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.CreateSessionRequest;
import org.intervyouai.dto.InterviewSessionResponse;
import org.intervyouai.security.UserDetailsImpl;
import org.intervyouai.service.InterviewSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/v1/sessions")
public class InterviewSessionController {

    @Autowired
    private InterviewSessionService sessionService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<InterviewSessionResponse> createSession(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.ok(sessionService.createSession(userDetails.getId(), request));
    }
}
