import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/organizations";

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
// CREATE ORGANIZATION
// POST /api/organizations
// ==========================================
export const createOrganization = async (organization) => {
    const response = await axios.post(
        API_BASE_URL,
        organization,
        getAuthHeaders()
    );

    return response.data;
};

// ==========================================
// GET ORGANIZATION BY ID
// GET /api/organizations/{id}
// ==========================================
export const getOrganizationById = async (id) => {
    const response = await axios.get(
        `${API_BASE_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};

// ==========================================
// GET ALL ORGANIZATIONS
// GET /api/organizations
// ==========================================
export const getAllOrganizations = async () => {
    const response = await axios.get(
        API_BASE_URL,
        getAuthHeaders()
    );

    return response.data;
};

// ==========================================
// GET ORGANIZATIONS BY STATUS
// GET /api/organizations/status?active=true
// ==========================================
export const getOrganizationsByStatus = async (active) => {
    const response = await axios.get(
        `${API_BASE_URL}/status`,
        {
            ...getAuthHeaders(),
            params: {
                active: active,
            },
        }
    );

    return response.data;
};

// ==========================================
// UPDATE ORGANIZATION
// PUT /api/organizations/{id}
// ==========================================
export const updateOrganization = async (id, organization) => {
    const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        organization,
        getAuthHeaders()
    );

    return response.data;
};

// ==========================================
// DELETE ORGANIZATION
// DELETE /api/organizations/{id}
// ==========================================
export const deleteOrganization = async (id) => {
    const response = await axios.delete(
        `${API_BASE_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};

// ==========================================
// ACTIVATE ORGANIZATION
// PATCH /api/organizations/{id}/activate
// ==========================================
export const activateOrganization = async (id) => {
    const response = await axios.patch(
        `${API_BASE_URL}/${id}/activate`,
        {},
        getAuthHeaders()
    );

    return response.data;
};

// ==========================================
// DEACTIVATE ORGANIZATION
// PATCH /api/organizations/{id}/deactivate
// ==========================================
export const deactivateOrganization = async (id) => {
    const response = await axios.patch(
        `${API_BASE_URL}/${id}/deactivate`,
        {},
        getAuthHeaders()
    );

    return response.data;
};