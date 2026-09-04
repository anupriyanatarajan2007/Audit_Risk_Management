package com.example.audit_risk_management.dto;

import java.time.LocalDate;

import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Role;

import lombok.Data;

@Data
public class ProfileResponseDto {

    private String employeeId;

    private String firstName;
    private String lastName;

    private String email;

    private String phoneNumber;

    private Department department;

    private String designation;

    private String city;
    private String state;
    private String country;

    private LocalDate dateOfBirth;

    private Role role;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ProfileResponseDto(
            String employeeId,
            String firstName,
            String lastName,
            String email,
            String phoneNumber,
            Department department,
            String designation,
            String city,
            String state,
            String country,
            LocalDate dateOfBirth,
            Role role) {

        this.employeeId = employeeId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.department = department;
        this.designation = designation;
        this.city = city;
        this.state = state;
        this.country = country;
        this.dateOfBirth = dateOfBirth;
        this.role = role;
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public String getEmployeeId() {
        return employeeId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Department getDepartment() {
        return department;
    }

    public String getDesignation() {
        return designation;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getCountry() {
        return country;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public Role getRole() {
        return role;
    }
}