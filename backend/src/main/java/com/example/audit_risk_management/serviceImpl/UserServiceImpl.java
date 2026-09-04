
package com.example.audit_risk_management.serviceImpl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.AuthDto;
import com.example.audit_risk_management.dto.ProfileResponseDto;
import com.example.audit_risk_management.dto.RegisterDto;

import com.example.audit_risk_management.model.ForgotPasswordRequest;
import com.example.audit_risk_management.model.Profile;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.SystemSettings;

import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.repository.SystemSettingsRepository;

import com.example.audit_risk_management.service.AuditLogService;
import com.example.audit_risk_management.service.EmailService;
import com.example.audit_risk_management.service.OtpService;
import com.example.audit_risk_management.service.UserService;

import com.example.audit_risk_management.util.JwtUtil;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SystemSettingsRepository systemSettingsRepository;

    // =====================================================
    // AUDIT LOG SERVICE
    // =====================================================

    @Autowired
    private AuditLogService auditLogService;


    // =====================================================
    // GET SYSTEM SETTINGS
    // =====================================================

    private SystemSettings getSystemSettings() {

        return systemSettingsRepository
                .findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
    }


    // =====================================================
    // CREATE DEFAULT SYSTEM SETTINGS
    // =====================================================

    private SystemSettings createDefaultSettings() {

        SystemSettings settings = new SystemSettings();

        settings.setSystemName(
                "Audit & Risk Management System"
        );

        settings.setTimezone(
                "Asia/Kolkata"
        );

        settings.setDateFormat(
                "dd-MM-yyyy"
        );

        settings.setMaintenanceMode(false);

        settings.setSessionTimeoutMinutes(30);

        settings.setMaxLoginAttempts(5);

        settings.setPasswordExpiryDays(90);

        settings.setEnableAuditLogs(true);

        return systemSettingsRepository.save(settings);
    }


    // =====================================================
    // REGISTER
    // =====================================================

    @Override
    public void register(RegisterDto registerDto) {

        if (registerDto == null) {

            throw new RuntimeException(
                    "Registration data is required"
            );
        }

        if (userRepo.existsByEmail(
                registerDto.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }


        User user = new User();


        // =================================================
        // BASIC USER DETAILS
        // =================================================

        user.setEmail(
                registerDto.getEmail()
        );

        user.setPassword(
                passwordEncoder.encode(
                        registerDto.getPassword()
                )
        );


        // =================================================
        // LOGIN SECURITY INITIAL VALUES
        // =================================================

        user.setFailedLoginAttempts(0);

        user.setPasswordChangedAt(
                LocalDateTime.now()
        );


        // =================================================
        // EMPLOYEE
        // =================================================

        user.setEmployeeId(
                registerDto.getEmployeeId()
        );


        // =================================================
        // ROLE
        // =================================================

        user.setRole(
                registerDto.getRole()
        );


        // =================================================
        // DEPARTMENT
        // =================================================

        user.setDepartment(
                registerDto.getDepartment()
        );


        // =================================================
        // ACCOUNT STATUS
        // =================================================

        user.setEnabled(true);


        // =================================================
        // TIMESTAMPS
        // =================================================

        user.setCreatedAt(
                LocalDateTime.now()
        );

        user.setUpdatedAt(
                LocalDateTime.now()
        );


        // =================================================
        // PROFILE
        // =================================================

        Profile profile = new Profile();

        if (registerDto.getProfile() != null) {

            profile.setFirstName(
                    registerDto.getProfile().getFirstName()
            );

            profile.setLastName(
                    registerDto.getProfile().getLastName()
            );

            profile.setGender(
                    registerDto.getProfile().getGender()
            );

            profile.setDateOfBirth(
                    registerDto.getProfile().getDateOfBirth()
            );

            profile.setPhoneNumber(
                    registerDto.getProfile().getPhoneNumber()
            );

            profile.setAddress(
                    registerDto.getProfile().getAddress()
            );

            profile.setCity(
                    registerDto.getProfile().getCity()
            );

            profile.setState(
                    registerDto.getProfile().getState()
            );

            profile.setCountry(
                    registerDto.getProfile().getCountry()
            );

            profile.setDesignation(
                    registerDto.getProfile().getDesignation()
            );

            profile.setProfileImageUrl(
                    registerDto.getProfile().getProfileImageUrl()
            );
        }


        // =================================================
        // USER <-> PROFILE
        // =================================================

        profile.setUser(user);

        user.setProfile(profile);


        // =================================================
        // SAVE USER
        // =================================================

        User savedUser =
                userRepo.save(user);


        // =================================================
        // AUDIT LOG - USER CREATED
        // =================================================

        auditLogService.createLog(
                savedUser,
                "USER",
                "CREATE",
                "New user registered: "
                        + savedUser.getEmail()
        );
    }


    // =====================================================
    // LOGIN
    // =====================================================

    @Override
    public AuthDto.LoginResponse login(
            AuthDto.LoginRequest request) {


        if (request == null ||
                request.getEmail() == null ||
                request.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }


        // =================================================
        // LOAD SYSTEM SETTINGS
        // =================================================

        SystemSettings settings =
                getSystemSettings();


        // =================================================
        // MAINTENANCE MODE
        // =================================================

        if (Boolean.TRUE.equals(
                settings.getMaintenanceMode())) {

            throw new RuntimeException(
                    "System is currently under maintenance. "
                    + "Please try again later."
            );
        }


        // =================================================
        // FIND USER
        // =================================================

        User existingUser =
                userRepo.findByEmail(
                        request.getEmail()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );


        // =================================================
        // CHECK ACCOUNT STATUS
        // =================================================

        if (!existingUser.isEnabled()) {

            auditLogService.createLog(
                    existingUser,
                    "AUTHENTICATION",
                    "LOGIN_BLOCKED",
                    "Login blocked because account is "
                            + "disabled or locked"
            );

            throw new RuntimeException(
                    "Your account is disabled or locked. "
                            + "Please contact the administrator."
            );
        }


        // =================================================
        // PASSWORD EXPIRY CHECK
        // =================================================

        LocalDateTime passwordChangedAt =
                existingUser.getPasswordChangedAt();


        if (passwordChangedAt != null) {

            long passwordAge =
                    ChronoUnit.DAYS.between(
                            passwordChangedAt,
                            LocalDateTime.now()
                    );


            if (passwordAge >=
                    settings.getPasswordExpiryDays()) {

                auditLogService.createLog(
                        existingUser,
                        "AUTHENTICATION",
                        "PASSWORD_EXPIRED",
                        "Login blocked because password has expired"
                );

                throw new RuntimeException(
                        "Your password has expired. "
                                + "Please reset your password."
                );
            }
        }


        // =================================================
        // CHECK PASSWORD
        // =================================================

        boolean match =
                passwordEncoder.matches(
                        request.getPassword(),
                        existingUser.getPassword()
                );


        // =================================================
        // INCORRECT PASSWORD
        // =================================================

        if (!match) {

            int failedAttempts =
                    existingUser.getFailedLoginAttempts() == null
                            ? 0
                            : existingUser.getFailedLoginAttempts();

            failedAttempts++;


            existingUser.setFailedLoginAttempts(
                    failedAttempts
            );


            // =================================================
            // MAX LOGIN ATTEMPTS
            // =================================================

            if (failedAttempts >=
                    settings.getMaxLoginAttempts()) {

                existingUser.setEnabled(false);

                existingUser.setUpdatedAt(
                        LocalDateTime.now()
                );

                userRepo.save(existingUser);


                // ---------------------------------------------
                // AUDIT LOG - ACCOUNT LOCKED
                // ---------------------------------------------

                auditLogService.createLog(
                        existingUser,
                        "AUTHENTICATION",
                        "ACCOUNT_LOCKED",
                        "Account locked after "
                                + failedAttempts
                                + " failed login attempts"
                );


                throw new RuntimeException(
                        "Maximum login attempts exceeded. "
                                + "Your account has been locked."
                );
            }


            // =================================================
            // SAVE FAILED ATTEMPT
            // =================================================

            userRepo.save(existingUser);


            // =================================================
            // AUDIT LOG - LOGIN FAILED
            // =================================================

            auditLogService.createLog(
                    existingUser,
                    "AUTHENTICATION",
                    "LOGIN_FAILED",
                    "Incorrect password. Failed attempt "
                            + failedAttempts
            );


            int remainingAttempts =
                    settings.getMaxLoginAttempts()
                            - failedAttempts;


            throw new RuntimeException(
                    "Incorrect password. "
                            + remainingAttempts
                            + " login attempt(s) remaining."
            );
        }


        // =====================================================
        // SUCCESSFUL LOGIN
        // =====================================================

        existingUser.setFailedLoginAttempts(0);

        existingUser.setUpdatedAt(
                LocalDateTime.now()
        );

        userRepo.save(existingUser);


        // =====================================================
        // AUDIT LOG - LOGIN SUCCESS
        // =====================================================

        auditLogService.createLog(
                existingUser,
                "AUTHENTICATION",
                "LOGIN_SUCCESS",
                "User logged in successfully"
        );


        // =====================================================
        // GENERATE JWT TOKEN
        // =====================================================

        String token =
                jwtUtil.generateToken(
                        existingUser.getEmail()
                );


        // =====================================================
        // ROLE NAME
        // =====================================================

        String roleName = null;

        if (existingUser.getRole() != null) {

            roleName =
                    existingUser.getRole().getName();
        }


        // =====================================================
        // DEPARTMENT NAME
        // =====================================================

        String departmentName = null;

        if (existingUser.getDepartment() != null) {

            departmentName =
                    existingUser.getDepartment().getName();
        }


        // =====================================================
        // USER DTO
        // =====================================================

        AuthDto.UserDTO userDTO =
                new AuthDto.UserDTO(
                        existingUser.getId(),
                        existingUser.getEmail(),
                        roleName,
                        departmentName
                );


        // =====================================================
        // LOGIN RESPONSE
        // =====================================================

        return new AuthDto.LoginResponse(
                token,
                userDTO
        );
    }


    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @Override
    public ResponseEntity<?> forgotPassword(
            ForgotPasswordRequest request) {

        User existingUser =
                userRepo.findByEmail(
                        request.getEmail()
                )
                .orElse(null);


        if (existingUser == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Email not found");
        }


        String otp =
                otpService.generateOtp();


        otpService.saveOtp(
                request.getEmail(),
                otp
        );


        emailService.sendOtp(
                request.getEmail(),
                otp
        );


        // =================================================
        // AUDIT LOG - OTP REQUEST
        // =================================================

        auditLogService.createLog(
                existingUser,
                "AUTHENTICATION",
                "PASSWORD_RESET_REQUEST",
                "Password reset OTP requested"
        );


        return ResponseEntity.ok(
                "OTP Sent Successfully"
        );
    }


    // =====================================================
    // GET USERS BY ROLE ENTITY
    // =====================================================

    @Override
    public List<User> getUsersByRole(Role role) {

        return userRepo.findByRole(role);
    }


    // =====================================================
    // GET USERS BY ROLE NAME
    // =====================================================

    @Override
    public List<User> getUsersByRoleName(
            String roleName) {

        return userRepo.findByRole_Name(roleName);
    }


    // =====================================================
    // GET USERS BY DEPARTMENT
    // =====================================================

    @Override
    public List<User> getUsersByDepartment(
            Department department) {

        return userRepo.findByDepartment(department);
    }


    // =====================================================
    // GET USERS BY ROLE + DEPARTMENT
    // =====================================================

    @Override
    public List<User> getUsersByRoleAndDepartment(
            Role role,
            Department department) {

        return userRepo.findByRoleAndDepartment(
                role,
                department
        );
    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

    @Override
    public List<User> getAllUsers() {

        return userRepo.findAll();
    }


    // =====================================================
    // UPDATE USER
    // =====================================================

    @Override
    public void updateUser(
            Long id,
            RegisterDto dto) {

        User user =
                userRepo.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );


        // =================================================
        // UPDATE BASIC INFORMATION
        // =================================================

        user.setEmployeeId(
                dto.getEmployeeId()
        );

        user.setEmail(
                dto.getEmail()
        );

        user.setEnabled(
                dto.isActive()
        );


        // =================================================
        // UPDATE ROLE
        // =================================================

        user.setRole(
                dto.getRole()
        );


        // =================================================
        // UPDATE DEPARTMENT
        // =================================================

        user.setDepartment(
                dto.getDepartment()
        );


        // =================================================
        // UPDATE TIMESTAMP
        // =================================================

        user.setUpdatedAt(
                LocalDateTime.now()
        );


        // =================================================
        // UPDATE PROFILE
        // =================================================

        Profile profile =
                user.getProfile();


        if (profile == null) {

            profile = new Profile();
        }


        if (dto.getProfile() != null) {

            profile.setFirstName(
                    dto.getProfile().getFirstName()
            );

            profile.setLastName(
                    dto.getProfile().getLastName()
            );

            profile.setGender(
                    dto.getProfile().getGender()
            );

            profile.setDateOfBirth(
                    dto.getProfile().getDateOfBirth()
            );

            profile.setPhoneNumber(
                    dto.getProfile().getPhoneNumber()
            );

            profile.setAddress(
                    dto.getProfile().getAddress()
            );

            profile.setCity(
                    dto.getProfile().getCity()
            );

            profile.setState(
                    dto.getProfile().getState()
            );

            profile.setCountry(
                    dto.getProfile().getCountry()
            );

            profile.setDesignation(
                    dto.getProfile().getDesignation()
            );

            profile.setProfileImageUrl(
                    dto.getProfile().getProfileImageUrl()
            );
        }


        // =================================================
        // USER <-> PROFILE
        // =================================================

        profile.setUser(user);

        user.setProfile(profile);


        // =================================================
        // SAVE USER
        // =================================================

        userRepo.save(user);


        // =================================================
        // AUDIT LOG - USER UPDATED
        // =================================================

        auditLogService.createLog(
                user,
                "USER",
                "UPDATE",
                "User details updated for "
                        + user.getEmail()
        );
    }


    // =====================================================
    // GET PROFILE
    // =====================================================

    @Override
    public ProfileResponseDto getProfile(
            String email) {

        User user =
                userRepo.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );


        if (user.getProfile() == null) {

            throw new RuntimeException(
                    "Profile not found for user"
            );
        }


        return new ProfileResponseDto(

                user.getEmployeeId(),

                user.getProfile().getFirstName(),

                user.getProfile().getLastName(),

                user.getEmail(),

                user.getProfile().getPhoneNumber(),

                user.getDepartment(),

                user.getProfile().getDesignation(),

                user.getProfile().getCity(),

                user.getProfile().getState(),

                user.getProfile().getCountry(),

                user.getProfile().getDateOfBirth(),

                user.getRole()
        );
    }
}