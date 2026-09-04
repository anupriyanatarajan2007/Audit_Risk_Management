package com.example.audit_risk_management.serviceImpl;

import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.repository.DepartmentRepository;
import com.example.audit_risk_management.service.DepartmentService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public Department createDepartment(Department department) {

        if (department.getName() == null || department.getName().trim().isEmpty()) {
            throw new RuntimeException("Department name is required");
        }

        String name = department.getName().trim();

        if (departmentRepository.existsByName(name)) {
            throw new RuntimeException("Department already exists: " + name);
        }

        department.setName(name);
        department.setActive(true);

        return departmentRepository.save(department);
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public Department getDepartmentById(Long id) {

        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found with id: " + id));
    }

    @Override
    public Department updateDepartment(Long id, Department department) {

        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found with id: " + id));

        if (department.getName() == null || department.getName().trim().isEmpty()) {
            throw new RuntimeException("Department name is required");
        }

        String newName = department.getName().trim();

        if (!existingDepartment.getName().equalsIgnoreCase(newName)
                && departmentRepository.existsByName(newName)) {

            throw new RuntimeException("Department already exists: " + newName);
        }

        existingDepartment.setName(newName);

        existingDepartment.setActive(department.isActive());

        return departmentRepository.save(existingDepartment);
    }

    @Override
    public void deleteDepartment(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found with id: " + id));

        departmentRepository.delete(department);
    }
}