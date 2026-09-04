package com.example.audit_risk_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ResetPasswordRequest;
import com.example.audit_risk_management.dto.VerifyOtpRequest;
import com.example.audit_risk_management.model.ForgotPasswordRequest;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.OtpRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.OtpService;
import com.example.audit_risk_management.service.UserService;


@RestController
@CrossOrigin(origins = "*")
public class PasswordController {

    private final PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private OtpRepository otpRepository;


    PasswordController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
        @RequestBody  ForgotPasswordRequest email
    ){

        userService.forgotPassword(email);

        return ResponseEntity.ok(
            "OTP Sent Successfully");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
        @RequestBody VerifyOtpRequest verifyOtpRequest
    ){

        boolean valid=otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());

        if(!valid){
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        return ResponseEntity.ok(
            "OTP Verified");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
        @RequestBody ResetPasswordRequest request
    ){
        boolean valid=otpService.verifyOtp(request.getEmail(), request.getOtp());

        if (!valid) {
            return ResponseEntity.badRequest()
                    .body("Invalid OTP");
        }

        User user=userRepo.findByEmail(
            request.getEmail()
        ).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("User not found");
        }

        user.setPassword(
            passwordEncoder.encode(request.getNewPassword())
        );

        userRepo.save(user);

        otpRepository.deleteByEmail(
            request.getEmail()
        );

        return ResponseEntity.ok(
            "Password Reset Successfully");
        
    }
}




