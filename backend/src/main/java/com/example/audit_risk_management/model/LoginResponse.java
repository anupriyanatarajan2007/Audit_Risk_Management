package com.example.audit_risk_management.model;

public class LoginResponse {

    private String token;
    private String email;

    public LoginResponse(String token, String email){
           this.token=token;
           this.email=email;
    }

    public String getEmail(){return email;}
    public String getToken(){return token;}
    
}
