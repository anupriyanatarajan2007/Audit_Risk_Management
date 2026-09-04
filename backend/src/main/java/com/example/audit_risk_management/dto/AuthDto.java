package com.example.audit_risk_management.dto;

public class AuthDto {

    // =====================================================
    // LOGIN REQUEST
    // =====================================================

    public static class LoginRequest {

        private String email;
        private String password;

        public LoginRequest() {
        }

        public String getEmail() {
            return email;
        }

        public String getPassword() {
            return password;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }


    // =====================================================
    // LOGIN RESPONSE
    // =====================================================

    public static class LoginResponse {

        private String token;
        private UserDTO user;

        public LoginResponse() {
        }

        public LoginResponse(String token, UserDTO user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public UserDTO getUser() {
            return user;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public void setUser(UserDTO user) {
            this.user = user;
        }
    }


    // =====================================================
    // USER DTO
    // =====================================================

    public static class UserDTO {

        private Long id;
        private String email;
        private String role;
        private String department;

        public UserDTO() {
        }

        public UserDTO(
                Long id,
                String email,
                String role,
                String department) {

            this.id = id;
            this.email = email;
            this.role = role;
            this.department = department;
        }

        public Long getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }

        public String getDepartment() {
            return department;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public void setDepartment(String department) {
            this.department = department;
        }
    }
}