package com.example.audit_risk_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.audit_risk_management.enums.ReviewStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.Review;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ============================================================
    // FETCH-JOIN QUERIES
    //
    // Review now contains only:
    //   - Risk
    //   - Audit
    //   - Reviewed By
    //
    // Finding and AuditeeResponse are NOT part of Review anymore.
    // ============================================================

    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.risk
        LEFT JOIN FETCH r.audit
        LEFT JOIN FETCH r.reviewedBy
    """)
    List<Review> findAllWithDetails();


    // ============================================================
    // FIND BY ID
    // ============================================================

    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.risk
        LEFT JOIN FETCH r.audit
        LEFT JOIN FETCH r.reviewedBy
        WHERE r.id = :id
    """)
    Optional<Review> findByIdWithDetails(
            @Param("id") Long id
    );


    // ============================================================
    // FIND BY REVIEW ID
    // ============================================================

    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.risk
        LEFT JOIN FETCH r.audit
        LEFT JOIN FETCH r.reviewedBy
        WHERE r.reviewId = :reviewId
    """)
    Optional<Review> findByReviewIdWithDetails(
            @Param("reviewId") String reviewId
    );


    // ============================================================
    // FIND REVIEWS BY AUDIT
    // ============================================================

    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.risk
        LEFT JOIN FETCH r.audit
        LEFT JOIN FETCH r.reviewedBy
        WHERE r.audit = :audit
    """)
    List<Review> findByAuditWithDetails(
            @Param("audit") Audit audit
    );


    // ============================================================
    // FIND REVIEWS BY REVIEWER
    // ============================================================

    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.risk
        LEFT JOIN FETCH r.audit
        LEFT JOIN FETCH r.reviewedBy
        WHERE r.reviewedBy = :reviewer
    """)
    List<Review> findByReviewedByWithDetails(
            @Param("reviewer") User reviewer
    );


    // ============================================================
    // FIND REVIEWS BY STATUS
    // ============================================================

    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.risk
        LEFT JOIN FETCH r.audit
        LEFT JOIN FETCH r.reviewedBy
        WHERE r.status = :status
    """)
    List<Review> findByStatusWithDetails(
            @Param("status") ReviewStatus status
    );


    // ============================================================
    // FIND REVIEWS BY RISK
    //
    // Used by createReview() to prevent duplicate reviews
    // for the same risk.
    // ============================================================

    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.risk
        LEFT JOIN FETCH r.audit
        LEFT JOIN FETCH r.reviewedBy
        WHERE r.risk = :risk
    """)
    List<Review> findByRiskWithDetails(
            @Param("risk") Risk risk
    );


    // ============================================================
    // PLAIN FINDER METHODS
    // ============================================================

    Optional<Review> findByReviewId(String reviewId);

    List<Review> findByAudit(Audit audit);

    List<Review> findByRisk(Risk risk);

    List<Review> findByReviewedBy(User reviewer);

    List<Review> findByStatus(ReviewStatus status);
}
