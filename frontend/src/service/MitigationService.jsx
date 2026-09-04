import axios from "axios";

const API_URL = "http://localhost:8080/api/mitigations";


const getAuthHeader = () => {

    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    };
}; 



const MitigationService = {


    // ================= CREATE =================

    createMitigation: async (mitigationData) => {

        const response = await axios.post(
            API_URL,
            mitigationData,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= GET ALL =================

    getAllMitigations: async () => {

        const response = await axios.get(
            API_URL,
            getAuthHeader()
        );
    
        if (Array.isArray(response.data)) {
            return response.data;
        }
    
        if (Array.isArray(response.data.data)) {
            return response.data.data;
        }
    
        return [];
    },



    // ================= GET BY MITIGATION ID =================

    getMitigationById: async (mitigationId) => {

        const response = await axios.get(
            `${API_URL}/${mitigationId}`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= GET BY RISK =================

    getMitigationsByRisk: async (riskId) => {

        const response = await axios.get(
            `${API_URL}/risk/${riskId}`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= GET BY OWNER =================

    getMitigationsByOwner: async (ownerId) => {

        const response = await axios.get(
            `${API_URL}/owner/${ownerId}`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= UPDATE =================

    updateMitigation: async (mitigationId, mitigationData) => {
        console.log("PUT ID:", mitigationId);
    console.log("PUT DATA:", mitigationData);
        const response = await axios.put(
            `${API_URL}/${mitigationId}`,
            mitigationData,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= DELETE =================

    deleteMitigation: async (mitigationId) => {

        const response = await axios.delete(
            `${API_URL}/${mitigationId}`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= UPDATE STATUS =================

    updateStatus: async (mitigationId, status) => {

        const response = await axios.patch(
            `${API_URL}/${mitigationId}/status?status=${status}`,
            {},
            getAuthHeader()
        );

        return response.data;
    },



    // ================= ASSIGN OWNER =================

    assignOwner: async (mitigationId, ownerId) => {

        const response = await axios.patch(
            `${API_URL}/${mitigationId}/assign/${ownerId}`,
            {},
            getAuthHeader()
        );

        return response.data;
    },



    // ================= COMPLETE MITIGATION =================

    completeMitigation: async (mitigationId) => {

        const response = await axios.patch(
            `${API_URL}/${mitigationId}/complete`,
            {},
            getAuthHeader()
        );

        return response.data;
    },



    // ================= GET BY STATUS =================

    getByStatus: async (status) => {

        const response = await axios.get(
            `${API_URL}/status/${status}`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= GET OVERDUE =================

    getOverdueMitigations: async () => {

        const response = await axios.get(
            `${API_URL}/overdue`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= DASHBOARD TOTAL =================

    getTotalMitigations: async () => {

        const response = await axios.get(
            `${API_URL}/dashboard/total`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= DASHBOARD COMPLETED =================

    getCompletedCount: async () => {

        const response = await axios.get(
            `${API_URL}/dashboard/completed`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= DASHBOARD PENDING =================

    getPendingCount: async () => {

        const response = await axios.get(
            `${API_URL}/dashboard/pending`,
            getAuthHeader()
        );

        return response.data;
    },



    // ================= SEARCH =================

    searchMitigation: async (keyword) => {

        const response = await axios.get(
            `${API_URL}/search?keyword=${keyword}`,
            getAuthHeader()
        );

        return response.data;
    }

};



export { MitigationService };

export default MitigationService;