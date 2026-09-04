import axios from "axios";

const API_URL = "http://localhost:8080/api/auditee-assignments";

// ============================================================
// AUTH HEADER
// ============================================================

const getToken = () => {
    return localStorage.getItem("token");
};

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    },
});


// ============================================================
// ASSIGN AUDITEE
// POST /api/auditee-assignments
// ============================================================

const assignAuditee = async (assignmentData) => {

    const response = await axios.post(
        API_URL,
        assignmentData,
        authHeader()
    );

    return response.data;
};


// ============================================================
// GET ALL ASSIGNMENTS
// GET /api/auditee-assignments
// ============================================================

const getAllAssignments = async () => {

    const response = await axios.get(
        API_URL,
        authHeader()
    );

    return response.data;
};


// ============================================================
// GET ASSIGNMENT BY ID
// GET /api/auditee-assignments/{id}
// ============================================================

const getAssignmentById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        authHeader()
    );

    return response.data;
};


// ============================================================
// GET ASSIGNMENTS BY AUDIT
// GET /api/auditee-assignments/audit/{auditId}
// ============================================================

const getAssignmentsByAudit = async (auditId) => {

    const response = await axios.get(
        `${API_URL}/audit/${auditId}`,
        authHeader()
    );

    return response.data;
};


// ============================================================
// GET ASSIGNMENTS BY AUDITEE
// GET /api/auditee-assignments/auditee/{auditeeId}
// ============================================================

const getAssignmentsByAuditee = async (auditeeId) => {

    const response = await axios.get(
        `${API_URL}/auditee/${auditeeId}`,
        authHeader()
    );

    return response.data;
};


// ============================================================
// GET ASSIGNMENTS BY AUDIT MANAGER
// GET /api/auditee-assignments/assigned-by/{assignedById}
// ============================================================

const getAssignmentsByAssignedBy = async (assignedById) => {

    const response = await axios.get(
        `${API_URL}/assigned-by/${assignedById}`,
        authHeader()
    );

    return response.data;
};


// ============================================================
// UPDATE ASSIGNMENT STATUS
// PUT /api/auditee-assignments/{id}/status?status=...
// ============================================================
const updateStatus = async (id, status) => {
    console.log("========== UPDATE STATUS ==========");
    console.log("Assignment ID:", id);
    console.log("New Status:", status);
    console.log("URL:", `${API_URL}/${id}/status`);
  
    try {
      const response = await axios.put(
        `${API_URL}/${id}/status`,
        null,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          params: {
            status: status,
          },
        }
      );
  
      console.log("STATUS UPDATE RESPONSE:", response);
      console.log("UPDATED ASSIGNMENT:", response.data);
  
      return response.data;
    } catch (error) {
      console.error("========== STATUS UPDATE ERROR ==========");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);
  
      throw error;
    }
  };
// ============================================================
// DELETE ASSIGNMENT
// DELETE /api/auditee-assignments/{id}
// ============================================================

const deleteAssignment = async (id) => {

    const response = await axios.delete(
        `${API_URL}/${id}`,
        authHeader()
    );

    return response.data;
};


// ============================================================
// EXPORT
// ============================================================

const auditeeAssignmentService = {

    assignAuditee,
    getAllAssignments,
    getAssignmentById,
    getAssignmentsByAudit,
    getAssignmentsByAuditee,
    getAssignmentsByAssignedBy,
    updateStatus,
    deleteAssignment,
};

export default auditeeAssignmentService;