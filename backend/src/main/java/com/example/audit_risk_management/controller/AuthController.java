package com.example.audit_risk_management.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.neo4j.Neo4jProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.AuthDto;
import com.example.audit_risk_management.dto.ProfileResponseDto;
import com.example.audit_risk_management.dto.RegisterDto;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.service.UserService;
import com.twilio.rest.messaging.v1.Usecase;



@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;
    
     @PostMapping("/register")
     @PreAuthorize("hasAuthority('USER_REGISTER')")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterDto registerDto) {

        userService.register(registerDto);
        return ResponseEntity.ok(
                ApiResponse.ok("User registered successfully")
        );
    }

    
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDto.LoginResponse>> login(
            @RequestBody AuthDto.LoginRequest loginRequest) {
        AuthDto.LoginResponse response = userService.login(loginRequest);
        return ResponseEntity.ok(
                ApiResponse.ok("Login successful", response)
        );
    }
    
    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('PROFILE_VIEW')")
    public ProfileResponseDto getProfile( Authentication authentication){
        
        if (authentication != null) {
            System.out.println("Email: " + authentication.getName());
        }
        String email=authentication.getName();

        return userService.getProfile(email);
    }
}
