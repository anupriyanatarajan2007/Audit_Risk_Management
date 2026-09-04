package com.example.audit_risk_management.service;

import com.example.audit_risk_management.model.Permission;
import com.example.audit_risk_management.model.Role;

import java.util.List;
import java.util.Set;

public interface RoleService {

    // Role CRUD
    Role createRole(Role role);

    Role updateRole(Long id, Role role);

    Role getRoleById(Long id);

    List<Role> getAllRoles();

    void deleteRole(Long id);

    // Permission management
    Role assignPermission(Long roleId, Long permissionId);

    Role removePermission(Long roleId, Long permissionId);

    Set<Permission> getRolePermissions(Long roleId);
}