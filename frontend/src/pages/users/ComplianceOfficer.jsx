import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Building2,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import CreateUser from "../../components/CreateUser";
import ViewUser from "../../components/ViewUser.jsx";
import EditUser from "../../components/EditUser.jsx";
import { getUsersByRole } from "../../service/authService.jsx";

const COLORS = ["#10b981", "#ef4444"];

/* =========================================================
   FORMAT DEPARTMENT

   Supports:

   department: {
      id: 1,
      name: "Information Technology",
      active: true
   }

   OR

   department: "INFORMATION_TECHNOLOGY"
========================================================= */

const formatDepartment = (dept) => {
  if (!dept) return "Unassigned";

  if (typeof dept === "object") {
    return dept.name || "Unassigned";
  }

  if (typeof dept === "string") {
    return dept
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  return "Unassigned";
};

/* =========================================================
   FORMAT ROLE
========================================================= */

const formatRole = (role) => {
  if (!role) return "N/A";

  let roleName = role;

  if (typeof role === "object") {
    roleName = role.name;
  }

  if (!roleName) return "N/A";

  return String(roleName)
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ComplianceOfficer() {
  const [search, setSearch] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);

  /* View */
  const [selectedUser, setSelectedUser] = useState(null);
  const [openView, setOpenView] = useState(false);

  /* Edit */
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditMode, setOpenEditMode] = useState(null);

  /* Active row */
  const [activeRowId, setActiveRowId] = useState(null);

  /* Users */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD USERS
  ========================================================= */

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getUsersByRole(
        "COMPLIANCE_OFFICER"
      );

      console.log(
        "FULL API RESPONSE:",
        response
      );

      console.log(
        "API DATA:",
        response?.data
      );

      let usersData = response?.data;

      /*
       * Backend may return:
       *
       * {
       *   data: [...]
       * }
       *
       * OR
       *
       * [...]
       */

      if (usersData?.data) {
        usersData = usersData.data;
      }

      /* Backend may return JSON string */
      if (typeof usersData === "string") {
        usersData = JSON.parse(usersData);
      }

      console.log(
        "FINAL USERS DATA:",
        usersData
      );

      if (!Array.isArray(usersData)) {
        console.error(
          "Expected array but received:",
          usersData
        );

        setUsers([]);
        setError(
          "Invalid users response from server"
        );

        return;
      }

      setUsers(usersData);
    } catch (error) {
      console.error(
        "LOAD COMPLIANCE OFFICERS ERROR:",
        error
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      setUsers([]);

      if (error?.response?.status === 403) {
        setError(
          "Access Denied - You don't have permission to view Compliance Officers"
        );
      } else if (
        error?.response?.status === 401
      ) {
        setError(
          "Unauthorized - Please login again"
        );
      } else {
        setError(
          "Unable to load Compliance Officers"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FILTER USERS
  ========================================================= */

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    const q = search.toLowerCase();

    return users.filter((u) => {
      const fullName = `
        ${u.profile?.firstName || ""}
        ${u.profile?.lastName || ""}
      `.toLowerCase();

      const email = String(
        u.email || ""
      ).toLowerCase();

      const employeeId = String(
        u.employeeId || ""
      ).toLowerCase();

      const department = formatDepartment(
        u.department
      ).toLowerCase();

      const role = formatRole(
        u.role
      ).toLowerCase();

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        employeeId.includes(q) ||
        department.includes(q) ||
        role.includes(q)
      );
    });
  }, [users, search]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalCount = users.length;

  const activeCount = users.filter(
    (u) => u.enabled === true
  ).length;

  const inactiveCount =
    totalCount - activeCount;

  /* =========================================================
     DEPARTMENT COUNT
  ========================================================= */

  const deptCount = useMemo(() => {
    const departments = users
      .map((u) => {
        if (!u.department) return null;

        if (
          typeof u.department === "object"
        ) {
          return u.department.id;
        }

        return u.department;
      })
      .filter(Boolean);

    return new Set(departments).size;
  }, [users]);

  /* =========================================================
     STATUS PIE DATA
  ========================================================= */

  const statusPieData = [
    {
      name: "Active",
      value: activeCount,
    },
    {
      name: "Inactive",
      value: inactiveCount,
    },
  ];

  /* =========================================================
     DEPARTMENT BAR DATA
  ========================================================= */

  const deptBarData = useMemo(() => {
    const map = {};

    users.forEach((u) => {
      const dept = formatDepartment(
        u.department
      );

      map[dept] =
        (map[dept] || 0) + 1;
    });

    return Object.entries(map).map(
      ([department, count]) => ({
        department,
        count,
      })
    );
  }, [users]);

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Compliance Officer
          </h1>

          <p className="text-slate-500 mt-1">
            Manage Compliance Officer Users
          </p>
        </div>

        <button
          onClick={() =>
            setOpenDrawer(true)
          }
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-md shadow-emerald-100 transition"
        >
          <Plus size={18} />
          Add Compliance Officer
        </button>

      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <StatCard
          icon={
            <Users
              size={22}
              className="text-blue-600"
            />
          }
          iconBg="bg-blue-50"
          label="Total Compliance Officers"
          value={totalCount}
        />

        <StatCard
          icon={
            <UserCheck
              size={22}
              className="text-emerald-600"
            />
          }
          iconBg="bg-emerald-50"
          label="Active"
          value={activeCount}
        />

        <StatCard
          icon={
            <UserX
              size={22}
              className="text-red-600"
            />
          }
          iconBg="bg-red-50"
          label="Inactive"
          value={inactiveCount}
        />

        <StatCard
          icon={
            <Building2
              size={22}
              className="text-amber-600"
            />
          }
          iconBg="bg-amber-50"
          label="Departments"
          value={deptCount}
        />

      </div>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* STATUS CHART */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-1"
        >

          <h3 className="text-slate-800 font-semibold mb-4">
            Status Breakdown
          </h3>

          {totalCount === 0 ? (

            <p className="text-sm text-slate-400 text-center py-10">
              No data yet
            </p>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <PieChart>

                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >

                  {statusPieData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  height={30}
                />

              </PieChart>

            </ResponsiveContainer>
          )}

        </motion.div>

        {/* DEPARTMENT CHART */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 0.05,
          }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2"
        >

          <h3 className="text-slate-800 font-semibold mb-4">
            Compliance Officers by Department
          </h3>

          {totalCount === 0 ? (

            <p className="text-sm text-slate-400 text-center py-10">
              No data yet
            </p>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <BarChart data={deptBarData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="department"
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#10b981"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>
          )}

        </motion.div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative mb-6 w-96">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search Compliance Officer..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
        />

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          delay: 0.1,
        }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200"
      >

        <div className="overflow-auto max-h-[520px] rounded-2xl">

          <table className="w-full min-w-[1000px] border-collapse">

            {/* TABLE HEADER */}

            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">

              <tr>

                <th className="text-left px-6 py-4 text-slate-600 font-semibold text-sm whitespace-nowrap">
                  Employee ID
                </th>

                <th className="text-left px-6 py-4 text-slate-600 font-semibold text-sm whitespace-nowrap">
                  Name
                </th>

                <th className="text-left px-6 py-4 text-slate-600 font-semibold text-sm whitespace-nowrap">
                  Email
                </th>

                <th className="text-left px-6 py-4 text-slate-600 font-semibold text-sm whitespace-nowrap">
                  Department
                </th>

                <th className="text-left px-6 py-4 text-slate-600 font-semibold text-sm whitespace-nowrap">
                  Role
                </th>

                <th className="text-left px-6 py-4 text-slate-600 font-semibold text-sm whitespace-nowrap">
                  Status
                </th>

                <th className="text-center px-6 py-4 text-slate-600 font-semibold text-sm whitespace-nowrap">
                  Actions
                </th>

              </tr>

            </thead>

            {/* TABLE BODY */}

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-10 text-slate-400"
                  >
                    Loading...
                  </td>

                </tr>

              ) : error ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-10 text-red-500"
                  >
                    {error}
                  </td>

                </tr>

              ) : filteredUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-10 text-slate-400"
                  >
                    No Compliance Officer Found
                  </td>

                </tr>

              ) : (

                filteredUsers.map((user) => {

                  const isActive =
                    activeRowId === user.id;

                  return (

                    <tr
                      key={user.id}
                      onClick={() =>
                        setActiveRowId(user.id)
                      }
                      className={`border-t border-slate-100 border-l-4 cursor-pointer transition-colors ${
                        isActive
                          ? "border-l-emerald-500 bg-emerald-50/60"
                          : "border-l-transparent hover:bg-slate-50"
                      }`}
                    >

                      {/* EMPLOYEE ID */}

                      <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                        {user.employeeId || "-"}
                      </td>

                      {/* NAME */}

                      <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">

                        {user.profile?.firstName ||
                          "-"}

                        {" "}

                        {user.profile?.lastName ||
                          ""}

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {user.email || "-"}
                      </td>

                      {/* DEPARTMENT */}

                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatDepartment(
                          user.department
                        )}
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatRole(
                          user.role
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4 whitespace-nowrap">

                        {user.enabled ? (

                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">

                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                            Active

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">

                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />

                            Inactive

                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4 whitespace-nowrap">

                        <div className="flex items-center justify-center gap-1">

                          {/* VIEW */}

                          <button
                            onClick={(e) => {

                              e.stopPropagation();

                              setSelectedUser(
                                user
                              );

                              setOpenView(true);

                            }}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                            title="View User"
                          >

                            <Eye size={18} />

                          </button>

                          {/* EDIT */}

                          <button
                            onClick={(e) => {

                              e.stopPropagation();

                              setOpenEditMode(
                                user
                              );

                              setSelectedUser(
                                user
                              );

                              setOpenEdit(true);

                            }}
                            className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition"
                            title="Edit User"
                          >

                            <Pencil size={18} />

                          </button>

                          {/* DELETE */}

                          <button
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete User"
                          >

                            <Trash2 size={18} />

                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </motion.div>

      {/* =====================================================
          VIEW USER
      ===================================================== */}

      <ViewUser
        open={openView}
        user={selectedUser}
        onClose={() => {
          setOpenView(false);
          setSelectedUser(null);
        }}
      />

      {/* =====================================================
          EDIT USER
      ===================================================== */}

      <EditUser
        open={openEdit}
        user={selectedUser}
        onClose={() => {
          setOpenEdit(false);
          setSelectedUser(null);
          setOpenEditMode(null);
        }}
        loadUsers={loadUsers}
      />

      {/* =====================================================
          CREATE USER DRAWER
      ===================================================== */}

      {openDrawer && (

        <CreateUser
          title="Compliance Officer"
          password="1234"
          role="COMPLIANCE_OFFICER"

          onClose={() =>
            setOpenDrawer(false)
          }

          onSuccess={() => {
            loadUsers();
            setOpenDrawer(false);
          }}
        />

      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  iconBg,
  label,
  value,
}) {
  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4"
    >

      <div
        className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>

      <div>

        <p className="text-slate-500 text-sm">
          {label}
        </p>

        <p className="text-2xl font-bold text-slate-800">
          {value}
        </p>

      </div>

    </motion.div>
  );
}