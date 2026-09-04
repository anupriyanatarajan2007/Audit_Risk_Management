import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/audit-configuration";

// Get JWT token
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};


// ===============================
// GET AUDIT CONFIGURATION
// ===============================

export const getAuditConfiguration = async () => {
    try {
        const response = await axios.get(
            API_BASE_URL,
            getAuthHeaders()
        );

        return response.data;

    } catch (error) {
        console.error(
            "Failed to load audit configuration:",
            error
        );

        throw error;
    }
};


// ===============================
// UPDATE AUDIT CONFIGURATION
// ===============================

export const updateAuditConfiguration = async (config) => {
    try {
        const response = await axios.put(
            API_BASE_URL,
            config,
            getAuthHeaders()
        );

        return response.data;

    } catch (error) {
        console.error(
            "Failed to update audit configuration:",
            error
        );

        throw error;
    }
};