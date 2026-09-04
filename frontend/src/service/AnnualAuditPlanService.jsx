import axios from "axios";

const BASE_URL = "http://localhost:8080/api/annual-audit-plans";

// =========================================================
// AUTH HEADER
// =========================================================

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});


// =========================================================
// CREATE ANNUAL AUDIT PLAN
// POST /api/annual-audit-plans
// =========================================================

export const createPlan = async (planData) => {

    const response = await axios.post(
        BASE_URL,
        planData,
        authHeader()
    );

    return response.data;
};


// =========================================================
// UPDATE ANNUAL AUDIT PLAN
// PUT /api/annual-audit-plans/{id}
// =========================================================

export const updatePlan = async (id, planData) => {

    const response = await axios.put(
        `${BASE_URL}/${id}`,
        planData,
        authHeader()
    );

    return response.data;
};


// =========================================================
// GET PLAN BY DATABASE ID
// GET /api/annual-audit-plans/{id}
// =========================================================

export const getPlanById = async (id) => {

    const response = await axios.get(
        `${BASE_URL}/${id}`,
        authHeader()
    );

    return response.data;
};


// =========================================================
// GET PLAN BY PLAN ID
// GET /api/annual-audit-plans/plan/{planId}
// Example: AAP-001
// =========================================================

export const getPlanByPlanId = async (planId) => {

    const response = await axios.get(
        `${BASE_URL}/plan/${planId}`,
        authHeader()
    );

    return response.data;
};


// =========================================================
// GET ALL PLANS
// GET /api/annual-audit-plans
// =========================================================

export const getAllPlans = async () => {

    const response = await axios.get(
        BASE_URL,
        authHeader()
    );

    return response.data;
};


// =========================================================
// GET MY PLANS
// GET /api/annual-audit-plans/my
// =========================================================

export const getMyPlans = async () => {

    const response = await axios.get(
        `${BASE_URL}/my`,
        authHeader()
    );

    return response.data;
};


// =========================================================
// GET PLANS BY YEAR
// GET /api/annual-audit-plans/year/{year}
// Example: 2026
// =========================================================

export const getPlansByYear = async (year) => {

    const response = await axios.get(
        `${BASE_URL}/year/${year}`,
        authHeader()
    );

    return response.data;
};


// =========================================================
// GET PLANS BY STATUS
// GET /api/annual-audit-plans/status/{status}
// Example: DRAFT
// =========================================================

export const getPlansByStatus = async (status) => {

    const response = await axios.get(
        `${BASE_URL}/status/${status}`,
        authHeader()
    );

    return response.data;
};


// =========================================================
// DELETE PLAN
// DELETE /api/annual-audit-plans/{id}
// =========================================================

export const deletePlan = async (id) => {

    const response = await axios.delete(
        `${BASE_URL}/${id}`,
        authHeader()
    );

    return response.data;
};


export const updatePlanStatus = async (id, status, reason = "") => {
    const response = await axios.patch(
        `${BASE_URL}/${id}/status`,
        null,
        {
            ...authHeader(),
            params: {
                status: status.toUpperCase(),
                ...(reason ? { reason } : {}),
            },
        }
    );

    return response.data;
};