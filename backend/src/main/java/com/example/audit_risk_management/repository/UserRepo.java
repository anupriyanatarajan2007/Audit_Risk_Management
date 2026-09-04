package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmployeeId(String employeeId);

    // Find users by Role
    List<User> findByRole(Role role);

    // Find users by Department
    List<User> findByDepartment(Department department);

    // Find users by Role and Department
    List<User> findByRoleAndDepartment(
        Role role,
        Department department
    );

    List<User> findByRole_Name(String name);
}