import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Building2,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

import CreateUser from "../../components/CreateUser";
import ViewUser from "../../components/ViewUser.jsx";
import EditUser from "../../components/EditUser.jsx";
import { getUsersByRole } from "../../service/authService.jsx";

const STATUS_COLORS = ["#10b981", "#ef4444"];

const DEPT_COLORS = [
  "#10b981",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#14b8a6",
];

/* =========================================================
   FORMAT DEPARTMENT
========================================================= */

const formatDepartment = (dept) => {
  if (!dept) return "Unassigned";

  // Backend returns:
  // {
  //   id: 1,
  //   name: "Information Technology",
  //   active: true
  // }

  if (typeof dept === "object") {
    return dept.name || "Unassigned";
  }

  // Backend returns:
  // INFORMATION_TECHNOLOGY

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
   RISK OFFICER
========================================================= */

export default function RiskOfficer() {
  const [search, setSearch] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);

  /* VIEW USER */
  const [selectedUser, setSelectedUser] = useState(null);
  const [openView, setOpenView] = useState(false);

  /* EDIT USER */
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditMode, setOpenEditMode] = useState(null);

  /* ACTIVE ROW */
  const [activeRowId, setActiveRowId] = useState(null);

  /* USERS */
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
      const response = await getUsersByRole("RISK_OFFICER");

      console.log("FULL RISK OFFICER RESPONSE:", response);
      console.log("API DATA:", response?.data);

      let usersData = response?.data;

      /*
        Handle:

        {
          data: [...]
        }
      */

      if (usersData?.data) {
        usersData = usersData.data;
      }

      /*
        Handle:

        {
          users: [...]
        }
      */

      if (usersData?.users && Array.isArray(usersData.users)) {
        usersData = usersData.users;
      }

      /*
        Handle JSON string
      */

      if (typeof usersData === "string") {
        try {
          usersData = JSON.parse(usersData);
        } catch (parseError) {
          console.error(
            "JSON parse error:",
            parseError
          );

          usersData = [];
        }
      }

      /*
        Handle nested response after parsing
      */

      if (usersData?.data && Array.isArray(usersData.data)) {
        usersData = usersData.data;
      }

      console.log(
        "FINAL RISK OFFICER USERS:",
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
    } catch (err) {
      console.error(
        "LOAD RISK OFFICERS ERROR:",
        err
      );

      console.error(
        "Status:",
        err?.response?.status
      );

      console.error(
        "Response:",
        err?.response?.data
      );

      setUsers([]);

      if (err?.response?.status === 403) {
        setError(
          "Access Denied - You don't have permission to view Risk Officers"
        );
      } else if (err?.response?.status === 401) {
        setError(
          "Unauthorized - Please login again"
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load Risk Officers"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }

    const q = search.toLowerCase().trim();

    return users.filter((user) => {
      const firstName =
        user.profile?.firstName || "";

      const lastName =
        user.profile?.lastName || "";

      const fullName =
        `${firstName} ${lastName}`.toLowerCase();

      const email =
        String(user.email || "").toLowerCase();

      const employeeId =
        String(
          user.employeeId || ""
        ).toLowerCase();

      const department =
        formatDepartment(
          user.department
        ).toLowerCase();

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        employeeId.includes(q) ||
        department.includes(q)
      );
    });
  }, [users, search]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = useMemo(() => {
    const total = users.length;

    const active = users.filter(
      (user) => user.enabled === true
    ).length;

    const inactive = total - active;

    const departments = new Set(
      users
        .map((user) => {
          if (!user.department) {
            return null;
          }

          if (
            typeof user.department === "object"
          ) {
            return user.department.id;
          }

          return user.department;
        })
        .filter(Boolean)
    );

    return {
      total,
      active,
      inactive,
      deptCount: departments.size,
    };
  }, [users]);

  /* =========================================================
     STATUS CHART
  ========================================================= */

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

  /* =========================================================
     DEPARTMENT CHART
  ========================================================= */

  const deptChartData = useMemo(() => {
    const departmentMap = {};

    users.forEach((user) => {
      const department =
        formatDepartment(
          user.department
        );

      departmentMap[department] =
        (departmentMap[department] || 0) + 1;
    });

    return Object.entries(
      departmentMap
    ).map(([name, count]) => ({
      name,
      count,
    }));
  }, [users]);

  /* =========================================================
     CARD DATA
  ========================================================= */

  const cardData = [
    {
      label: "Total Risk Officers",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active",
      value: stats.active,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Departments",
      value: stats.deptCount,
      icon: Building2,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Risk Officer
          </h1>

          <p className="text-slate-500 mt-1">
            Manage Risk Officer Users
          </p>
        </div>

        <button
          onClick={() =>
            setOpenDrawer(true)
          }
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-md shadow-emerald-100 transition"
        >
          <Plus size={18} />

          Add Risk Officer
        </button>
      </motion.div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        {cardData.map(
          (card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -4,
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)",
                }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-slate-500">
                      {card.label}
                    </p>

                    <motion.p
                      key={card.value}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      className="text-3xl font-bold text-slate-800 mt-1"
                    >
                      {card.value}
                    </motion.p>
                  </div>

                  <div
                    className={`p-3 rounded-xl ${card.bg}`}
                  >
                    <Icon
                      className={card.color}
                      size={24}
                    />
                  </div>

                </div>

              </motion.div>
            );
          }
        )}

      </div>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* STATUS CHART */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.4,
            delay: 0.2,
          }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >

          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Status Distribution
          </h3>

          {stats.total === 0 ? (
            <p className="text-center text-gray-400 py-16">
              No data
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <PieChart>

                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  animationDuration={800}
                >

                  {statusChartData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          STATUS_COLORS[
                            index %
                              STATUS_COLORS.length
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
          )}

        </motion.div>

        {/* DEPARTMENT CHART */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.4,
            delay: 0.3,
          }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >

          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Risk Officers by Department
          </h3>

          {deptChartData.length === 0 ? (
            <p className="text-center text-gray-400 py-16">
              No data
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <BarChart data={deptChartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
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
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                >
                  {deptChartData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          DEPT_COLORS[
                            index %
                              DEPT_COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          )}

        </motion.div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative mb-6 w-full md:w-96">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search Risk Officer..."
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
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.1,
        }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >

        <div className="overflow-auto max-h-[520px]">

          <table className="w-full min-w-[950px] border-collapse">

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

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-slate-400"
                  >
                    Loading Risk Officers...
                  </td>
                </tr>

              ) : error ? (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-red-500"
                  >
                    {error}

                    <button
                      onClick={loadUsers}
                      className="ml-3 text-sm underline text-emerald-600"
                    >
                      Retry
                    </button>
                  </td>
                </tr>

              ) : filteredUsers.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-slate-400"
                  >
                    {search
                      ? "No matching Risk Officer found"
                      : "No Risk Officer Found"}
                  </td>
                </tr>

              ) : (

                <AnimatePresence>

                  {filteredUsers.map(
                    (user, index) => {

                      const firstName =
                        user.profile?.firstName ||
                        "";

                      const lastName =
                        user.profile?.lastName ||
                        "";

                      const fullName =
                        `${firstName} ${lastName}`.trim();

                      const isActive =
                        activeRowId === user.id;

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -10,
                          }}
                          transition={{
                            duration: 0.3,
                            delay:
                              index * 0.03,
                          }}
                          onClick={() =>
                            setActiveRowId(
                              user.id
                            )
                          }
                          className={`border-t border-slate-100 border-l-4 cursor-pointer transition-colors ${
                            isActive
                              ? "border-l-emerald-500 bg-emerald-50/60"
                              : "border-l-transparent hover:bg-slate-50"
                          }`}
                        >

                          {/* EMPLOYEE ID */}

                          <td className="px-6 py-4 text-slate-700 whitespace-nowrap font-medium">
                            {user.employeeId ||
                              "-"}
                          </td>

                          {/* NAME */}

                          <td className="px-6 py-4 text-slate-800 font-semibold whitespace-nowrap">
                            {fullName || "-"}
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

                                  setOpenView(
                                    true
                                  );
                                }}
                                title="View"
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
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

                                  setOpenEdit(
                                    true
                                  );
                                }}
                                title="Edit"
                                className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition"
                              >
                                <Pencil size={18} />
                              </button>

                              {/* DELETE */}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleDelete(
                                    user
                                  );
                                }}
                                title="Delete"
                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                              >
                                <Trash2 size={18} />
                              </button>

                            </div>

                          </td>

                        </motion.tr>
                      );
                    }
                  )}

                </AnimatePresence>

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
          title="Risk Officer"
          password="1234"
          role="RISK_OFFICER"
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
   DELETE USER
========================================================= */

async function handleDelete(user) {
  const name =
    `${user.profile?.firstName || ""} ${
      user.profile?.lastName || ""
    }`.trim() || user.email;

  const confirmed = window.confirm(
    `Are you sure you want to delete ${name}?`
  );

  if (!confirmed) {
    return;
  }

  /*
    Connect your delete API here.

    Example:

    await deleteUser(user.id);

    Then reload:

    await loadUsers();
  */

  console.log(
    "Delete Risk Officer:",
    user.id
  );

  alert(
    "Delete API is not connected yet."
  );
}