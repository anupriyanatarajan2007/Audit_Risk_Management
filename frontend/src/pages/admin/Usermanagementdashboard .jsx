import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  Users,
  UserCheck,
  UserX,
  Building2,
  ShieldCheck,
  UserPlus,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  Activity,
} from "lucide-react";
import { getAllUsers } from "../../service/AuthService";
import { getAllRoles } from "../../service/roleService";
import { getAllDepartments } from "../../service/departmentService";
import CreateUser from "../../components/CreateUser";
import ViewUser from "../../components/ViewUser";
import EditUser from "../../components/EditUser";



// ============================================================
// COLORS
// ============================================================

const ROLE_COLORS = {
  INTERNAL_AUDITOR: "#059669",
  AUDIT_MANAGER: "#0d9488",
  CHIEF_AUDIT_EXECUTIVE: "#0891b2",
  RISK_OFFICER: "#4f46e5",
  AUDITEE: "#0284c7",
  COMPLIANCE_OFFICER: "#d97706",
  SYSTEM_ADMINISTRATOR: "#475569",
};

const FALLBACK_PALETTE = [
  "#059669",
  "#0d9488",
  "#0891b2",
  "#4f46e5",
  "#0284c7",
  "#d97706",
  "#475569",
  "#9333ea",
  "#be185d",
  "#2563eb",
];

const STATUS_COLORS = {
  Active: "#059669",
  Inactive: "#dc2626",
};

// ============================================================
// HELPERS
// ============================================================

const getRoleKey = (role) => {
  if (!role) return "";

  if (typeof role === "object") {
    return role.name || role.roleName || role.code || "";
  }

  return String(role);
};

const getRoleColor = (role) => {
  const key = getRoleKey(role);

  if (ROLE_COLORS[key]) {
    return ROLE_COLORS[key];
  }

  let hash = 0;

  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }

  return FALLBACK_PALETTE[
    Math.abs(hash) % FALLBACK_PALETTE.length
  ];
};

const formatRole = (role) => {
  const roleName = getRoleKey(role);

  if (!roleName) {
    return "N/A";
  }

  return roleName
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const formatDepartment = (dept) => {
  if (!dept) {
    return "Unassigned";
  }

  let name = "";

  if (typeof dept === "object") {
    name = dept.name || dept.departmentName || "";
  } else {
    name = String(dept);
  }

  if (!name) {
    return "Unassigned";
  }

  return name
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const getDeptKey = (user) => {
  const dept =
    user?.department ||
    user?.profile?.department ||
    user?.departmentName;

  if (!dept) {
    return "Unassigned";
  }

  if (typeof dept === "object") {
    return (
      dept.name ||
      dept.departmentName ||
      "Unassigned"
    );
  }

  return String(dept);
};

const getFullName = (user) => {
  const first =
    user?.profile?.firstName ||
    user?.firstName ||
    "";

  const last =
    user?.profile?.lastName ||
    user?.lastName ||
    "";

  const fullName = `${first} ${last}`.trim();

  return fullName || "Unnamed User";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// NORMALIZE API RESPONSES
// ============================================================

const normalizeUsers = (response) => {
  let payload = response?.data ?? response;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return [];
    }
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.users)) {
    return payload.users;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

const normalizeList = (response) => {
  let payload = response?.data ?? response;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return [];
    }
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.roles)) {
    return payload.roles;
  }

  if (Array.isArray(payload?.departments)) {
    return payload.departments;
  }

  return [];
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay,
      }}
      whileHover={{
        y: -6,
        scale: 1.01,
      }}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md p-5 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: `${accent}18`,
          }}
        >
          <Icon
            className="h-6 w-6"
            style={{
              color: accent,
            }}
          />
        </div>

        <Activity
          className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition"
        />
      </div>

      <div className="mt-4">
        <motion.p
          key={value}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="text-3xl font-bold text-slate-800 tabular-nums"
        >
          {value}
        </motion.p>

        <p className="text-sm text-slate-500 mt-1">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

// ============================================================
// CHART CARD
// ============================================================

const ChartCard = ({
  title,
  subtitle,
  children,
  isEmpty = false,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          {title}
        </h3>

        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-slate-400">
          <Activity className="h-8 w-8 mb-2" />
          <p className="text-sm">
            No data available
          </p>
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
};

// ============================================================
// SKELETON
// ============================================================

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse">
    <div className="h-12 w-12 rounded-xl bg-slate-100" />

    <div className="mt-4 space-y-2">
      <div className="h-7 w-16 bg-slate-100 rounded" />
      <div className="h-3 w-28 bg-slate-100 rounded" />
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse">
    <div className="h-5 w-40 bg-slate-100 rounded mb-4" />
    <div className="h-[280px] bg-slate-100 rounded-xl" />
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({
      length: 8,
    }).map((_, index) => (
      <td
        key={index}
        className="px-4 py-4"
      >
        <div className="h-4 bg-slate-100 rounded w-24" />
      </td>
    ))}
  </tr>
);

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ enabled }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      enabled
        ? "bg-emerald-50 text-emerald-700"
        : "bg-red-50 text-red-700"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        enabled
          ? "bg-emerald-500"
          : "bg-red-500"
      }`}
    />

    {enabled ? "Active" : "Inactive"}
  </span>
);

// ============================================================
// ROLE BADGE
// ============================================================

const RoleBadge = ({ role }) => {
  const color = getRoleColor(role);

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}18`,
        color,
      }}
    >
      {formatRole(role)}
    </span>
  );
};

// ============================================================
// DELETE DIALOG
// ============================================================

const ConfirmDeleteDialog = ({
  user,
  onCancel,
  onConfirm,
  busy,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.9,
          y: 20,
        }}
        onClick={(e) =>
          e.stopPropagation()
        }
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm"
      >
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800">
          Delete User?
        </h3>

        <p className="text-sm text-slate-500 mt-2 mb-6">
          Are you sure you want to permanently
          remove{" "}
          <span className="font-semibold text-slate-700">
            {getFullName(user)}
          </span>
          ?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50"
          >
            {busy && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}

            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState(null);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("ALL");

  const [deptFilter, setDeptFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showCreate, setShowCreate] =
    useState(false);

  const [viewingUser, setViewingUser] =
    useState(null);

  const [editingUser, setEditingUser] =
    useState(null);

  const [deletingUser, setDeletingUser] =
    useState(null);

  const [deleteBusy, setDeleteBusy] =
    useState(false);

  // ==========================================================
  // FETCH ALL DASHBOARD DATA
  // ==========================================================

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [
          usersResponse,
          rolesResponse,
          departmentsResponse,
        ] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          getAllDepartments(),
        ]);

        const userList =
          normalizeUsers(usersResponse);

        const roleList =
          normalizeList(rolesResponse);

        const departmentList =
          normalizeList(
            departmentsResponse
          );

        setUsers(userList);
        setRoles(roleList);
        setDepartments(
          departmentList
        );
      } catch (err) {
        console.error(
          "Dashboard fetch error:",
          err
        );

        const status =
          err?.response?.status;

        if (status === 401) {
          setError(
            "Unauthorized - Please login again"
          );
        } else if (status === 403) {
          setError(
            "Access Denied - You don't have permission to view dashboard data"
          );
        } else if (status >= 500) {
          setError(
            "Server error - Unable to load dashboard data"
          );
        } else {
          setError(
            "Something went wrong while loading dashboard data"
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {
    const total = users.length;

    const active = users.filter(
      (user) => user.enabled === true
    ).length;

    const inactive =
      total - active;

    const roleSet = new Set(
      users
        .map((user) =>
          getRoleKey(user.role)
        )
        .filter(Boolean)
    );

    const departmentSet = new Set(
      users.map((user) =>
        getDeptKey(user)
      )
    );

    const now = Date.now();

    const thirtyDays =
      30 *
      24 *
      60 *
      60 *
      1000;

    const newUsers = users.filter(
      (user) => {
        if (!user.createdAt) {
          return false;
        }

        const created =
          new Date(
            user.createdAt
          ).getTime();

        return (
          !isNaN(created) &&
          now - created <=
            thirtyDays
        );
      }
    ).length;

    return {
      total,
      active,
      inactive,
      roles:
        roles.length ||
        roleSet.size,
      departments:
        departments.length ||
        departmentSet.size,
      newUsers,
    };
  }, [
    users,
    roles,
    departments,
  ]);

  // ==========================================================
  // STATUS CHART
  // ==========================================================

  const statusChartData = useMemo(
    () => [
      {
        name: "Active",
        value: stats.active,
      },
      {
        name: "Inactive",
        value: stats.inactive,
      },
    ],
    [stats]
  );

  // ==========================================================
  // ROLE CHART
  // ==========================================================

  const roleChartData = useMemo(() => {
    const counts = {};

    users.forEach((user) => {
      const role =
        getRoleKey(user.role);

      if (role) {
        counts[role] =
          (counts[role] || 0) + 1;
      }
    });

    // Use backend roles first
    if (roles.length > 0) {
      return roles
        .map((role) => {
          const key =
            getRoleKey(role);

          return {
            key,
            role: formatRole(key),
            count:
              counts[key] || 0,
          };
        })
        .filter((item) => item.key);
    }

    // Fallback to roles found in users
    return Object.entries(counts).map(
      ([key, count]) => ({
        key,
        role: formatRole(key),
        count,
      })
    );
  }, [users, roles]);

  // ==========================================================
  // DEPARTMENT CHART
  // ==========================================================

  const departmentChartData =
    useMemo(() => {
      const counts = {};

      users.forEach((user) => {
        const department =
          getDeptKey(user);

        counts[department] =
          (counts[department] || 0) +
          1;
      });

      return Object.entries(
        counts
      )
        .map(
          ([name, count]) => ({
            name: formatDepartment(
              name
            ),
            count,
          })
        )
        .sort(
          (a, b) =>
            b.count - a.count
        );
    }, [users]);

  // ==========================================================
  // ROLE FILTER OPTIONS
  // ==========================================================

  const roleOptions = useMemo(() => {
    if (roles.length > 0) {
      return roles
        .map((role) =>
          getRoleKey(role)
        )
        .filter(Boolean);
    }

    return Array.from(
      new Set(
        users
          .map((user) =>
            getRoleKey(user.role)
          )
          .filter(Boolean)
      )
    );
  }, [roles, users]);

  // ==========================================================
  // DEPARTMENT FILTER OPTIONS
  // ==========================================================

  const departmentOptions =
    useMemo(() => {
      const backendDepartments =
        departments
          .map((department) => {
            if (
              typeof department ===
              "object"
            ) {
              return (
                department.name ||
                department.departmentName
              );
            }

            return String(
              department
            );
          })
          .filter(Boolean);

      const userDepartments =
        users.map((user) =>
          getDeptKey(user)
        );

      return Array.from(
        new Set([
          ...backendDepartments,
          ...userDepartments,
        ])
      ).sort();
    }, [departments, users]);

  // ==========================================================
  // FILTER USERS
  // ==========================================================

  const filteredUsers =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const role =
            getRoleKey(user.role);

          const department =
            getDeptKey(user);

          const matchesSearch =
            !term ||
            user.employeeId
              ?.toLowerCase()
              .includes(term) ||
            getFullName(user)
              .toLowerCase()
              .includes(term) ||
            user.email
              ?.toLowerCase()
              .includes(term) ||
            formatDepartment(
              department
            )
              .toLowerCase()
              .includes(term) ||
            formatRole(role)
              .toLowerCase()
              .includes(term);

          const matchesRole =
            roleFilter === "ALL" ||
            role === roleFilter;

          const matchesDepartment =
            deptFilter === "ALL" ||
            department ===
              deptFilter;

          const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter ===
              "ACTIVE" &&
              user.enabled === true) ||
            (statusFilter ===
              "INACTIVE" &&
              user.enabled !== true);

          return (
            matchesSearch &&
            matchesRole &&
            matchesDepartment &&
            matchesStatus
          );
        }
      );
    }, [
      users,
      search,
      roleFilter,
      deptFilter,
      statusFilter,
    ]);

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setDeptFilter("ALL");
    setStatusFilter("ALL");
  };

  // ==========================================================
  // CREATE SUCCESS
  // ==========================================================

  const handleCreateSuccess =
    async () => {
      setShowCreate(false);
      await fetchDashboardData(
        true
      );
    };

  // ==========================================================
  // EDIT SUCCESS
  // ==========================================================

  const handleEditSuccess =
    async () => {
      setEditingUser(null);
      await fetchDashboardData(
        true
      );
    };

  // ==========================================================
  // DELETE
  // ==========================================================

  const confirmDelete =
    async () => {
      if (!deletingUser) {
        return;
      }

      try {
        setDeleteBusy(true);

        await deleteUser(
          deletingUser.id
        );

        setDeletingUser(null);

        await fetchDashboardData(
          true
        );
      } catch (err) {
        console.error(
          "Delete user error:",
          err
        );

        setError(
          "Unable to delete user. Please try again."
        );

        setDeletingUser(null);
      } finally {
        setDeleteBusy(false);
      }
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                User Management
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Monitor and manage all users,
                roles and departments
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">

          {/* REFRESH */}

          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              fetchDashboardData(true)
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </motion.button>

          {/* ADD USER */}

          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              setShowCreate(true)
            }
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add User
          </motion.button>
        </div>
      </motion.div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && !loading && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-6 flex items-center justify-between gap-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>

          <button
            onClick={() =>
              fetchDashboardData(
                true
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium bg-white border border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </motion.div>
      )}

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {loading ? (
          Array.from({
            length: 6,
          }).map((_, index) => (
            <SkeletonCard
              key={index}
            />
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.total}
              accent="#059669"
              delay={0}
            />

            <StatCard
              icon={UserCheck}
              label="Active Users"
              value={stats.active}
              accent="#0d9488"
              delay={0.05}
            />

            <StatCard
              icon={UserX}
              label="Inactive Users"
              value={stats.inactive}
              accent="#dc2626"
              delay={0.1}
            />

            <StatCard
              icon={Building2}
              label="Departments"
              value={
                stats.departments
              }
              accent="#0891b2"
              delay={0.15}
            />

            <StatCard
              icon={ShieldCheck}
              label="Roles"
              value={stats.roles}
              accent="#4f46e5"
              delay={0.2}
            />

            <StatCard
              icon={UserPlus}
              label="New Users (30 Days)"
              value={stats.newUsers}
              accent="#d97706"
              delay={0.25}
            />
          </>
        )}
      </div>

      {/* ======================================================
          CHARTS
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">

        {loading ? (
          Array.from({
            length: 4,
          }).map((_, index) => (
            <SkeletonChart
              key={index}
            />
          ))
        ) : (
          <>
            {/* STATUS */}

            <ChartCard
              title="User Status Distribution"
              subtitle="Active versus inactive users"
              isEmpty={
                stats.total === 0
              }
            >
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <PieChart>
                  <Pie
                    data={
                      statusChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    isAnimationActive
                    animationDuration={
                      900
                    }
                  >
                    {statusChartData.map(
                      (entry) => (
                        <Cell
                          key={
                            entry.name
                          }
                          fill={
                            STATUS_COLORS[
                              entry.name
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* USERS BY ROLE */}

            <ChartCard
              title="Users by Role"
              subtitle="Number of users assigned to each role"
              isEmpty={
                roleChartData.length ===
                0
              }
            >
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <BarChart
                  data={
                    roleChartData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 45,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="role"
                    tick={{
                      fontSize: 10,
                      fill: "#64748b",
                    }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#059669"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    isAnimationActive
                    animationDuration={
                      900
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* DEPARTMENT */}

            <ChartCard
              title="Users by Department"
              subtitle="User distribution across departments"
              isEmpty={
                departmentChartData.length ===
                0
              }
            >
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <BarChart
                  data={
                    departmentChartData
                  }
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={
                      false
                    }
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{
                      fontSize: 10,
                      fill: "#64748b",
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#0d9488"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                    isAnimationActive
                    animationDuration={
                      900
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* ROLE PIE */}

            <ChartCard
              title="Role Distribution"
              subtitle="Overall percentage of users by role"
              isEmpty={
                roleChartData.filter(
                  (item) =>
                    item.count > 0
                ).length === 0
              }
            >
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <PieChart>
                  <Pie
                    data={
                      roleChartData.filter(
                        (item) =>
                          item.count > 0
                      )
                    }
                    dataKey="count"
                    nameKey="role"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    isAnimationActive
                    animationDuration={
                      1000
                    }
                  >
                    {roleChartData
                      .filter(
                        (item) =>
                          item.count >
                          0
                      )
                      .map(
                        (entry) => (
                          <Cell
                            key={
                              entry.key
                            }
                            fill={getRoleColor(
                              entry.key
                            )}
                          />
                        )
                      )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5"
      >
        <div className="flex flex-col xl:flex-row gap-3">

          {/* SEARCH */}

          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search employee, name, email, department or role..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
          </div>

          {/* FILTERS */}

          <div className="grid grid-cols-1 sm:grid-cols-3 xl:flex gap-3">

            {/* ROLE */}

            <div className="relative min-w-[170px]">
              <select
                value={
                  roleFilter
                }
                onChange={(e) =>
                  setRoleFilter(
                    e.target.value
                  )
                }
                className="appearance-none w-full pl-3 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                <option value="ALL">
                  All Roles
                </option>

                {roleOptions.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {formatRole(
                        role
                      )}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* DEPARTMENT */}

            <div className="relative min-w-[190px]">
              <select
                value={
                  deptFilter
                }
                onChange={(e) =>
                  setDeptFilter(
                    e.target.value
                  )
                }
                className="appearance-none w-full pl-3 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                <option value="ALL">
                  All Departments
                </option>

                {departmentOptions.map(
                  (department) => (
                    <option
                      key={department}
                      value={
                        department
                      }
                    >
                      {formatDepartment(
                        department
                      )}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* STATUS */}

            <div className="relative min-w-[150px]">
              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="appearance-none w-full pl-3 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* RESET */}

            <button
              onClick={
                resetFilters
              }
              className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* FILTER RESULT */}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {users.length}
            </span>{" "}
            users
          </p>
        </div>
      </motion.div>

      {/* ======================================================
          USER TABLE
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "Employee ID",
                  "Name",
                  "Email",
                  "Department",
                  "Role",
                  "Status",
                  "Created Date",
                  "Actions",
                ].map(
                  (column) => (
                    <th
                      key={column}
                      className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {column}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>

              {loading ? (
                Array.from({
                  length: 7,
                }).map((_, index) => (
                  <SkeletonRow
                    key={index}
                  />
                ))
              ) : filteredUsers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-20"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="h-7 w-7 text-slate-400" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-600">
                        No users found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your
                        search or filters
                      </p>

                      <button
                        onClick={
                          resetFilters
                        }
                        className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map(
                    (
                      user,
                      index
                    ) => (
                      <motion.tr
                        key={
                          user.id ??
                          user.employeeId ??
                          index
                        }
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: -20,
                        }}
                        transition={{
                          duration:
                            0.25,
                          delay:
                            index *
                            0.025,
                        }}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                      >

                        {/* EMPLOYEE ID */}

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-700">
                            {user.employeeId ||
                              "—"}
                          </span>
                        </td>

                        {/* NAME */}

                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">

                            <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                              {getFullName(
                                user
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <span className="font-medium text-slate-800">
                              {getFullName(
                                user
                              )}
                            </span>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                          {user.email ||
                            "—"}
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                          {formatDepartment(
                            user.department
                          )}
                        </td>

                        {/* ROLE */}

                        <td className="px-4 py-4 whitespace-nowrap">
                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge
                            enabled={
                              user.enabled
                            }
                          />
                        </td>

                        {/* DATE */}

                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4 whitespace-nowrap">

                          <div className="flex items-center gap-1">

                            {/* VIEW */}

                            <motion.button
                              whileHover={{
                                scale: 1.1,
                              }}
                              whileTap={{
                                scale: 0.9,
                              }}
                              onClick={() =>
                                setViewingUser(
                                  user
                                )
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title="View User"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>

                            {/* EDIT */}

                            <motion.button
                              whileHover={{
                                scale: 1.1,
                              }}
                              whileTap={{
                                scale: 0.9,
                              }}
                              onClick={() =>
                                setEditingUser(
                                  user
                                )
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                              title="Edit User"
                            >
                              <Pencil className="h-4 w-4" />
                            </motion.button>

                            {/* DELETE */}

                            <motion.button
                              whileHover={{
                                scale: 1.1,
                              }}
                              whileTap={{
                                scale: 0.9,
                              }}
                              onClick={() =>
                                setDeletingUser(
                                  user
                                )
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ======================================================
          CREATE USER
      ====================================================== */}

      <AnimatePresence>
        {showCreate && (
          <CreateUser
            onClose={() =>
              setShowCreate(false)
            }
            onSuccess={
              handleCreateSuccess
            }
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          VIEW USER
      ====================================================== */}

      <AnimatePresence>
        {viewingUser && (
          <ViewUser
            user={viewingUser}
            onClose={() =>
              setViewingUser(null)
            }
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          EDIT USER
      ====================================================== */}

      <AnimatePresence>
        {editingUser && (
          <EditUser
            user={editingUser}
            onClose={() =>
              setEditingUser(null)
            }
            onSuccess={
              handleEditSuccess
            }
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          DELETE
      ====================================================== */}

      <AnimatePresence>
        {deletingUser && (
          <ConfirmDeleteDialog
            user={deletingUser}
            busy={deleteBusy}
            onCancel={() =>
              !deleteBusy &&
              setDeletingUser(null)
            }
            onConfirm={
              confirmDelete
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagementDashboard;