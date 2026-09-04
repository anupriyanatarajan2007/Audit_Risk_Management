package com.example.audit_risk_management.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.model.OTP;
import com.example.audit_risk_management.repository.OtpRepository;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    public String generateOtp(){

        return String.valueOf(
            (int)((Math.random()*900000)+100000)
        );
    }


    public void saveOtp(
        String email,String otp
    ){
        otpRepository.deleteByEmail(email);

        OTP data=new OTP();

        data.setEmail(email);
        data.setOtp(otp);

        data.setExpiryTime(
            LocalDateTime.now().plusMinutes(5)
        );

        otpRepository.save(data);
    }


    public boolean verifyOtp(
        String email,String enteredOtp
    ){

        Optional<OTP> otpData=otpRepository.findByEmail(email);

        if(otpData.isEmpty()){
            return false;
        }

        OTP otp=otpData.get();

        if(LocalDateTime.now().isAfter(otp.getExpiryTime())){
            return false;
        }
        return otp.getOtp()
        .equals(enteredOtp);

    }
    
}
