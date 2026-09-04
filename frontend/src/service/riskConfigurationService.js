import axios from "axios";

const API_URL = "http://localhost:8080/api/risk-configuration";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

const RiskConfigurationService = {

    // ==========================================
    // GET CURRENT RISK CONFIGURATION
    // ==========================================

    getConfiguration: async () => {

        const response = await axios.get(
            API_URL,
            getAuthHeader()
        );

        return response.data;
    },


    // ==========================================
    // UPDATE RISK CONFIGURATION
    // ==========================================

    updateConfiguration: async (configurationData) => {

        const response = await axios.put(
            API_URL,
            configurationData,
            getAuthHeader()
        );

        return response.data;
    }

};

export default RiskConfigurationService;