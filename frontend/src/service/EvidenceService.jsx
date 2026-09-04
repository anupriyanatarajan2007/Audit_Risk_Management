import axios from "axios";

const BASE_URL = "http://localhost:8080/api/evidence";

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
// RESPONSE NORMALIZER
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
// VALIDATE ID
// ============================================================

const validateId = (value, name) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    throw new Error(`${name} is required`);
  }

  const numericValue = Number(value);

  if (
    !Number.isInteger(numericValue) ||
    numericValue <= 0
  ) {
    throw new Error(`Invalid ${name}: ${value}`);
  }

  return numericValue;
};

// ============================================================
// UPLOAD EVIDENCE
//
// POST /api/evidence/upload
//
// Audit-level evidence:
//
// auditId = 1
// findingId = null
// userId = 5
//
// Finding-level evidence:
//
// auditId = 1
// findingId = 10
// userId = 5
//
// Backend:
// @PreAuthorize("hasAuthority('EVIDENCE_UPLOAD')")
// ============================================================

export const uploadEvidence = async (
  auditId,
  findingId,
  userId,
  file,
  description
) => {
  const numericAuditId = validateId(
    auditId,
    "Audit ID"
  );

  const numericUserId = validateId(
    userId,
    "User ID"
  );

  if (!file) {
    throw new Error(
      "Please select an evidence file"
    );
  }

  // findingId is OPTIONAL
  let numericFindingId = null;

  if (
    findingId !== null &&
    findingId !== undefined &&
    findingId !== ""
  ) {
    numericFindingId = validateId(
      findingId,
      "Finding ID"
    );
  }

  const formData = new FormData();

  // Mandatory
  formData.append(
    "auditId",
    String(numericAuditId)
  );

  // Optional
  if (numericFindingId !== null) {
    formData.append(
      "findingId",
      String(numericFindingId)
    );
  }

  // Mandatory
  formData.append(
    "userId",
    String(numericUserId)
  );

  // Mandatory
  formData.append(
    "file",
    file
  );

  // Optional
  if (
    description &&
    description.trim()
  ) {
    formData.append(
      "description",
      description.trim()
    );
  }

  console.log(
    "UPLOAD EVIDENCE DATA:",
    {
      auditId: numericAuditId,
      findingId: numericFindingId,
      userId: numericUserId,
      fileName: file.name,
      fileSize: file.size,
      description,
    }
  );

  /*
   * IMPORTANT:
   *
   * Do NOT manually set Content-Type.
   *
   * Browser/Axios automatically creates:
   *
   * multipart/form-data; boundary=....
   */

  const response = await axios.post(
    `${BASE_URL}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  console.log(
    "UPLOAD EVIDENCE RESPONSE:",
    response.data
  );

  return response.data;
};

// ============================================================
// CONVENIENCE:
// UPLOAD AUDIT-LEVEL EVIDENCE
//
// findingId = null
// ============================================================

export const uploadAuditEvidence = async (
  auditId,
  userId,
  file,
  description
) => {
  return uploadEvidence(
    auditId,
    null,
    userId,
    file,
    description
  );
};

// ============================================================
// CONVENIENCE:
// UPLOAD FINDING-LEVEL EVIDENCE
// ============================================================

export const uploadFindingEvidence = async (
  auditId,
  findingId,
  userId,
  file,
  description
) => {
  return uploadEvidence(
    auditId,
    findingId,
    userId,
    file,
    description
  );
};

// ============================================================
// GET EVIDENCE BY ID
//
// GET /api/evidence/{evidenceId}
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getEvidenceById = async (
  evidenceId
) => {
  const numericEvidenceId = validateId(
    evidenceId,
    "Evidence ID"
  );

  const response = await axios.get(
    `${BASE_URL}/${numericEvidenceId}`,
    authHeader()
  );

  return response.data;
};

// ============================================================
// GET ALL EVIDENCE
//
// GET /api/evidence
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getAllEvidence = async () => {
  const response = await axios.get(
    BASE_URL,
    authHeader()
  );

  console.log(
    "ALL EVIDENCE RESPONSE:",
    response.data
  );

  return normalizeListResponse(response);
};

// ============================================================
// GET EVIDENCE BY AUDIT
//
// GET /api/evidence/audit/{auditId}
//
// Returns:
// - Audit-level evidence
// - Finding-level evidence under this audit
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getEvidenceByAudit = async (
  auditId
) => {
  const numericAuditId = validateId(
    auditId,
    "Audit ID"
  );

  const response = await axios.get(
    `${BASE_URL}/audit/${numericAuditId}`,
    authHeader()
  );

  console.log(
    "EVIDENCE BY AUDIT RESPONSE:",
    response.data
  );

  return normalizeListResponse(response);
};

// ============================================================
// GET EVIDENCE BY FINDING
//
// GET /api/evidence/finding/{findingId}
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getEvidenceByFinding = async (
  findingId
) => {
  const numericFindingId = validateId(
    findingId,
    "Finding ID"
  );

  const response = await axios.get(
    `${BASE_URL}/finding/${numericFindingId}`,
    authHeader()
  );

  console.log(
    "EVIDENCE BY FINDING RESPONSE:",
    response.data
  );

  return normalizeListResponse(response);
};

// ============================================================
// GET EVIDENCE BY AUDIT + FINDING
//
// GET /api/evidence/audit/{auditId}/finding/{findingId}
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getEvidenceByAuditAndFinding = async (
  auditId,
  findingId
) => {
  const numericAuditId = validateId(
    auditId,
    "Audit ID"
  );

  const numericFindingId = validateId(
    findingId,
    "Finding ID"
  );

  const response = await axios.get(
    `${BASE_URL}/audit/${numericAuditId}/finding/${numericFindingId}`,
    authHeader()
  );

  console.log(
    "EVIDENCE BY AUDIT + FINDING RESPONSE:",
    response.data
  );

  return normalizeListResponse(response);
};

// ============================================================
// GET EVIDENCE BY FINDING + STATUS
//
// GET /api/evidence/finding/{findingId}/status/{status}
//
// Example:
// /finding/10/status/PENDING
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getEvidenceByFindingAndStatus = async (
  findingId,
  status
) => {
  const numericFindingId = validateId(
    findingId,
    "Finding ID"
  );

  if (!status) {
    throw new Error(
      "Evidence status is required"
    );
  }

  const response = await axios.get(
    `${BASE_URL}/finding/${numericFindingId}/status/${String(
      status
    ).toUpperCase()}`,
    authHeader()
  );

  console.log(
    "EVIDENCE BY FINDING + STATUS RESPONSE:",
    response.data
  );

  return normalizeListResponse(response);
};

// ============================================================
// GET EVIDENCE BY USER
//
// GET /api/evidence/user/{userId}
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getEvidenceByUser = async (
  userId
) => {
  const numericUserId = validateId(
    userId,
    "User ID"
  );

  const response = await axios.get(
    `${BASE_URL}/user/${numericUserId}`,
    authHeader()
  );

  console.log(
    "EVIDENCE BY USER RESPONSE:",
    response.data
  );

  return normalizeListResponse(response);
};

// ============================================================
// GET PENDING EVIDENCE
//
// GET /api/evidence/pending
//
// Authority:
// EVIDENCE_VIEW
// ============================================================

export const getPendingEvidence = async () => {
  const response = await axios.get(
    `${BASE_URL}/pending`,
    authHeader()
  );

  console.log(
    "PENDING EVIDENCE RESPONSE:",
    response.data
  );

  return normalizeListResponse(response);
};

// ============================================================
// APPROVE EVIDENCE
//
// PUT /api/evidence/{evidenceId}/approve
//
// Authority:
// EVIDENCE_APPROVE
// ============================================================

export const approveEvidence = async (
  evidenceId
) => {
  const numericEvidenceId = validateId(
    evidenceId,
    "Evidence ID"
  );

  const response = await axios.put(
    `${BASE_URL}/${numericEvidenceId}/approve`,
    {},
    authHeader()
  );

  console.log(
    "APPROVED EVIDENCE:",
    response.data
  );

  return response.data;
};

// ============================================================
// REJECT EVIDENCE
//
// PUT /api/evidence/{evidenceId}/reject
//
// Authority:
// EVIDENCE_REJECT
// ============================================================

export const rejectEvidence = async (
  evidenceId
) => {
  const numericEvidenceId = validateId(
    evidenceId,
    "Evidence ID"
  );

  const response = await axios.put(
    `${BASE_URL}/${numericEvidenceId}/reject`,
    {},
    authHeader()
  );

  console.log(
    "REJECTED EVIDENCE:",
    response.data
  );

  return response.data;
};

// ============================================================
// GET EVIDENCE FILE URL
// ============================================================

export const getEvidenceFileUrl = (
  evidence
) => {
  if (!evidence) {
    return null;
  }

  const fileUrl =
    evidence.fileUrl ||
    evidence.filePath ||
    evidence.url;

  if (!fileUrl) {
    console.warn(
      "Evidence file URL not found:",
      evidence
    );

    return null;
  }

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  return `http://localhost:8080${
    fileUrl.startsWith("/")
      ? ""
      : "/"
  }${fileUrl}`;
};

// ============================================================
// OPEN EVIDENCE
// ============================================================

export const openEvidence = (
  evidence
) => {
  const url =
    getEvidenceFileUrl(evidence);

  if (!url) {
    console.error(
      "Cannot open evidence. URL missing:",
      evidence
    );

    throw new Error(
      "Evidence file URL is not available"
    );
  }

  console.log(
    "OPENING EVIDENCE:",
    url
  );

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
};

// ============================================================
// DELETE EVIDENCE
//
// DELETE /api/evidence/{evidenceId}
//
// Authority:
// EVIDENCE_DELETE
// ============================================================

export const deleteEvidence = async (
  evidenceId
) => {
  const numericEvidenceId = validateId(
    evidenceId,
    "Evidence ID"
  );

  const response = await axios.delete(
    `${BASE_URL}/${numericEvidenceId}`,
    authHeader()
  );

  console.log(
    "DELETED EVIDENCE:",
    numericEvidenceId
  );

  return response.data;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const EvidenceService = {
  uploadEvidence,
  uploadAuditEvidence,
  uploadFindingEvidence,

  getAllEvidence,
  getEvidenceById,

  getEvidenceByAudit,
  getEvidenceByFinding,
  getEvidenceByAuditAndFinding,
  getEvidenceByFindingAndStatus,

  getEvidenceByUser,
  getPendingEvidence,

  approveEvidence,
  rejectEvidence,

  getEvidenceFileUrl,
  openEvidence,

  deleteEvidence,
};

export default EvidenceService;