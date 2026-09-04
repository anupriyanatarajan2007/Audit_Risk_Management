package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.Organization;

@Repository
public interface OrganizationRepository
        extends JpaRepository<Organization, Long> {

    Optional<Organization> findByOrganizationCode(
            String organizationCode);

    List<Organization> findByActive(Boolean active);

    boolean existsByOrganizationCode(
            String organizationCode);
            boolean existsByContactEmail(String contactEmail);

}