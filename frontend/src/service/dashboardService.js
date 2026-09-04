// src/services/dashboardService.js
import RiskService from "./riskService";
import AuditService from "./auditService";
import { getAllUsers } from "./authService";
import { getAllRoles } from "./roleService";
import { getAllOrganizations } from "./organizationService";

// ============================================================
// GENERIC HELPERS
// ============================================================

function pick(obj, paths = []) {
    for (const path of paths) {
        const val = path
            .split(".")
            .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
        if (val !== undefined && val !== null && val !== "") return val;
    }
    return undefined;
}

function toArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function monthKey(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString("en-US", { month: "short", year: "2-digit" });
}

function groupCount(list, labelFn) {
    const map = {};
    list.forEach((item) => {
        const label = labelFn(item) || "Unknown";
        map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count }));
}

// ============================================================
// FIELD RESOLVERS
// ============================================================

const RISK_FIELDS = {
    level: ["riskLevel", "level", "severity"],
    status: ["status", "riskStatus"],
    department: ["department.name", "departmentName", "department"],
    date: ["createdAt", "identifiedDate", "createdDate", "raisedDate"],
};

const AUDIT_FIELDS = {
    status: ["status", "auditStatus"],
    department: ["department.name", "departmentName", "department"],
    plannedDate: ["plannedDate", "startDate", "createdAt", "scheduledDate"],
    completedDate: ["completedDate", "completionDate", "endDate"],
};

const USER_FIELDS = {
    role: ["role.name", "roleName", "role"],
    department: ["department.name", "departmentName", "department"],
    departmentId: ["department.id", "departmentId"],
    active: ["enabled", "active", "isActive"],
};

// Possible shapes for an organization's own department list
const ORG_DEPT_LIST_KEYS = ["departments", "departmentList", "departmentEntities"];

// ============================================================
// USERS
// ============================================================

async function fetchUsers() {
    const res = await getAllUsers();
    return toArray(res?.data ?? res);
}

export async function getUserStatistics() {
    const users = await fetchUsers();
    const active = users.filter((u) => {
        const val = pick(u, USER_FIELDS.active);
        return val === true || val === "true" || val === "ACTIVE";
    });

    return { totalUsers: users.length, activeUsers: active.length };
}

export async function getUsersByRole() {
    const users = await fetchUsers();
    return groupCount(users, (u) => pick(u, USER_FIELDS.role));
}

export async function getUsersByDepartment() {
    const users = await fetchUsers();
    return groupCount(users, (u) => pick(u, USER_FIELDS.department));
}

// ============================================================
// ORGANIZATIONS
// ============================================================

async function fetchOrganizations() {
    const res = await getAllOrganizations();
    return toArray(res?.data ?? res);
}

/**
 * Builds a { departmentId -> organizationName } map by reading each
 * organization's nested department list. Falls back to an empty map
 * (users then show under "Unassigned Organization") if the shape
 * doesn't match — tell me the real shape and I'll adjust this.
 */
function buildDeptToOrgMap(organizations) {
    const map = {};
    organizations.forEach((org) => {
        const orgName = pick(org, ["name", "organizationName"]);
        const deptListKey = ORG_DEPT_LIST_KEYS.find((k) => Array.isArray(org?.[k]));
        const depts = deptListKey ? org[deptListKey] : [];

        depts.forEach((dept) => {
            const deptId = pick(dept, ["id", "departmentId"]);
            if (deptId !== undefined) map[deptId] = orgName;
        });
    });
    return map;
}

export async function getUsersByOrganization() {
    const [users, organizations] = await Promise.all([
        fetchUsers(),
        fetchOrganizations(),
    ]);

    const deptToOrg = buildDeptToOrgMap(organizations);

    return groupCount(users, (u) => {
        const deptId = pick(u, USER_FIELDS.departmentId);
        return deptToOrg[deptId] || "Unassigned Organization";
    });
}

export async function getOrganizationOverview() {
    const [users, organizations] = await Promise.all([
        fetchUsers(),
        fetchOrganizations(),
    ]);

    const deptToOrg = buildDeptToOrgMap(organizations);

    return organizations.map((org) => {
        const orgName = pick(org, ["name", "organizationName"]);
        const deptListKey = ORG_DEPT_LIST_KEYS.find((k) => Array.isArray(org?.[k]));
        const departmentCount = deptListKey ? org[deptListKey].length : 0;

        const orgUsers = users.filter((u) => {
            const deptId = pick(u, USER_FIELDS.departmentId);
            return deptToOrg[deptId] === orgName;
        });

        const activeUsers = orgUsers.filter((u) => {
            const val = pick(u, USER_FIELDS.active);
            return val === true || val === "true" || val === "ACTIVE";
        });

        return {
            organizationName: orgName,
            totalUsers: orgUsers.length,
            departmentCount,
            activeUsers: activeUsers.length,
            riskCount: 0,
            auditCount: 0,
        };
    });
}

// ============================================================
// RISK ANALYTICS
// ============================================================

async function fetchRisks() {
    const res = await RiskService.getAllRisks();
    return toArray(res);
}

export async function getRiskStatistics() {
    const risks = await fetchRisks();
    const count = (predicate) => risks.filter(predicate).length;
    const levelIs = (r, v) => String(pick(r, RISK_FIELDS.level) || "").toUpperCase() === v;
    const statusIs = (r, v) => String(pick(r, RISK_FIELDS.status) || "").toUpperCase() === v;

    return {
        total: risks.length,
        critical: count((r) => levelIs(r, "CRITICAL")),
        high: count((r) => levelIs(r, "HIGH")),
        medium: count((r) => levelIs(r, "MEDIUM")),
        low: count((r) => levelIs(r, "LOW")),
        open: count((r) => statusIs(r, "OPEN")),
        underAssessment: count((r) => statusIs(r, "UNDER_ASSESSMENT")),
        mitigationInProgress: count((r) => statusIs(r, "MITIGATION_IN_PROGRESS")),
        mitigated: count((r) => statusIs(r, "MITIGATED")),
        closed: count((r) => statusIs(r, "CLOSED")),
    };
}

export async function getRiskTrend() {
    const risks = await fetchRisks();
    const map = {};
    risks.forEach((r) => {
        const key = monthKey(pick(r, RISK_FIELDS.date));
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([month, riskCount]) => ({ month, riskCount }));
}

export async function getRiskByDepartment() {
    const risks = await fetchRisks();
    return groupCount(risks, (r) => pick(r, RISK_FIELDS.department));
}

// ============================================================
// AUDIT ANALYTICS
// ============================================================

async function fetchAudits() {
    const res = await AuditService.getAllAudits();
    return toArray(res);
}

export async function getAuditStatistics() {
    const audits = await fetchAudits();
    const count = (predicate) => audits.filter(predicate).length;
    const statusIs = (a, v) => String(pick(a, AUDIT_FIELDS.status) || "").toUpperCase() === v;

    return {
        total: audits.length,
        planned: count((a) => statusIs(a, "PLANNED")),
        inProgress: count((a) => statusIs(a, "IN_PROGRESS")),
        underReview: count((a) => statusIs(a, "UNDER_REVIEW")),
        completed: count((a) => statusIs(a, "COMPLETED")),
        overdue: count((a) => statusIs(a, "OVERDUE")),
    };
}

export async function getAuditTrend() {
    const audits = await fetchAudits();
    const plannedMap = {};
    const completedMap = {};

    audits.forEach((a) => {
        const plannedKey = monthKey(pick(a, AUDIT_FIELDS.plannedDate));
        if (plannedKey) plannedMap[plannedKey] = (plannedMap[plannedKey] || 0) + 1;

        const status = String(pick(a, AUDIT_FIELDS.status) || "").toUpperCase();
        if (status === "COMPLETED") {
            const completedKey = monthKey(
                pick(a, AUDIT_FIELDS.completedDate) || pick(a, AUDIT_FIELDS.plannedDate)
            );
            if (completedKey) completedMap[completedKey] = (completedMap[completedKey] || 0) + 1;
        }
    });

    const months = Array.from(new Set([...Object.keys(plannedMap), ...Object.keys(completedMap)]));

    return months.map((month) => ({
        month,
        plannedCount: plannedMap[month] || 0,
        completedCount: completedMap[month] || 0,
    }));
}

export async function getAuditsByDepartment() {
    const audits = await fetchAudits();
    return groupCount(audits, (a) => pick(a, AUDIT_FIELDS.department));
}

// ============================================================
// RECENT ACTIVITY
// ============================================================

export async function getRecentActivities() {
    const [risks, audits] = await Promise.all([fetchRisks(), fetchAudits()]);
    const events = [];

    risks.forEach((r) => {
        const date = pick(r, RISK_FIELDS.date);
        if (!date) return;
        events.push({
            id: `risk-${r.id || r.riskId}`,
            type: "RISK_CREATED",
            description: `Risk "${r.title || r.riskId || "Untitled"}" created`,
            userName: pick(r, ["identifiedBy.name", "identifiedByName"]),
            timestamp: date,
            status: pick(r, RISK_FIELDS.status),
        });
    });

    audits.forEach((a) => {
        const date = pick(a, AUDIT_FIELDS.completedDate) || pick(a, AUDIT_FIELDS.plannedDate);
        if (!date) return;
        const status = String(pick(a, AUDIT_FIELDS.status) || "").toUpperCase();
        events.push({
            id: `audit-${a.id || a.auditId}`,
            type: status === "COMPLETED" ? "AUDIT_COMPLETED" : "AUDIT_ASSIGNED",
            description: `Audit "${a.title || a.auditId || "Untitled"}" ${
                status === "COMPLETED" ? "completed" : "updated"
            }`,
            userName: pick(a, ["internalAuditor.name", "internalAuditorName"]),
            timestamp: date,
            status,
        });
    });

    return events
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 15);
}

// ============================================================
// SYSTEM HEALTH
// ============================================================

export async function getSystemHealth() {
    const checks = [
        { key: "API", label: "API Status", fn: () => RiskService.getAllRisks() },
        { key: "AUTH", label: "Authentication", fn: () => getAllUsers() },
        { key: "RISK", label: "Risk Service", fn: () => RiskService.getAllRisks() },
        { key: "AUDIT", label: "Audit Service", fn: () => AuditService.getAllAudits() },
    ];

    const results = await Promise.all(
        checks.map(async (c) => {
            try {
                await c.fn();
                return { key: c.key, name: c.label, status: "OPERATIONAL", operational: true };
            } catch {
                return { key: c.key, name: c.label, status: "DOWN", operational: false };
            }
        })
    );

    return results;
}

// ============================================================
// TOP-LEVEL KPI SUMMARY
// ============================================================

export async function getDashboardSummary() {
    const [users, roles, risks, audits, organizations] = await Promise.all([
        fetchUsers(),
        getAllRoles().then((r) => toArray(r)),
        fetchRisks(),
        fetchAudits(),
        fetchOrganizations(),
    ]);

    const activeUsers = users.filter((u) => {
        const val = pick(u, USER_FIELDS.active);
        return val === true || val === "true" || val === "ACTIVE";
    });

    const departmentSet = new Set(
        users.map((u) => pick(u, USER_FIELDS.department)).filter(Boolean)
    );

    const criticalRisks = risks.filter(
        (r) => String(pick(r, RISK_FIELDS.level) || "").toUpperCase() === "CRITICAL"
    ).length;

    const pendingAudits = audits.filter((a) => {
        const status = String(pick(a, AUDIT_FIELDS.status) || "").toUpperCase();
        return status === "PLANNED" || status === "IN_PROGRESS";
    }).length;

    return {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        totalRoles: roles.length,
        totalDepartments: departmentSet.size,
        totalOrganizations: organizations.length,
        totalRisks: risks.length,
        criticalRisks,
        totalAudits: audits.length,
        pendingAudits,
    };
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

const DashboardService = {
    getDashboardSummary,
    getUserStatistics,
    getUsersByRole,
    getUsersByDepartment,
    getUsersByOrganization,
    getRiskStatistics,
    getRiskTrend,
    getRiskByDepartment,
    getAuditStatistics,
    getAuditTrend,
    getAuditsByDepartment,
    getOrganizationOverview,
    getRecentActivities,
    getSystemHealth,
};

export default DashboardService;