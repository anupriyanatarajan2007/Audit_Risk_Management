package com.example.audit_risk_management.serviceImpl;


import com.example.audit_risk_management.model.Permission;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.repository.PermissionRepository;
import com.example.audit_risk_management.repository.RoleRepository;
import com.example.audit_risk_management.service.RoleService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleServiceImpl(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository) {

        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    // =========================
    // CREATE ROLE
    // =========================

    @Override
    public Role createRole(Role role) {

        if (role.getName() == null || role.getName().trim().isEmpty()) {
            throw new RuntimeException("Role name is required");
        }

        String roleName = role.getName().trim();

        if (roleRepository.existsByName(roleName)) {
            throw new RuntimeException(
                    "Role already exists: " + roleName
            );
        }

        role.setName(roleName);

        if (role.getActive() == null) {
            role.setActive(true);
        }

        return roleRepository.save(role);
    }


    // =========================
    // UPDATE ROLE
    // =========================

    @Override
    public Role updateRole(Long id, Role updatedRole) {

        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found with id: " + id
                        )
                );

        if (updatedRole.getName() != null &&
                !updatedRole.getName().trim().isEmpty()) {

            String newName = updatedRole.getName().trim();

            if (!newName.equals(existingRole.getName())
                    && roleRepository.existsByName(newName)) {

                throw new RuntimeException(
                        "Role already exists: " + newName
                );
            }

            existingRole.setName(newName);
        }

        if (updatedRole.getDescription() != null) {
            existingRole.setDescription(
                    updatedRole.getDescription()
            );
        }

        if (updatedRole.getActive() != null) {
            existingRole.setActive(
                    updatedRole.getActive()
            );
        }

        return roleRepository.save(existingRole);
    }


    // =========================
    // GET ROLE BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public Role getRoleById(Long id) {

        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found with id: " + id
                        )
                );
    }


    // =========================
    // GET ALL ROLES
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {

        return roleRepository.findAll();
    }


    // =========================
    // DELETE ROLE
    // =========================

    @Override
    public void deleteRole(Long id) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found with id: " + id
                        )
                );

        role.getPermissions().clear();

        roleRepository.save(role);

        roleRepository.delete(role);
    }


    // =========================
    // ASSIGN PERMISSION
    // =========================

    @Override
    public Role assignPermission(
            Long roleId,
            Long permissionId) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found with id: " + roleId
                        )
                );

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Permission not found with id: "
                                        + permissionId
                        )
                );

        role.addPermission(permission);

        return roleRepository.save(role);
    }


    // =========================
    // REMOVE PERMISSION
    // =========================

    @Override
    public Role removePermission(
            Long roleId,
            Long permissionId) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found with id: " + roleId
                        )
                );

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Permission not found with id: "
                                        + permissionId
                        )
                );

        role.removePermission(permission);

        return roleRepository.save(role);
    }


    // =========================
    // GET ROLE PERMISSIONS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public Set<Permission> getRolePermissions(Long roleId) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found with id: " + roleId
                        )
                );

        return role.getPermissions();
    }
}