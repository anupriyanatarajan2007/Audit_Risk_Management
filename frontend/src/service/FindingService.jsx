import axios from "axios";

const API_URL = "http://localhost:8080/api/findings";
const AUDIT_API_URL = "http://localhost:8080/api/audits";

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
// GET CURRENT USER
// ============================================================
const getCurrentUser = () => {
  try {
    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));

    return user;
  } catch (error) {
    console.error("Unable to read current user:", error);
    return null;
  }
};

// ============================================================
// GET CURRENT AUDITOR ID
// ============================================================
//
// Tries common fields:
// id
// userId
// employeeId
// auditorId
//
// If your login stores a different field, change it here.
// ============================================================
const getCurrentAuditorId = () => {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    user.auditorId ||
    user.userId ||
    user.id ||
    user.employeeId ||
    null
  );
};

// ============================================================
// GET ALL AUDITS
// GET /api/audits
// ============================================================
export const getAllAudits = async () => {
  const response = await axios.get(
    AUDIT_API_URL,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET AUDIT BY ID
// GET /api/audits/{id}
// ============================================================
export const getAuditById = async (id) => {
  if (!id) {
    throw new Error("Audit ID is required");
  }

  const response = await axios.get(
    `${AUDIT_API_URL}/${id}`,
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// GET AUDITS BY INTERNAL AUDITOR
// GET /api/audits/auditor/{auditorId}
// ============================================================
export const getAuditsByInternalAuditor = async (auditorId) => {
  if (!auditorId) {
    throw new Error("Internal Auditor ID is missing");
  }

  const response = await axios.get(
    `${AUDIT_API_URL}/auditor/${auditorId}`,
    authHeader()
  );

  console.log(
    "MY AUDITS RAW RESPONSE:",
    response.data
  );

  return response.data?.data || [];
};

export const getAuditsForCurrentAuditor = async () => {
  try {
    const response = await axios.get(
      `${AUDIT_API_URL}/my-assigned`,
      authHeader()
    );

    console.log(
      "MY ASSIGNED AUDITS RESPONSE:",
      response.data
    );

    return response.data?.data || [];
  } catch (error) {
    console.error(
      "Failed to load assigned audits:",
      error.response?.data || error
    );

    throw error;
  }
};

// ============================================================
// CREATE AUDIT
// POST /api/audits
// ============================================================
export const createAudit = async (auditData) => {
  const response = await axios.post(
    AUDIT_API_URL,
    auditData,
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// UPDATE AUDIT
// PUT /api/audits/{id}
// ============================================================
export const updateAudit = async (
  id,
  auditData
) => {
  if (!id) {
    throw new Error("Audit ID is required");
  }

  const response = await axios.put(
    `${AUDIT_API_URL}/${id}`,
    auditData,
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// DELETE AUDIT
// DELETE /api/audits/{id}
// ============================================================
export const deleteAudit = async (id) => {
  if (!id) {
    throw new Error("Audit ID is required");
  }

  const response = await axios.delete(
    `${AUDIT_API_URL}/${id}`,
    authHeader()
  );

  return response.data;
};

// ============================================================
// ASSIGN INTERNAL AUDITOR
// PUT /api/audits/{auditId}/assign/{auditorId}
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
    `${AUDIT_API_URL}/${auditId}/assign/${auditorId}`,
    {},
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// UPDATE AUDIT STATUS
// PUT /api/audits/{auditId}/status?status=...
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
    `${AUDIT_API_URL}/${auditId}/status`,
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
// FINDINGS
// ============================================================

// ============================================================
// CREATE FINDING
// POST /api/findings
// ============================================================
export const createFinding = async (
  findingData
) => {
  if (!findingData?.auditId) {
    throw new Error("Please select an audit");
  }

  const response = await axios.post(
    API_URL,
    findingData,
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// GET ALL FINDINGS
// GET /api/findings
// ============================================================
export const getAllFindings = async () => {
  const response = await axios.get(
    API_URL,
    authHeader()
  );

  console.log(
    "RAW FINDINGS RESPONSE:",
    response.data
  );

  return response.data?.data || [];
};

// ============================================================
// GET FINDING BY ID
// GET /api/findings/{id}
// ============================================================
export const getFindingById = async (id) => {
  if (!id) {
    throw new Error("Finding ID is required");
  }

  const response = await axios.get(
    `${API_URL}/${id}`,
    authHeader()
  );

  return response.data?.data || null;
};

// ============================================================
// GET FINDINGS BY AUDIT
// GET /api/findings/audit/{auditId}
// ============================================================
export const getFindingsByAuditId = async (
  auditId
) => {
  if (!auditId) {
    throw new Error("Audit ID is required");
  }

  const response = await axios.get(
    `${API_URL}/audit/${auditId}`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET FINDINGS BY AUDITOR
// GET /api/findings/auditor/{auditorId}
// ============================================================
export const getFindingsByAuditorId = async (
  auditorId
) => {
  if (!auditorId) {
    throw new Error(
      "Internal Auditor ID is missing"
    );
  }

  const response = await axios.get(
    `${API_URL}/auditor/${auditorId}`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET FINDINGS BY STATUS
// GET /api/findings/status/{status}
// ============================================================
export const getFindingsByStatus = async (
  status
) => {
  if (!status) {
    throw new Error("Finding status is required");
  }

  const response = await axios.get(
    `${API_URL}/status/${status}`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET FINDINGS BY RISK LEVEL
// GET /api/findings/risk-level/{riskLevel}
// ============================================================
export const getFindingsByRiskLevel = async (
  riskLevel
) => {
  if (!riskLevel) {
    throw new Error("Risk level is required");
  }

  const response = await axios.get(
    `${API_URL}/risk-level/${riskLevel}`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET AUDITOR FINDINGS BY STATUS
// GET /api/findings/auditor/{auditorId}/status/{status}
// ============================================================
export const getFindingsByAuditorAndStatus = async (
  auditorId,
  status
) => {
  if (!auditorId) {
    throw new Error(
      "Internal Auditor ID is missing"
    );
  }

  if (!status) {
    throw new Error(
      "Finding status is required"
    );
  }

  const response = await axios.get(
    `${API_URL}/auditor/${auditorId}/status/${status}`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// GET AUDIT FINDINGS BY RISK LEVEL
// GET /api/findings/audit/{auditId}/risk-level/{riskLevel}
// ============================================================
export const getFindingsByAuditAndRiskLevel = async (
  auditId,
  riskLevel
) => {
  if (!auditId) {
    throw new Error("Audit ID is required");
  }

  if (!riskLevel) {
    throw new Error("Risk level is required");
  }

  const response = await axios.get(
    `${API_URL}/audit/${auditId}/risk-level/${riskLevel}`,
    authHeader()
  );

  return response.data?.data || [];
};

// ============================================================
// UPDATE FINDING
// PUT /api/findings/{id}
// ============================================================
export const updateFinding = async (id, findingData) => {
  if (!id) {
      throw new Error("Finding ID is required");
  }

  const response = await axios.put(
      `${API_URL}/${id}`,
      findingData,
      authHeader()
  );

  console.log("UPDATE FINDING RESPONSE:", response.data);

  return response.data?.data || null;
};

// ============================================================
// DELETE FINDING
// DELETE /api/findings/{id}
// ============================================================
export const deleteFinding = async (id) => {
  if (!id) {
    throw new Error("Finding ID is required");
  }

  const response = await axios.delete(
    `${API_URL}/${id}`,
    authHeader()
  );

  return response.data;
};