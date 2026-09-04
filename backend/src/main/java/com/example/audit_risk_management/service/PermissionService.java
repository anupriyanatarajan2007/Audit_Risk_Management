package com.example.audit_risk_management.service;

import com.example.audit_risk_management.model.Permission;

import java.util.List;

public interface PermissionService {

    // Permission CRUD
    Permission createPermission(Permission permission);

    Permission updatePermission(Long id, Permission permission);

    Permission getPermissionById(Long id);

    List<Permission> getAllPermissions();

    void deletePermission(Long id);

    // Get permissions by module
    List<Permission> getPermissionsByModule(String module);

    // Get active permissions
    List<Permission> getActivePermissions();

    // Get active permissions by module
    List<Permission> getActivePermissionsByModule(String module);
}