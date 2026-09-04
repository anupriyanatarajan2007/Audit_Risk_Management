import axios from "axios";

const API_URL = "http://localhost:8080/api/recommendations";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};


// ============================================================
// CREATE RECOMMENDATION
// INTERNAL AUDITOR
// ============================================================

export const createRecommendation = async (data) => {

    const response = await axios.post(
        API_URL,
        data,
        getAuthHeaders()
    );

    return response.data;
};


// ============================================================
// GET RECOMMENDATION BY ID
// ============================================================

export const getRecommendationById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};


// ============================================================
// GET CURRENT INTERNAL AUDITOR RECOMMENDATIONS
// ============================================================

export const getMyRecommendations = async () => {

    const response = await axios.get(
        `${API_URL}/my-recommendations`,
        getAuthHeaders()
    );

    return response.data;
};


// ============================================================
// GET CURRENT AUDITEE RECOMMENDATIONS
// ============================================================

export const getMyAuditeeRecommendations = async () => {

    const response = await axios.get(
        `${API_URL}/my-auditee-recommendations`,
        getAuthHeaders()
    );

    return response.data;
};


// ============================================================
// GET RECOMMENDATIONS FOR FINDING
// ============================================================

export const getRecommendationsForFinding = async (
    findingId
) => {

    const response = await axios.get(
        `${API_URL}/finding/${findingId}`,
        getAuthHeaders()
    );

    return response.data;
};


// ============================================================
// UPDATE RECOMMENDATION STATUS
// ============================================================

export const updateRecommendationStatus = async (
    id,
    status
) => {

    const response = await axios.put(
        `${API_URL}/${id}/status`,
        null,
        {
            ...getAuthHeaders(),
            params: {
                status: status,
            },
        }
    );

    return response.data;
};


// ============================================================
// GET ALL RECOMMENDATIONS
// COMPLIANCE OFFICER
// ============================================================

export const getAllRecommendations = async () => {
    const response = await axios.get(
        `${API_URL}/all`,
        getAuthHeaders()
    );

    return response.data;
};