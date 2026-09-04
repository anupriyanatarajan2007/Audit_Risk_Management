import axios from "axios";

const API_URL = "http://localhost:8080/api/permissions";

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


// ==========================================
// CREATE PERMISSION
// ==========================================

export const createPermission = async (permission) => {
    const response = await axios.post(
        API_URL,
        permission,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET ALL PERMISSIONS
// ==========================================

export const getAllPermissions = async () => {
    const response = await axios.get(
        API_URL,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET PERMISSION BY ID
// ==========================================

export const getPermissionById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// UPDATE PERMISSION
// ==========================================

export const updatePermission = async (
    id,
    permission
) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        permission,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// DELETE PERMISSION
// ==========================================

export const deletePermission = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET PERMISSIONS BY MODULE
// ==========================================

export const getPermissionsByModule = async (module) => {
    const response = await axios.get(
        `${API_URL}/module/${module}`,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET ACTIVE PERMISSIONS
// ==========================================

export const getActivePermissions = async () => {
    const response = await axios.get(
        `${API_URL}/active`,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET ACTIVE PERMISSIONS BY MODULE
// ==========================================

export const getActivePermissionsByModule = async (
    module
) => {
    const response = await axios.get(
        `${API_URL}/module/${module}/active`,
        getAuthHeaders()
    );

    return response.data;
};