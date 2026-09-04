import axios from "axios";
import { getProfile } from "./AuthService";

const API_URL = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

// -----------------------------------------------------------
// Get logged-in employee ID
// -----------------------------------------------------------

const getCurrentEmployeeId = async () => {
  const profile = await getProfile();

  console.log("CURRENT PROFILE:", profile);

  if (!profile?.employeeId) {
    throw new Error(
      "Could not resolve the logged-in auditor's employeeId."
    );
  }

  return profile.employeeId;
};

// -----------------------------------------------------------
// GET assignments for current auditor
// -----------------------------------------------------------

const getAssignmentsForCurrentAuditor = async () => {
  const employeeId = await getCurrentEmployeeId();

  const { data } = await axios.get(
    `${API_URL}/risk-auditor-assignments/auditor/${employeeId}`,
    authHeader()
  );

  console.log("RAW ASSIGNMENTS RESPONSE:", data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
};

// -----------------------------------------------------------
// GET all risks
// -----------------------------------------------------------

const getAllRisks = async () => {
  const { data } = await axios.get(
    `${API_URL}/risks`,
    authHeader()
  );

  console.log("RAW RISKS RESPONSE:", data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
};

// -----------------------------------------------------------
// MERGE RISK + ASSIGNMENT
// -----------------------------------------------------------

const mergeRiskAndAssignment = (assignment, risk = {}) => ({
  riskId: assignment.riskId,

  title: risk.title ?? assignment.riskTitle,

  description: risk.description,

  category:
    risk.category ??
    risk.riskCategory ??
    assignment.category,

  department: risk.department,

  riskLevel: (
    risk.riskLevel ??
    risk.level ??
    ""
  )
    .toString()
    .toUpperCase(),

  riskScore:
    risk.riskScore ??
    risk.score,

  identifiedDate:
    risk.identifiedDate ??
    risk.createdDate,

  targetClosureDate:
    risk.targetClosureDate ??
    assignment.dueDate,

  likelihood: risk.likelihood,

  impact: risk.impact,

  existingControls:
    risk.existingControls,

  mitigationPlan:
    risk.mitigationPlan,

  remarks:
    risk.remarks,

  businessUnit:
    risk.businessUnit,

  processName:
    risk.processName,

  controlOwner:
    risk.controlOwner,

  assignmentId:
    assignment.id,

  assignedAuditor:
    assignment.auditorEmail,

  assignmentDate:
    assignment.assignedAt,

  status:
    assignment.status,

  priority:
    assignment.priority,

  relatedAuditId:
    assignment.relatedAuditId ?? null
});

// -----------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------

export const getAssignedRisks = async () => {
  const [assignments, risks] = await Promise.all([
    getAssignmentsForCurrentAuditor(),
    getAllRisks()
  ]);

  console.log("NORMALIZED ASSIGNMENTS:", assignments);
  console.log("NORMALIZED RISKS:", risks);

  const riskById = new Map(
    risks.map((risk) => [
      risk.riskId,
      risk
    ])
  );

  return assignments.map((assignment) =>
    mergeRiskAndAssignment(
      assignment,
      riskById.get(assignment.riskId)
    )
  );
};

// -----------------------------------------------------------
// GET assigned risk by ID
// -----------------------------------------------------------

export const getAssignedRiskById = async (riskId) => {
    if (!riskId) {
      throw new Error("Risk ID is required.");
    }
  
    console.log("GET ASSIGNED RISK:", riskId);
  
    const assignments = await getAssignmentsForCurrentAuditor();
  
    const assignment = assignments.find(
      (a) => String(a.riskId) === String(riskId)
    );
  
    if (!assignment) {
      throw new Error("This risk is not assigned to you.");
    }
  
    const risks = await getAllRisks();
  
    const risk = risks.find(
      (r) => String(r.riskId) === String(riskId)
    );
  
    if (!risk) {
      throw new Error(`Risk ${riskId} was not found.`);
    }
  
    return mergeRiskAndAssignment(
      assignment,
      risk
    );
  };