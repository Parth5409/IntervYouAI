package org.intervyouai.service;

import org.intervyouai.dto.JwtResponse;

import org.intervyouai.dto.LoginRequest;

import org.intervyouai.dto.SignupRequest;

import org.intervyouai.model.Organization;

import org.intervyouai.model.User;

import org.intervyouai.model.UserRole;

import org.intervyouai.repository.OrganizationRepository;

import org.intervyouai.repository.UserRepository;

import org.intervyouai.security.JwtUtils;

import org.intervyouai.security.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;



@Service

public class AuthService {



    @Autowired

    AuthenticationManager authenticationManager;



    @Autowired

    UserRepository userRepository;



    @Autowired

    OrganizationRepository organizationRepository;



    @Autowired

    PasswordEncoder encoder;



    @Autowired

    JwtUtils jwtUtils;



    public JwtResponse authenticateUser(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));



                SecurityContextHolder.getContext().setAuthentication(authentication);



                



                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();



                String jwt = jwtUtils.generateJwtToken(userDetails);



        



                String role = userDetails.getAuthorities().stream()



        

                .findFirst()

                .map(item -> item.getAuthority())

                .orElse("ROLE_STUDENT");



        return JwtResponse.builder()

                .accessToken(jwt)

                .email(userDetails.getEmail())

                .role(role)

                .build();

    }



    public void registerUser(SignupRequest signUpRequest) {

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {

            throw new RuntimeException("Error: Email is already in use!");

        }



        Organization organization = null;

        if (signUpRequest.getOrganizationCode() != null && !signUpRequest.getOrganizationCode().isEmpty()) {

            organization = organizationRepository.findByCode(signUpRequest.getOrganizationCode())

                    .orElseThrow(() -> new RuntimeException("Error: Organization not found with code: " + signUpRequest.getOrganizationCode()));

        }



        User user = User.builder()

                .email(signUpRequest.getEmail())

                .password(encoder.encode(signUpRequest.getPassword()))

                .fullName(signUpRequest.getFullName() != null ? signUpRequest.getFullName() : signUpRequest.getEmail().split("@")[0])

                .role(signUpRequest.getRole() != null ? signUpRequest.getRole() : UserRole.STUDENT)

                .organization(organization)

                .isActive(true)

                .build();



        userRepository.save(user);

    }

}
