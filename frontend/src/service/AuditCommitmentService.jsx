import axios from "axios";

const BASE_URL = "http://localhost:8080";

// ============================================================
// CREATE AUDIT COMMITMENT
// ============================================================
export const createAuditCommitment = async (data) => {
    const response = await axios.post(
        `${BASE_URL}/api/audit-commitments`,
        data
    );

    return response.data;
};

// ============================================================
// GET ALL AUDIT COMMITMENTS
// ============================================================
export const getAllAuditCommitments = async () => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments`
    );

    return response.data;
};

// ============================================================
// GET AUDIT COMMITMENT BY ID
// ============================================================
export const getAuditCommitmentById = async (id) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/${id}`
    );

    return response.data;
};

// ============================================================
// GET COMMITMENTS BY AUDITOR
// ============================================================
export const getCommitmentsByAuditor = async (auditorId) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/auditor/${auditorId}`
    );

    return response.data;
};

// ============================================================
// GET ACTIVE COMMITMENTS BY AUDITOR
// ============================================================
export const getActiveCommitmentsByAuditor = async (auditorId) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/auditor/${auditorId}/active`
    );

    return response.data;
};

// ============================================================
// CHECK AUDITOR AVAILABILITY
// ============================================================
export const checkAuditorAvailability = async (auditorId) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/auditor/${auditorId}/availability`
    );

    return response.data;
};

// ============================================================
// GET COMMITMENTS BY AUDITEE
// ============================================================
export const getCommitmentsByAuditee = async (auditeeId) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/auditee/${auditeeId}`
    );

    return response.data;
};

// ============================================================
// GET ACTIVE COMMITMENTS BY AUDITEE
// ============================================================
export const getActiveCommitmentsByAuditee = async (auditeeId) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/auditee/${auditeeId}/active`
    );

    return response.data;
};

// ============================================================
// GET AUDITEE WORKLOAD
// ============================================================
export const getAuditeeWorkload = async (auditeeId) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/auditee/${auditeeId}/workload`
    );

    return response.data;
};

// ============================================================
// GET COMMITMENTS BY AUDIT
// ============================================================
export const getCommitmentsByAudit = async (auditId) => {
    const response = await axios.get(
        `${BASE_URL}/api/audit-commitments/audit/${auditId}`
    );

    return response.data;
};

// ============================================================
// UPDATE COMMITMENT STATUS
// ============================================================
export const updateAuditCommitmentStatus = async (id, status) => {
    const response = await axios.put(
        `${BASE_URL}/api/audit-commitments/${id}/status`,
        null,
        {
            params: {
                status: status,
            },
        }
    );

    return response.data;
};

// ============================================================
// DELETE AUDIT COMMITMENT
// ============================================================
export const deleteAuditCommitment = async (id) => {
    const response = await axios.delete(
        `${BASE_URL}/api/audit-commitments/${id}`
    );

    return response.data;
};
