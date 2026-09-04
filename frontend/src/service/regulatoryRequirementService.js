import axios from "axios";

const API_URL =
    "http://localhost:8080/api/regulatory-requirements";

// ============================================================
// AUTH HEADER
// ============================================================

const authHeader = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// ============================================================
// RESPONSE NORMALIZER
// Handles:
// []
// { data: [] }
// { success: true, data: [] }
// ============================================================

const normalizeListResponse = (response) => {
    const body = response?.data;

    if (Array.isArray(body)) {
        return body;
    }

    if (Array.isArray(body?.data)) {
        return body.data;
    }

    return [];
};

// ============================================================
// GET ALL REGULATORY REQUIREMENTS
// GET /api/regulatory-requirements
// ============================================================

export const getAllRegulatoryRequirements = async () => {
    try {
        const response = await axios.get(
            API_URL,
            authHeader()
        );

        console.log(
            "REGULATORY REQUIREMENTS RESPONSE:",
            response.data
        );

        return normalizeListResponse(response);
    } catch (error) {
        console.error(
            "Failed to load regulatory requirements:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET REGULATORY REQUIREMENT BY ID
// GET /api/regulatory-requirements/{id}
// ============================================================

export const getRegulatoryRequirementById = async (id) => {
    if (!id) {
        throw new Error(
            "Regulatory requirement ID is required"
        );
    }

    try {
        const response = await axios.get(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data?.data || response.data || null;
    } catch (error) {
        console.error(
            "Failed to load regulatory requirement:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// CREATE REGULATORY REQUIREMENT
// POST /api/regulatory-requirements
// ============================================================

export const createRegulatoryRequirement = async (data) => {
    try {
        const response = await axios.post(
            API_URL,
            data,
            authHeader()
        );

        console.log(
            "CREATED REGULATORY REQUIREMENT:",
            response.data
        );

        return response.data?.data ||
               response.data ||
               null;

    } catch (error) {
        console.error(
            "Failed to create regulatory requirement:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ============================================================
// UPDATE REGULATORY REQUIREMENT
// PUT /api/regulatory-requirements/{id}
// ============================================================

export const updateRegulatoryRequirement = async (
    id,
    data
) => {
    if (!id) {
        throw new Error(
            "Regulatory requirement ID is required"
        );
    }

    try {
        const response = await axios.put(
            `${API_URL}/${id}`,
            data,
            authHeader()
        );

        console.log(
            "UPDATED REGULATORY REQUIREMENT:",
            response.data
        );

        return response.data?.data ||
               response.data ||
               null;

    } catch (error) {
        console.error(
            "Failed to update regulatory requirement:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ============================================================
// DELETE REGULATORY REQUIREMENT
// DELETE /api/regulatory-requirements/{id}
// ============================================================

export const deleteRegulatoryRequirement = async (id) => {
    if (!id) {
        throw new Error(
            "Regulatory requirement ID is required"
        );
    }

    try {
        const response = await axios.delete(
            `${API_URL}/${id}`,
            authHeader()
        );

        console.log(
            "DELETED REGULATORY REQUIREMENT:",
            id
        );

        return response.data;

    } catch (error) {
        console.error(
            "Failed to delete regulatory requirement:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================
const RegulatoryRequirementService = {
    getAllRegulatoryRequirements,
    getRegulatoryRequirementById,
    createRegulatoryRequirement,
    updateRegulatoryRequirement,
    deleteRegulatoryRequirement,
};

export default RegulatoryRequirementService;