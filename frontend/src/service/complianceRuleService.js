import axios from "axios";

const API_URL =
    "http://localhost:8080/api/compliance-rules";

// ============================================================
// AUTH HEADER
// ============================================================

const authHeader = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// ============================================================
// NORMALIZE LIST RESPONSE
// Handles:
// []
// { data: [] }
// { success: true, data: [] }
// ============================================================

const normalizeListResponse = (response) => {
    const body = response?.data;

    if (Array.isArray(body)) {
        return body;
    }

    if (Array.isArray(body?.data)) {
        return body.data;
    }

    return [];
};

// ============================================================
// GET ALL COMPLIANCE RULES
// GET /api/compliance-rules
// ============================================================

export const getAllComplianceRules = async () => {
    try {
        const response = await axios.get(
            API_URL,
            authHeader()
        );

        console.log(
            "COMPLIANCE RULES RESPONSE:",
            response.data
        );

        return normalizeListResponse(response);

    } catch (error) {
        console.error(
            "Failed to load compliance rules:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET COMPLIANCE RULE BY ID
// GET /api/compliance-rules/{id}
// ============================================================

export const getComplianceRuleById = async (id) => {

    if (!id) {
        throw new Error(
            "Compliance rule ID is required"
        );
    }

    try {
        const response = await axios.get(
            `${API_URL}/${id}`,
            authHeader()
        );

        return response.data?.data ||
               response.data ||
               null;

    } catch (error) {
        console.error(
            "Failed to load compliance rule:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// CREATE COMPLIANCE RULE
// POST /api/compliance-rules
// ============================================================

export const createComplianceRule = async (data) => {

    try {
        const response = await axios.post(
            API_URL,
            data,
            authHeader()
        );

        console.log(
            "CREATED COMPLIANCE RULE:",
            response.data
        );

        return response.data?.data ||
               response.data ||
               null;

    } catch (error) {
        console.error(
            "Failed to create compliance rule:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// UPDATE COMPLIANCE RULE
// PUT /api/compliance-rules/{id}
// ============================================================

export const updateComplianceRule = async (
    id,
    data
) => {

    if (!id) {
        throw new Error(
            "Compliance rule ID is required"
        );
    }

    try {
        const response = await axios.put(
            `${API_URL}/${id}`,
            data,
            authHeader()
        );

        console.log(
            "UPDATED COMPLIANCE RULE:",
            response.data
        );

        return response.data?.data ||
               response.data ||
               null;

    } catch (error) {
        console.error(
            "Failed to update compliance rule:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// DELETE COMPLIANCE RULE
// DELETE /api/compliance-rules/{id}
// ============================================================

export const deleteComplianceRule = async (id) => {

    if (!id) {
        throw new Error(
            "Compliance rule ID is required"
        );
    }

    try {
        const response = await axios.delete(
            `${API_URL}/${id}`,
            authHeader()
        );

        console.log(
            "DELETED COMPLIANCE RULE:",
            id
        );

        return response.data;

    } catch (error) {
        console.error(
            "Failed to delete compliance rule:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET RULES BY REGULATORY REQUIREMENT
// GET /api/compliance-rules/regulatory/{regulatoryRequirementId}
// ============================================================

export const getRulesByRegulatoryRequirement = async (
    regulatoryRequirementId
) => {

    if (!regulatoryRequirementId) {
        throw new Error(
            "Regulatory requirement ID is required"
        );
    }

    try {
        const response = await axios.get(
            `${API_URL}/regulatory/${regulatoryRequirementId}`,
            authHeader()
        );

        console.log(
            "RULES BY REGULATORY REQUIREMENT:",
            response.data
        );

        return normalizeListResponse(response);

    } catch (error) {
        console.error(
            "Failed to load rules by regulatory requirement:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// GET RULES BY DEPARTMENT
// GET /api/compliance-rules/department/{department}
// ============================================================

export const getRulesByDepartment = async (
    department
) => {

    if (!department) {
        throw new Error(
            "Department is required"
        );
    }

    try {
        const response = await axios.get(
            `${API_URL}/department/${encodeURIComponent(department)}`,
            authHeader()
        );

        console.log(
            "RULES BY DEPARTMENT:",
            response.data
        );

        return normalizeListResponse(response);

    } catch (error) {
        console.error(
            "Failed to load rules by department:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const ComplianceRuleService = {

    getAllComplianceRules,

    getComplianceRuleById,

    createComplianceRule,

    updateComplianceRule,

    deleteComplianceRule,

    getRulesByRegulatoryRequirement,

    getRulesByDepartment,
};

export default ComplianceRuleService;