import axios from "axios";

const API_URL = "http://localhost:8080/api/audits";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// ============================================================
// GET AUDITS ASSIGNED TO / RELEVANT FOR THE LOGGED-IN AUDITEE
// Backend must resolve the auditee from the JWT (SecurityContext),
// same pattern as getAuditsForCurrentInternalAuditor().
// ============================================================
export const getMyAudits = async () => {
  const response = await axios.get(`${API_URL}/my-audits`, authHeader());
  return response.data?.data || [];
};

// ============================================================
// GET SINGLE AUDIT DETAILS (for quick view / full details page)
// ============================================================
export const getAuditById = async (auditId) => {
  const response = await axios.get(`${API_URL}/${auditId}`, authHeader());
  return response.data?.data || null;
};

// ============================================================
// GET STATISTICS (optional dedicated endpoint).
// If the backend endpoint doesn't exist yet, this fails silently
// and the caller falls back to computing stats client-side from
// getMyAudits() — see AuditeeMyAudits.jsx.
// ============================================================
export const getAuditStatistics = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/my-audits/statistics`,
      authHeader()
    );
    return response.data?.data || null;
  } catch (err) {
    return null;
  }
};

// ============================================================
// SERVER-SIDE SEARCH (optional — page currently filters client-side,
// swap in once the backend supports query params).
// ============================================================
export const searchMyAudits = async (params = {}) => {
  const response = await axios.get(`${API_URL}/my-audits/search`, {
    ...authHeader(),
    params,
  });
  return response.data?.data || [];
};

export default {
  getMyAudits,
  getAuditById,
  getAuditStatistics,
  searchMyAudits,
};