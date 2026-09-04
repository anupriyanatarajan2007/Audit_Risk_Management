package com.example.audit_risk_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.audit_risk_management.enums.ReviewStatus;
import com.example.audit_risk_management.model.Review;
import com.example.audit_risk_management.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // ============================================================
    // CREATE REVIEW
    // Permission: REVIEW_CREATE
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_CREATE')")
    @PostMapping
    public ResponseEntity<Review> createReview(
            @RequestBody Review review) {

        Review createdReview =
                reviewService.createReview(review);

        return new ResponseEntity<>(
                createdReview,
                HttpStatus.CREATED
        );
    }


    // ============================================================
    // GET REVIEW BY ID
    // Permission: REVIEW_VIEW
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(
            @PathVariable Long id) {

        Review review =
                reviewService.getReviewById(id);

        return ResponseEntity.ok(review);
    }


    // ============================================================
    // GET REVIEW BY REVIEW ID
    // Example: /api/reviews/code/REV-123456
    // Permission: REVIEW_VIEW_BY_CODE
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_VIEW_BY_CODE')")
    @GetMapping("/code/{reviewId}")
    public ResponseEntity<Review> getReviewByReviewId(
            @PathVariable String reviewId) {

        Review review =
                reviewService.getReviewByReviewId(reviewId);

        return ResponseEntity.ok(review);
    }


    // ============================================================
    // GET ALL REVIEWS
    // Permission: REVIEW_VIEW
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_VIEW')")
    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {

        List<Review> reviews =
                reviewService.getAllReviews();

        return ResponseEntity.ok(reviews);
    }


    // ============================================================
    // GET REVIEWS BY AUDIT
    // Example: /api/reviews/audit/1
    // Permission: REVIEW_VIEW_BY_AUDIT
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_VIEW_BY_AUDIT')")
    @GetMapping("/audit/{auditId}")
    public ResponseEntity<List<Review>> getReviewsByAudit(
            @PathVariable Long auditId) {

        List<Review> reviews =
                reviewService.getReviewsByAudit(auditId);

        return ResponseEntity.ok(reviews);
    }


    // ============================================================
    // GET REVIEWS BY REVIEWER
    // Example: /api/reviews/reviewer/5
    // Permission: REVIEW_VIEW_BY_REVIEWER
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_VIEW_BY_REVIEWER')")
    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<List<Review>> getReviewsByReviewer(
            @PathVariable Long reviewerId) {

        List<Review> reviews =
                reviewService.getReviewsByReviewer(reviewerId);

        return ResponseEntity.ok(reviews);
    }


    // ============================================================
    // GET REVIEWS BY STATUS
    // Example: /api/reviews/status/PENDING
    // Permission: REVIEW_VIEW_BY_STATUS
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_VIEW_BY_STATUS')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Review>> getReviewsByStatus(
            @PathVariable ReviewStatus status) {

        List<Review> reviews =
                reviewService.getReviewsByStatus(status);

        return ResponseEntity.ok(reviews);
    }


    // ============================================================
    // UPDATE REVIEW
    // Permission: REVIEW_UPDATE
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long id,
            @RequestBody Review review) {

        Review updatedReview =
                reviewService.updateReview(id, review);

        return ResponseEntity.ok(updatedReview);
    }


    // ============================================================
    // DELETE REVIEW
    // Permission: REVIEW_DELETE
    // ============================================================

    @PreAuthorize("hasAuthority('REVIEW_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id) {

        reviewService.deleteReview(id);

        return ResponseEntity.noContent().build();
    }
}