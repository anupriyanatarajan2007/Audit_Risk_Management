import axios from "axios";

const API_URL = "http://localhost:8080/api/auditee-responses";

// ============================================================
// AUTH HEADER
// ============================================================

const getToken = () => {
    return localStorage.getItem("token");
};

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    },
});

// ============================================================
// SUBMIT AUDITEE RESPONSE
// POST /api/auditee-responses
// ============================================================

export const submitAuditeeResponse = async (responseData) => {
    try {
        const response = await axios.post(
            API_URL,
            responseData,
            authHeader()
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error submitting auditee response:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET RESPONSE BY ID
// GET /api/auditee-responses/{id}
// ============================================================

export const getAuditeeResponseById = async (id) => {
    try {
        const response = await axios.get(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching auditee response:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET RESPONSES BY FINDING
// GET /api/auditee-responses/finding/{findingId}
// ============================================================

export const getResponsesByFinding = async (findingId) => {
    try {
        const response = await axios.get(
            `${API_URL}/finding/${findingId}`,
            authHeader()
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching responses by finding:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET RESPONSES BY AUDITEE
// GET /api/auditee-responses/auditee/{auditeeId}
// ============================================================

export const getResponsesByAuditee = async (auditeeId) => {
    try {
        const response = await axios.get(
            `${API_URL}/auditee/${auditeeId}`,
            authHeader()
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching responses by auditee:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET ALL RESPONSES
// GET /api/auditee-responses
// ============================================================

export const getAllAuditeeResponses = async () => {
    try {
        const response = await axios.get(
            API_URL,
            authHeader()
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching all auditee responses:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// DELETE RESPONSE
// DELETE /api/auditee-responses/{id}
// ============================================================

export const deleteAuditeeResponse = async (id) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error deleting auditee response:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ============================================================
// UPDATE RESPONSE STATUS
// INTERNAL AUDITOR ONLY
// ============================================================

export const updateAuditeeResponseStatus = async (
    id,
    status
) => {
    try {

        const allowedStatuses = [
            "UNDER_REVIEW",
            "APPROVED",
            "REJECTED",
        ];

        if (!allowedStatuses.includes(status)) {
            throw new Error(
                "Invalid status for Internal Auditor"
            );
        }

        const response = await axios.patch(
            `${API_URL}/${id}/status`,
            null,
            {
                ...authHeader(),
                params: {
                    status: status,
                },
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating auditee response status:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
};