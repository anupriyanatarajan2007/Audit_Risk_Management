import axios from "axios";

const API_URL = "http://localhost:8080/api/roles";

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
// CREATE ROLE
// ==========================================

export const createRole = async (role) => {
    const response = await axios.post(
        API_URL,
        role,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET ALL ROLES
// ==========================================

export const getAllRoles = async () => {
    const response = await axios.get(
        API_URL,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET ROLE BY ID
// ==========================================

export const getRoleById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// UPDATE ROLE
// ==========================================

export const updateRole = async (id, role) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        role,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// DELETE ROLE
// ==========================================

export const deleteRole = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// ASSIGN PERMISSION TO ROLE
// ==========================================

export const assignPermission = async (
    roleId,
    permissionId
) => {
    const response = await axios.post(
        `${API_URL}/${roleId}/permissions/${permissionId}`,
        {},
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// REMOVE PERMISSION FROM ROLE
// ==========================================

export const removePermission = async (
    roleId,
    permissionId
) => {
    const response = await axios.delete(
        `${API_URL}/${roleId}/permissions/${permissionId}`,
        getAuthHeaders()
    );

    return response.data;
};


// ==========================================
// GET PERMISSIONS OF ROLE
// ==========================================

export const getRolePermissions = async (roleId) => {
    const response = await axios.get(
        `${API_URL}/${roleId}/permissions`,
        getAuthHeaders()
    );

    return response.data;
};