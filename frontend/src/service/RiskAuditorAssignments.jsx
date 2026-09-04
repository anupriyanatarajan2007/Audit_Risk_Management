
import axios from "axios";

// =========================================================
// AXIOS INSTANCE
// =========================================================

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// =========================================================
// JWT TOKEN
// =========================================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// =========================================================
// BASE URL
// =========================================================

const BASE_URL = "/risk-auditor-assignments";

// =========================================================
// CREATE ASSIGNMENT
// POST /api/risk-auditor-assignments
// =========================================================

export const createAssignment = async (assignmentData) => {
    const response = await api.post(
        BASE_URL,
        assignmentData
    );

    return response.data;
};

// =========================================================
// GET ALL ASSIGNMENTS
// GET /api/risk-auditor-assignments
// =========================================================

export const getAllAssignments = async () => {
    const response = await api.get(BASE_URL);

    return response.data;
};

// =========================================================
// GET ASSIGNMENT BY ID
// GET /api/risk-auditor-assignments/{id}
// =========================================================

export const getAssignmentById = async (id) => {
    const response = await api.get(
        `${BASE_URL}/${id}`
    );

    return response.data;
};

// =========================================================
// GET ASSIGNMENTS BY RISK ID
// GET /api/risk-auditor-assignments/risk/{riskId}
// =========================================================

export const getAssignmentsByRiskId = async (riskId) => {
    const response = await api.get(
        `${BASE_URL}/risk/${riskId}`
    );

    return response.data;
};

// =========================================================
// GET ASSIGNMENTS BY AUDITOR
// GET /api/risk-auditor-assignments/auditor/{employeeId}
// =========================================================

export const getAssignmentsByAuditor = async (employeeId) => {
    const response = await api.get(
        `${BASE_URL}/auditor/${employeeId}`
    );

    return response.data;
};

// =========================================================
// GET ASSIGNMENTS BY STATUS
// GET /api/risk-auditor-assignments/status/{status}
// =========================================================

export const getAssignmentsByStatus = async (status) => {
    const response = await api.get(
        `${BASE_URL}/status/${status}`
    );

    return response.data;
};

// =========================================================
// GET BY AUDITOR + STATUS
// GET /api/risk-auditor-assignments/auditor/{employeeId}/status/{status}
// =========================================================

export const getAssignmentsByAuditorAndStatus = async (
    employeeId,
    status
) => {
    const response = await api.get(
        `${BASE_URL}/auditor/${employeeId}/status/${status}`
    );

    return response.data;
};

// =========================================================
// GET ASSIGNMENTS BY ASSIGNED BY
// GET /api/risk-auditor-assignments/assigned-by/{employeeId}
// =========================================================

export const getAssignmentsByAssignedBy = async (
    employeeId
) => {
    const response = await api.get(
        `${BASE_URL}/assigned-by/${employeeId}`
    );

    return response.data;
};

// =========================================================
// UPDATE STATUS
// PATCH /api/risk-auditor-assignments/{id}/status
// =========================================================

export const updateAssignmentStatus = async (
    id,
    status
) => {
    const response = await api.patch(
        `${BASE_URL}/${id}/status`,
        null,
        {
            params: {
                status: status,
            },
        }
    );

    return response.data;
};

// =========================================================
// UPDATE PRIORITY
// PATCH /api/risk-auditor-assignments/{id}/priority
// =========================================================

export const updateAssignmentPriority = async (
    id,
    priority
) => {
    const response = await api.patch(
        `${BASE_URL}/${id}/priority`,
        null,
        {
            params: {
                priority: priority,
            },
        }
    );

    return response.data;
};

// =========================================================
// DELETE ASSIGNMENT
// DELETE /api/risk-auditor-assignments/{id}
// =========================================================

export const deleteAssignment = async (id) => {
    await api.delete(
        `${BASE_URL}/${id}`
    );

    return true;
};

// export const getAllRisksForAssignment = async () => {
//     const response = await api.get("/risks");
//     return response.data;
// };


export const getAllRisksForAssignment = async () => {
    const response = await api.get("/risks");
    return response.data;
};
export default api;

