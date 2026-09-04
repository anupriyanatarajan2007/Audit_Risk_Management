package com.example.audit_risk_management.controller;

import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.service.DepartmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasAuthority('DEPARTMENT_CREATE')")
    public ResponseEntity<Department> createDepartment(
            @RequestBody Department department) {

        Department createdDepartment =
                departmentService.createDepartment(department);

        return new ResponseEntity<>(
                createdDepartment,
                HttpStatus.CREATED
        );
    }

    // GET ALL
    @GetMapping
    @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')")
    public ResponseEntity<List<Department>> getAllDepartments() {

        List<Department> departments =
                departmentService.getAllDepartments();

        return ResponseEntity.ok(departments);
    }

    // GET BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')")
    public ResponseEntity<Department> getDepartmentById(
            @PathVariable Long id) {

        Department department =
                departmentService.getDepartmentById(id);

        return ResponseEntity.ok(department);
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DEPARTMENT_UPDATE')")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @RequestBody Department department) {

        Department updatedDepartment =
                departmentService.updateDepartment(id, department);

        return ResponseEntity.ok(updatedDepartment);
    }

    // DELETE
    @PreAuthorize("hasAuthority('DEPARTMENT_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDepartment(
            @PathVariable Long id) {

        departmentService.deleteDepartment(id);

        return ResponseEntity.ok(
                "Department deleted successfully"
        );
    }
}