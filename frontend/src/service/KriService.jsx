import axios from "axios";

const API_URL = "http://localhost:8080/api/kri";

// ============================================================
// AUTH HEADER
// ============================================================

const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// ============================================================
// NORMALIZE ID
// ============================================================

const encodeId = (id) => {
    return encodeURIComponent(String(id));
};

// ============================================================
// KRI SERVICE
// ============================================================

const KriService = {

    // ========================================================
    // CREATE KRI
    // POST /api/kri
    // ========================================================

    createKri: async (kriData) => {

        const response = await axios.post(
            API_URL,
            kriData,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // GET ALL KRIs
    // GET /api/kri
    // ========================================================

    getAllKris: async () => {

        const response = await axios.get(
            API_URL,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // GET KRI BY ID
    // GET /api/kri/{id}
    // ========================================================

    getKriById: async (id) => {

        const response = await axios.get(
            `${API_URL}/${encodeId(id)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // UPDATE KRI
    // PUT /api/kri/{id}
    // ========================================================

    updateKri: async (id, kriData) => {

        const response = await axios.put(
            `${API_URL}/${encodeId(id)}`,
            kriData,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // DELETE KRI
    // DELETE /api/kri/{id}
    // ========================================================

    deleteKri: async (id) => {
        console.log("DELETE KRI SERVICE - ID:", id);

        const response = await axios.delete(
            `${API_URL}/${encodeId(id)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // GET KRIs FOR A RISK
    // GET /api/kri/risk/{riskId}
    //
    // IMPORTANT FOR RISK LIFECYCLE
    // ========================================================

    getKrisByRisk: async (riskId) => {

        if (!riskId) {
            console.warn("getKrisByRisk called without riskId");
            return [];
        }

        const response = await axios.get(
            `${API_URL}/risk/${encodeId(riskId)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // FIND KRI FOR RISK
    //
    // Alias method - easier to use from RiskManagement.jsx
    // ========================================================

    findKriForRisk: async (riskId) => {

        if (!riskId) {
            console.warn("findKriForRisk called without riskId");
            return [];
        }

        try {

            const response = await axios.get(
                `${API_URL}/risk/${encodeId(riskId)}`,
                getAuthHeader()
            );

            console.log(
                `KRI FOR RISK ${riskId}:`,
                response.data
            );

            return response.data;

        } catch (error) {

            console.error(
                `Failed to find KRI for risk ${riskId}:`,
                error
            );

            throw error;
        }
    },

    // ========================================================
    // GET KRI BY STATUS
    // GET /api/kri/status/{status}
    // ========================================================

    getKrisByStatus: async (status) => {

        const response = await axios.get(
            `${API_URL}/status/${encodeId(status)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // UPDATE KRI STATUS
    // PUT /api/kri/{id}/status
    // ========================================================

    updateKriStatus: async (id, status) => {

        const response = await axios.put(
            `${API_URL}/${encodeId(id)}/status`,
            {
                status: status,
            },
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // GET KRIs BY DEPARTMENT
    // GET /api/kri/department/{department}
    // ========================================================

    getKrisByDepartment: async (department) => {

        const response = await axios.get(
            `${API_URL}/department/${encodeId(department)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // GET KRIs BY CATEGORY
    // GET /api/kri/category/{category}
    // ========================================================

    getKrisByCategory: async (category) => {

        const response = await axios.get(
            `${API_URL}/category/${encodeId(category)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // GET KRIs BY OWNER
    // GET /api/kri/owner/{ownerId}
    // ========================================================

    getKrisByOwner: async (ownerId) => {

        const response = await axios.get(
            `${API_URL}/owner/${encodeId(ownerId)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // SEARCH KRI
    // GET /api/kri/search/{keyword}
    // ========================================================

    searchKri: async (keyword) => {

        const response = await axios.get(
            `${API_URL}/search/${encodeId(keyword)}`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // GET CRITICAL KRIs
    // GET /api/kri/critical
    // ========================================================

    getCriticalKris: async () => {

        const response = await axios.get(
            `${API_URL}/critical`,
            getAuthHeader()
        );

        return response.data;
    },

    // ========================================================
    // DASHBOARD
    // GET /api/kri/dashboard
    // ========================================================

    getDashboard: async () => {

        const response = await axios.get(
            `${API_URL}/dashboard`,
            getAuthHeader()
        );

        return response.data;
    },

};

// ============================================================
// EXPORT
// ============================================================

export { KriService };

export default KriService;