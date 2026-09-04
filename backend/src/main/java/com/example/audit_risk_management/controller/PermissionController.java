package com.example.audit_risk_management.controller;

import com.example.audit_risk_management.model.Permission;
import com.example.audit_risk_management.service.PermissionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(origins = "*")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(
            PermissionService permissionService) {

        this.permissionService = permissionService;
    }


    // ==========================================
    // CREATE PERMISSION
    // Authority: PERMISSION_CREATE
    // ==========================================

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
    public ResponseEntity<Permission> createPermission(
            @RequestBody Permission permission) {

        Permission createdPermission =
                permissionService.createPermission(permission);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdPermission);
    }


    // ==========================================
    // GET ALL PERMISSIONS
    // Authority: PERMISSION_VIEW
    // ==========================================

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ResponseEntity<List<Permission>> getAllPermissions() {

        return ResponseEntity.ok(
                permissionService.getAllPermissions()
        );
    }


    // ==========================================
    // GET PERMISSION BY ID
    // Authority: PERMISSION_VIEW
    // ==========================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ResponseEntity<Permission> getPermissionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                permissionService.getPermissionById(id)
        );
    }


    // ==========================================
    // UPDATE PERMISSION
    // Authority: PERMISSION_UPDATE
    // ==========================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    public ResponseEntity<Permission> updatePermission(
            @PathVariable Long id,
            @RequestBody Permission permission) {

        return ResponseEntity.ok(
                permissionService.updatePermission(
                        id,
                        permission
                )
        );
    }


    // ==========================================
    // DELETE PERMISSION
    // Authority: PERMISSION_DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_DELETE')")
    public ResponseEntity<Void> deletePermission(
            @PathVariable Long id) {

        permissionService.deletePermission(id);

        return ResponseEntity.noContent().build();
    }


    // ==========================================
    // GET PERMISSIONS BY MODULE
    // Authority: PERMISSION_VIEW
    // ==========================================

    @GetMapping("/module/{module}")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ResponseEntity<List<Permission>> getByModule(
            @PathVariable String module) {

        return ResponseEntity.ok(
                permissionService.getPermissionsByModule(module)
        );
    }


    // ==========================================
    // GET ACTIVE PERMISSIONS
    // Authority: PERMISSION_VIEW
    // ==========================================

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ResponseEntity<List<Permission>> getActivePermissions() {

        return ResponseEntity.ok(
                permissionService.getActivePermissions()
        );
    }


    // ==========================================
    // GET ACTIVE PERMISSIONS BY MODULE
    // Authority: PERMISSION_VIEW
    // ==========================================

    @GetMapping("/module/{module}/active")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ResponseEntity<List<Permission>>
    getActivePermissionsByModule(
            @PathVariable String module) {

        return ResponseEntity.ok(
                permissionService
                        .getActivePermissionsByModule(module)
        );
    }
}