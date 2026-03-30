package org.intervyouai.controller;

import jakarta.validation.Valid;
import org.intervyouai.dto.JwtResponse;
import org.intervyouai.dto.LoginRequest;
import org.intervyouai.dto.SignupRequest;
import org.intervyouai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/v1/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        authService.registerUser(signUpRequest);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(new org.intervyouai.dto.MessageResponse("User registered successfully!"));
    }
}
