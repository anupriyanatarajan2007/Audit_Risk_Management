import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/reviews";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// ============================================================
// GET ALL REVIEWS
// ============================================================

const getAllReviews = async () => {
    const response = await axios.get(
        API_BASE_URL,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// GET REVIEW BY ID
// ============================================================

const getReviewById = async (id) => {
    const response = await axios.get(
        `${API_BASE_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// GET REVIEW BY REVIEW ID
// ============================================================

const getReviewByReviewId = async (reviewId) => {
    const response = await axios.get(
        `${API_BASE_URL}/review-id/${reviewId}`,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// GET REVIEWS BY AUDIT
// ============================================================

const getReviewsByAudit = async (auditId) => {
    const response = await axios.get(
        `${API_BASE_URL}/audit/${auditId}`,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// GET REVIEWS BY REVIEWER
// ============================================================

const getReviewsByReviewer = async (reviewerId) => {
    const response = await axios.get(
        `${API_BASE_URL}/reviewer/${reviewerId}`,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// GET REVIEWS BY STATUS
// ============================================================

const getReviewsByStatus = async (status) => {
    const response = await axios.get(
        `${API_BASE_URL}/status/${status}`,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// CREATE REVIEW
// ============================================================

const createReview = async (review) => {
    const response = await axios.post(
        API_BASE_URL,
        review,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// UPDATE REVIEW
// ============================================================

const updateReview = async (id, review) => {
    const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        review,
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// UPDATE STATUS
// ============================================================

const updateStatus = async (id, status, comments = null) => {
    const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        {
            status,
            comments,
        },
        getAuthConfig()
    );

    return response.data;
};

// ============================================================
// DELETE REVIEW
// ============================================================

const deleteReview = async (id) => {
    const response = await axios.delete(
        `${API_BASE_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const ReviewService = {
    getAllReviews,
    getReviewById,
    getReviewByReviewId,
    getReviewsByAudit,
    getReviewsByReviewer,
    getReviewsByStatus,
    createReview,
    updateReview,
    updateStatus,
    deleteReview,
};

export default ReviewService;