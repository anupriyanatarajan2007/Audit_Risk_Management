package com.example.audit_risk_management.serviceImpl;

import com.example.audit_risk_management.model.Permission;
import com.example.audit_risk_management.repository.PermissionRepository;
import com.example.audit_risk_management.service.PermissionService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionServiceImpl(
            PermissionRepository permissionRepository) {

        this.permissionRepository = permissionRepository;
    }


    // =========================
    // CREATE PERMISSION
    // =========================

    @Override
    public Permission createPermission(Permission permission) {

        if (permission.getName() == null ||
                permission.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Permission name is required"
            );
        }

        String permissionName =
                permission.getName().trim().toUpperCase();

        if (permissionRepository.existsByName(permissionName)) {

            throw new RuntimeException(
                    "Permission already exists: "
                            + permissionName
            );
        }

        permission.setName(permissionName);

        if (permission.getActive() == null) {
            permission.setActive(true);
        }

        return permissionRepository.save(permission);
    }


    // =========================
    // UPDATE PERMISSION
    // =========================

    @Override
    public Permission updatePermission(
            Long id,
            Permission updatedPermission) {

        Permission existingPermission =
                permissionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Permission not found with id: "
                                                + id
                                )
                        );

        if (updatedPermission.getName() != null &&
                !updatedPermission.getName().trim().isEmpty()) {

            String newName =
                    updatedPermission.getName()
                            .trim()
                            .toUpperCase();

            if (!newName.equals(existingPermission.getName())
                    && permissionRepository.existsByName(newName)) {

                throw new RuntimeException(
                        "Permission already exists: "
                                + newName
                );
            }

            existingPermission.setName(newName);
        }

        if (updatedPermission.getModule() != null) {
            existingPermission.setModule(
                    updatedPermission.getModule()
            );
        }

        if (updatedPermission.getAction() != null) {
            existingPermission.setAction(
                    updatedPermission.getAction()
            );
        }

        if (updatedPermission.getDescription() != null) {
            existingPermission.setDescription(
                    updatedPermission.getDescription()
            );
        }

        if (updatedPermission.getActive() != null) {
            existingPermission.setActive(
                    updatedPermission.getActive()
            );
        }

        return permissionRepository.save(existingPermission);
    }


    // =========================
    // GET PERMISSION BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public Permission getPermissionById(Long id) {

        return permissionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Permission not found with id: "
                                        + id
                        )
                );
    }


    // =========================
    // GET ALL PERMISSIONS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getAllPermissions() {

        return permissionRepository.findAll();
    }


    // =========================
    // DELETE PERMISSION
    // =========================

    @Override
    public void deletePermission(Long id) {

        Permission permission =
                permissionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Permission not found with id: "
                                                + id
                                )
                        );

        /*
         * Remove this permission from every role
         * before deleting it.
         */
        permission.getRoles().forEach(role ->
                role.getPermissions().remove(permission)
        );

        permissionRepository.delete(permission);
    }


    // =========================
    // GET BY MODULE
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByModule(
            String module) {

        return permissionRepository.findByModule(module);
    }


    // =========================
    // GET ACTIVE PERMISSIONS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getActivePermissions() {

        return permissionRepository.findByActiveTrue();
    }


    // =========================
    // GET ACTIVE BY MODULE
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getActivePermissionsByModule(
            String module) {

        return permissionRepository
                .findByModuleAndActiveTrue(module);
    }
}