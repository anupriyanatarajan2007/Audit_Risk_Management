package com.example.audit_risk_management.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.audit_risk_management.model.Profile;
import com.example.audit_risk_management.model.User;


@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    // Custom query methods can be defined here if needed
    Optional<Profile> findByUser(User user);

    boolean existsByUser(User user);
    
}
