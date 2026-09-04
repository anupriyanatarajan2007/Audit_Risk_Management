import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/departments";

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
// CREATE DEPARTMENT
// POST /api/departments
// ===============================
export const createDepartment = async (department) => {
    const response = await axios.post(
        API_BASE_URL,
        department,
        getAuthHeaders()
    );

    return response.data;
};

// ===============================
// GET ALL DEPARTMENTS
// GET /api/departments
// ===============================
export const getAllDepartments = async () => {
    const response = await axios.get(
        API_BASE_URL,
        getAuthHeaders()
    );

    return response.data;
};

// ===============================
// GET DEPARTMENT BY ID
// GET /api/departments/{id}
// ===============================
export const getDepartmentById = async (id) => {
    const response = await axios.get(
        `${API_BASE_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};

// ===============================
// UPDATE DEPARTMENT
// PUT /api/departments/{id}
// ===============================
export const updateDepartment = async (id, department) => {
    const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        department,
        getAuthHeaders()
    );

    return response.data;
};

// ===============================
// DELETE DEPARTMENT
// DELETE /api/departments/{id}
// ===============================
export const deleteDepartment = async (id) => {
    const response = await axios.delete(
        `${API_BASE_URL}/${id}`,
        getAuthHeaders()
    );

    return response.data;
};