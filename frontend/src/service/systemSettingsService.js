import axios from "axios";

const API_URL =
    "http://localhost:8080/api/admin/system-settings";

const getAuthHeaders = () => {

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("accessToken");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};


// =========================================================
// GET SYSTEM SETTINGS
// =========================================================

export const getSystemSettings = async () => {

    const response = await axios.get(
        API_URL,
        getAuthHeaders()
    );

    return response.data;
};


// =========================================================
// UPDATE SYSTEM SETTINGS
// =========================================================

export const updateSystemSettings = async (data) => {

    const response = await axios.put(
        API_URL,
        data,
        getAuthHeaders()
    );

    return response.data;
};

