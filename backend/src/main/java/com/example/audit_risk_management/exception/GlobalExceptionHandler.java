package com.example.audit_risk_management.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.audit_risk_management.dto.ApiResponse;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handle(RuntimeException ex) {

        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage()));
    }
}