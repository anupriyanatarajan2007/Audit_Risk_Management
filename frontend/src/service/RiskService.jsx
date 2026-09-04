import axios from "axios";

const API_URL = "http://localhost:8080/api/risks";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

const RiskService = {

    // ==========================
    // Create Risk
    // ==========================
    createRisk: async (riskData) => {
        const response = await axios.post(
            API_URL,
            riskData,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Update Risk
    // ==========================
    updateRisk: async (id, riskData) => {
        const response = await axios.put(
            `${API_URL}/${id}`,
            riskData,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risk By Id
    // ==========================
    getRiskById: async (id) => {
        const response = await axios.get(
            `${API_URL}/${id}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risk By Risk Id
    // ==========================
    getRiskByRiskId: async (riskId) => {
        const response = await axios.get(
            `${API_URL}/riskId/${riskId}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get All Risks
    // ==========================
    getAllRisks: async () => {
        const response = await axios.get(
            API_URL,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risks By Finding
    // ==========================
    getRisksByFinding: async (findingId) => {
        const response = await axios.get(
            `${API_URL}/finding/${findingId}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risks By Identified By
    // ==========================
    getRisksByIdentifiedBy: async (userId) => {
        const response = await axios.get(
            `${API_URL}/identified-by/${userId}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risks Assigned To User
    // ==========================
    getRisksByAssignedTo: async (userId) => {
        const response = await axios.get(
            `${API_URL}/assigned-to/${userId}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risks By Status
    // ==========================
    getRisksByStatus: async (status) => {
        const statusValue =
            typeof status === "object"
                ? status?.status || status?.value
                : status;

        const response = await axios.get(
            `${API_URL}/status/${encodeURIComponent(
                String(statusValue).toUpperCase()
            )}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risks By Level
    // ==========================
    getRisksByLevel: async (level) => {
        const response = await axios.get(
            `${API_URL}/level/${level}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risks By Department
    // ==========================
    getRisksByDepartment: async (department) => {
        const response = await axios.get(
            `${API_URL}/department/${department}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Search Risks
    // ==========================
    searchRisks: async (title) => {
        const response = await axios.get(
            `${API_URL}/search`,
            {
                ...getAuthHeader(),
                params: {
                    title,
                },
            }
        );

        return response.data;
    },

    // ==========================
    // Delete Risk
    // ==========================
    deleteRisk: async (id) => {
        const response = await axios.delete(
            `${API_URL}/${id}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Get Risks By Category
    // ==========================
    getRisksByCategory: async (category) => {
        const response = await axios.get(
            `${API_URL}/category/${category}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Assign Risk
    // ==========================
    assignRisk: async (riskId, userId) => {
        const response = await axios.patch(
            `${API_URL}/${riskId}/assign/${userId}`,
            {},
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // UPDATE RISK STATUS
    // ==========================
    updateRiskStatus: async (riskId, status) => {

        const statusValue =
            typeof status === "object"
                ? status?.status || status?.value
                : status;

        if (!statusValue) {
            throw new Error("Risk status is required");
        }

        const normalizedStatus = String(
            statusValue
        ).trim().toUpperCase();

        console.log("================================");
        console.log("UPDATE RISK STATUS");
        console.log("Risk ID:", riskId);
        console.log("Original Status:", status);
        console.log("Final Status:", normalizedStatus);
        console.log("================================");

        const response = await axios.patch(
            `${API_URL}/${riskId}/status`,
            null,
            {
                ...getAuthHeader(),

                params: {
                    status: normalizedStatus,
                },
            }
        );

        return response.data;
    },

    // ==========================
    // Update Mitigation
    // ==========================
    updateMitigation: async (riskId, mitigationUpdate) => {

        const response = await axios.patch(
            `${API_URL}/${riskId}/mitigation`,
            null,
            {
                ...getAuthHeader(),

                params: {
                    mitigationUpdate,
                },
            }
        );

        return response.data;
    },

    // ==========================
    // Dashboard APIs
    // ==========================

    getTotalRisks: async () => {
        const response = await axios.get(
            `${API_URL}/dashboard/total`,
            getAuthHeader()
        );

        return response.data;
    },

    getOpenRisks: async () => {
        const response = await axios.get(
            `${API_URL}/dashboard/open`,
            getAuthHeader()
        );

        return response.data;
    },

    getClosedRisks: async () => {
        const response = await axios.get(
            `${API_URL}/dashboard/closed`,
            getAuthHeader()
        );

        return response.data;
    },

    getHighRiskCount: async () => {
        const response = await axios.get(
            `${API_URL}/dashboard/high`,
            getAuthHeader()
        );

        return response.data;
    },

    getCriticalRiskCount: async () => {
        const response = await axios.get(
            `${API_URL}/dashboard/critical`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Overdue Risks
    // ==========================
    getOverdueRisks: async () => {
        const response = await axios.get(
            `${API_URL}/overdue`,
            getAuthHeader()
        );

        return response.data;
    },

    // ==========================
    // Closed Risks List
    // ==========================
    getClosedRiskList: async () => {
        const response = await axios.get(
            `${API_URL}/closed`,
            getAuthHeader()
        );

        return response.data;
    },
};

export { RiskService };
export default RiskService;