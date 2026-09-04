
import axios from "axios";

const API_URL = "http://localhost:8080/api/audits";

// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  return localStorage.getItem("token");
};

// ============================================================
// AUTH HEADER
// ============================================================

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// ============================================================
// GET ALL AUDITS
// ============================================================

export const getAllAudits = async () => {
  const response = await axios.get(
    API_URL,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET AUDIT BY DATABASE ID
// Backend: GET /api/audits/{id}
// id MUST be numeric database ID
// ============================================================

export const getAuditById = async (id) => {

  if (
    id === undefined ||
    id === null ||
    id === "" ||
    id === ":id" ||
    id === ":auditId"
  ) {
    throw new Error("Valid Audit ID is required");
  }

  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(
      `Invalid Audit ID: ${id}. Database ID must be numeric.`
    );
  }

  console.log("Fetching audit with database ID:", numericId);

  const response = await axios.get(
    `${API_URL}/${numericId}`,
    authHeader()
  );

  console.log(
    "AUDIT DETAILS RAW RESPONSE:",
    response.data
  );

  return response.data?.data || null;
};

// ============================================================
// GET AUDITS BY INTERNAL AUDITOR
// ============================================================

export const getAuditsByInternalAuditor = async (auditorId) => {

  if (!auditorId) {
    throw new Error(
      "Internal Auditor ID is missing"
    );
  }

  const response = await axios.get(
    `${API_URL}/auditor/${auditorId}`,
    authHeader()
  );

  console.log(
    "MY AUDITS RAW RESPONSE:",
    response.data
  );

  return response.data?.data || [];
};

// ============================================================
// CREATE AUDIT
// ============================================================

export const createAudit = async (auditData) => {

  const response = await axios.post(
    API_URL,
    auditData,
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// UPDATE AUDIT
// ============================================================

export const updateAudit = async (
  id,
  auditData
) => {

  if (!id) {
    throw new Error("Audit ID is required");
  }

  const response = await axios.put(
    `${API_URL}/${id}`,
    auditData,
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// DELETE AUDIT
// ============================================================

export const deleteAudit = async (id) => {

  if (!id) {
    throw new Error("Audit ID is required");
  }

  const response = await axios.delete(
    `${API_URL}/${id}`,
    authHeader()
  );

  return response.data;
};

// ============================================================
// ASSIGN INTERNAL AUDITOR
// ============================================================

export const assignInternalAuditor = async (
  auditId,
  auditorId
) => {

  if (!auditId) {
    throw new Error("Audit ID is required");
  }

  if (!auditorId) {
    throw new Error("Auditor ID is required");
  }

  const response = await axios.put(
    `${API_URL}/${auditId}/assign/${auditorId}`,
    {},
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// UPDATE AUDIT STATUS
// ============================================================

export const updateAuditStatus = async (
  auditId,
  status
) => {

  if (!auditId) {
    throw new Error("Audit ID is required");
  }

  if (!status) {
    throw new Error("Audit status is required");
  }

  const response = await axios.put(
    `${API_URL}/${auditId}/status`,
    null,
    {
      ...authHeader(),
      params: {
        status,
      },
    }
  );

  return response.data?.data || null;
};

// ============================================================
// GET AUDITS FOR CURRENT INTERNAL AUDITOR
// ============================================================

export const getMyAssignedAudits = async () => {

  const response = await axios.get(
    `${API_URL}/my-assigned`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET AUDITS FOR CURRENT AUDITEE
// ============================================================

export const getMyAuditeeAudits = async () => {

  const response = await axios.get(
    `${API_URL}/my-audits`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const AuditService = {
  getAllAudits,
  getAuditById,
  getAuditsByInternalAuditor,
  createAudit,
  updateAudit,
  deleteAudit,
  assignInternalAuditor,
  updateAuditStatus,
  getMyAssignedAudits,
  getMyAuditeeAudits,
};

export default AuditService;

