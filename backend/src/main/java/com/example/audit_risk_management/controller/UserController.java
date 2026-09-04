package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.RegisterDto;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.service.UserService;


@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<List<User>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
    

    @GetMapping("/by-role/{roleName}")
    @PreAuthorize("hasAuthority('USER_VIEW_BY_ROLE')")
    public ResponseEntity<List<User>> getUsersByRole(
            @PathVariable String roleName) {
    
        return ResponseEntity.ok(
            userService.getUsersByRoleName(roleName)
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> updateUser(@PathVariable Long id,@RequestBody RegisterDto dto){

        userService.updateUser(id,dto);

        return ResponseEntity.ok(
            ApiResponse.ok("User updated successfully")
        );

    }

}
