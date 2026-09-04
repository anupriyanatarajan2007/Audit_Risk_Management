package com.example.audit_risk_management.controller;

import com.example.audit_risk_management.model.Permission;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.service.RoleService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    // ==========================================
    // CREATE ROLE
    // POST /api/roles
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    @PostMapping
    public ResponseEntity<Role> createRole(
            @RequestBody Role role) {

        Role createdRole = roleService.createRole(role);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdRole);
    }

    // ==========================================
    // GET ALL ROLES
    // GET /api/roles
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {

        return ResponseEntity.ok(
                roleService.getAllRoles()
        );
    }

    // ==========================================
    // GET ROLE BY ID
    // GET /api/roles/{id}
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                roleService.getRoleById(id)
        );
    }

    // ==========================================
    // UPDATE ROLE
    // PUT /api/roles/{id}
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(
            @PathVariable Long id,
            @RequestBody Role role) {

        return ResponseEntity.ok(
                roleService.updateRole(id, role)
        );
    }

    // ==========================================
    // DELETE ROLE
    // DELETE /api/roles/{id}
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(
            @PathVariable Long id) {

        roleService.deleteRole(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // ASSIGN PERMISSION TO ROLE
    // POST /api/roles/{roleId}/permissions/{permissionId}
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_PERMISSION_ASSIGN')")
    @PostMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<Role> assignPermission(
            @PathVariable Long roleId,
            @PathVariable Long permissionId) {

        return ResponseEntity.ok(
                roleService.assignPermission(
                        roleId,
                        permissionId
                )
        );
    }

    // ==========================================
    // REMOVE PERMISSION FROM ROLE
    // DELETE /api/roles/{roleId}/permissions/{permissionId}
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_PERMISSION_REMOVE')")
    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<Role> removePermission(
            @PathVariable Long roleId,
            @PathVariable Long permissionId) {

        return ResponseEntity.ok(
                roleService.removePermission(
                        roleId,
                        permissionId
                )
        );
    }

    // ==========================================
    // GET PERMISSIONS OF ROLE
    // GET /api/roles/{roleId}/permissions
    // ==========================================

    @PreAuthorize("hasAuthority('ROLE_PERMISSION_VIEW')")
    @GetMapping("/{roleId}/permissions")
    public ResponseEntity<Set<Permission>> getRolePermissions(
            @PathVariable Long roleId) {

        return ResponseEntity.ok(
                roleService.getRolePermissions(roleId)
        );
    }
}