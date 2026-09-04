import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  ClipboardList,
  ShieldAlert,
  Scale,
  Bell,
  Settings,
  FileText,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/authService";

/* =========================================================
   USER MANAGEMENT ROLES
========================================================= */

const USER_ROLES = [
    {
      label: "Internal Auditor",
      path: "/admin/users/internal-auditor",
    },
    {
      label: "System Administrator",
      path: "/admin/users/system-administrator",
    },
    {
      label: "Audit Manager",
      path: "/admin/users/audit-manager",
    },
    {
      label: "Chief Audit Executive",
      path: "/admin/users/chief-audit-executive",
    },
    {
      label: "Risk Officer",
      path: "/admin/users/risk-officer",
    },
    {
      label: "Auditee",
      path: "/admin/users/auditee",
    },
    {
      label: "Compliance Officer",
      path: "/admin/users/compliance-officer",
    },
  ];

/* =========================================================
   NAVIGATION ITEMS
========================================================= */

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },

  {
    label: "User Management",
    icon: Users,
    path: "/admin/users",
    children: USER_ROLES,
  },

  {
    label: "Roles & Permissions",
    icon: ShieldCheck,
    path: "/admin/roles-permissions",
  },

  {
    label: "Organization Management",
    icon: Building2,
    path: "/admin/organization",
  },

  {
    label: "Audit Configuration",
    icon: ClipboardList,
    path: "/admin/audit-configuration",
  },

  {
    label: "Risk Configuration",
    icon: ShieldAlert,
    path: "/admin/risk-configuration",
  },

  {
    label: "Compliance Rules",
    icon: Scale,
    path: "/admin/regulatory-requirements",
  },

  {
    label: "Notification Management",
    icon: Bell,
    path: "/admin/notification-management",
  },

  {
    label: "System Settings",
    icon: Settings,
    path: "/admin/settings",
  },

  {
    label: "Audit Logs",
    icon: FileText,
    path: "/admin/audit-logs",
  },
];

const EASE = [0.4, 0, 0.2, 1];

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
}) {
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [hoveredPath, setHoveredPath] = useState(null);

  /* =========================================================
     USER MANAGEMENT DROPDOWN STATE
  ========================================================= */

  const [userManagementOpen, setUserManagementOpen] =
    useState(false);

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response?.data || response);
      } catch (error) {
        console.error(
          "Failed to load Admin profile:",
          error
        );
      }
    };

    fetchProfile();
  }, []);

  /* =========================================================
     PROFILE DATA
  ========================================================= */

  const firstName = profile?.firstName || "System";
  const lastName = profile?.lastName || "Administrator";

  const displayName = `${firstName} ${lastName}`;
  const displayEmail = profile?.email || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  /* =========================================================
     LOGOUT
  ========================================================= */


  const handleLogout = () => {
      setOpen(false);
  
      // Clear authentication/session data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userData");
  
      // If your auth context provides logout
      if (logout) {
          logout("/");
      } else {
          // Fallback redirect
          window.location.href = "/";
      }
  };
    

  /* =========================================================
     BOTTOM ITEMS
  ========================================================= */

  const bottomItems = [
    {
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
    },
    {
      label: "Profile",
      icon: UserCircle,
      path: "/admin/profile",
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 80 : 260,
      }}
      transition={{
        duration: 0.3,
        ease: EASE,
      }}
      className="
        relative
        shrink-0
        h-screen
        bg-[#0B1120]
        border-r
        border-white/5
        flex
        flex-col
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          relative
          shrink-0
          flex
          items-center
          gap-3
          px-4
          py-5
          border-b
          border-white/5
          overflow-visible
        "
      >

        {/* ADMIN LOGO */}

        <div
          className="
            w-10
            h-10
            shrink-0
            rounded-xl
            bg-gradient-to-br
            from-emerald-400
            to-teal-500
            flex
            items-center
            justify-center
            text-white
            font-semibold
            shadow-lg
            shadow-emerald-500/20
          "
        >
          A
        </div>

        {/* ADMIN NAME */}

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{
                opacity: 0,
                x: -8,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -8,
              }}
              transition={{
                duration: 0.2,
                ease: EASE,
              }}
              className="
                min-w-0
                overflow-hidden
                whitespace-nowrap
              "
            >
              <p
                className="
                  text-white
                  text-sm
                  font-semibold
                  truncate
                  leading-tight
                "
              >
                {displayName}
              </p>

              <p
                className="
                  text-slate-400
                  text-[11px]
                  truncate
                  mt-0.5
                "
              >
                System Administrator
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COLLAPSE BUTTON */}

        <button
          type="button"
          onClick={onToggleCollapse}
          className="
            flex
            absolute
            -right-3
            top-6
            z-[60]
            w-6
            h-6
            items-center
            justify-center
            rounded-full
            bg-[#111827]
            border
            border-white/10
            text-slate-300
            shadow-md
            hover:text-emerald-400
            hover:border-emerald-500/40
            hover:scale-110
            transition-all
            duration-200
          "
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>
      </div>

      {/* =====================================================
          SCROLLBAR
      ===================================================== */}

      <style>
        {`
          .admin-nav::-webkit-scrollbar {
            width: 6px;
          }

          .admin-nav::-webkit-scrollbar-track {
            background: #050810;
          }

          .admin-nav::-webkit-scrollbar-thumb {
            background: #111827;
            border-radius: 10px;
          }

          .admin-nav:hover::-webkit-scrollbar-thumb {
            background: #374151;
          }

          .admin-nav::-webkit-scrollbar-thumb:active {
            background: #10b981;
          }

          .admin-nav {
            scrollbar-width: thin;
            scrollbar-color: #111827 #050810;
          }

          .admin-nav:hover {
            scrollbar-color: #374151 #050810;
          }
        `}
      </style>

      {/* =====================================================
          MAIN NAVIGATION
      ===================================================== */}

      <nav
        className="
          admin-nav
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          px-3
          py-4
        "
      >

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                px-3
                pb-3
                text-[11px]
                font-semibold
                tracking-wider
                text-slate-500
                uppercase
              "
            >
              Administration
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-2">

          {NAV_ITEMS.map(
            ({
              label,
              icon: Icon,
              path,
              children,
            }) => {

              const isUserManagement =
                label === "User Management";

              return (
                <div
                  key={path}
                  className="relative"
                  onMouseEnter={() =>
                    setHoveredPath(path)
                  }
                  onMouseLeave={() =>
                    setHoveredPath(null)
                  }
                >

                  {/* =================================================
                      MAIN NAV ITEM
                  ================================================= */}

                  <div className="flex items-center">

                    <NavLink
                      to={path}
                      onClick={() => {
                        if (isUserManagement && !collapsed) {
                          setUserManagementOpen(
                            (prev) => !prev
                          );
                        }
                      }}
                      className={({ isActive }) =>
                        `
                        group
                        relative
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        font-medium
                        border
                        transition-all
                        duration-200
                        flex-1

                        ${
                          isActive
                            ? `
                              bg-gradient-to-r
                              from-emerald-500
                              to-teal-500
                              border-emerald-400/20
                              text-white
                              shadow-md
                              shadow-emerald-500/25
                            `
                            : `
                              bg-white/[0.03]
                              border-transparent
                              text-slate-400
                              hover:bg-emerald-500/10
                              hover:border-emerald-500/20
                              hover:text-emerald-300
                              active:bg-emerald-500/20
                            `
                        }

                        ${collapsed ? "justify-center" : ""}
                        `
                      }
                    >

                      {({ isActive }) => (
                        <>
                          {/* ACTIVE BAR */}

                          {isActive && (
                            <motion.span
                              layoutId="admin-active"
                              className="
                                absolute
                                left-0
                                top-1/2
                                -translate-y-1/2
                                w-1
                                h-5
                                rounded-full
                                bg-emerald-200
                              "
                            />
                          )}

                          {/* ICON */}

                          <Icon
                            size={18}
                            className={`
                              shrink-0
                              transition-all
                              duration-200
                              group-hover:scale-105

                              ${
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-emerald-400"
                              }
                            `}
                          />

                          {/* LABEL */}

                          <AnimatePresence initial={false}>
                            {!collapsed && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  x: -6,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  x: -6,
                                }}
                                transition={{
                                  duration: 0.2,
                                  ease: EASE,
                                }}
                                className="
                                  whitespace-nowrap
                                  overflow-hidden
                                  flex-1
                                "
                              >
                                {label}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          {/* USER MANAGEMENT ARROW */}

                          {!collapsed &&
                            isUserManagement && (
                              <motion.div
                                animate={{
                                  rotate:
                                    userManagementOpen
                                      ? 180
                                      : 0,
                                }}
                                transition={{
                                  duration: 0.2,
                                }}
                              >
                                <ChevronDown
                                  size={16}
                                  className="
                                    text-slate-400
                                  "
                                />
                              </motion.div>
                            )}
                        </>
                      )}

                    </NavLink>

                  </div>

                  {/* =================================================
                      USER MANAGEMENT ROLE DROPDOWN
                  ================================================= */}

                  <AnimatePresence initial={false}>

                    {!collapsed &&
                      isUserManagement &&
                      userManagementOpen && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                            y: -5,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                            y: -5,
                          }}
                          transition={{
                            duration: 0.2,
                            ease: EASE,
                          }}
                          className="
                            ml-5
                            mt-1
                            pl-4
                            border-l
                            border-emerald-500/20
                            space-y-1
                            overflow-hidden
                          "
                        >

                          {children?.map((role) => (
                            <NavLink
                              key={role.path}
                              to={role.path}
                              className={({ isActive }) =>
                                `
                                flex
                                items-center
                                rounded-lg
                                px-3
                                py-2
                                text-xs
                                transition-all
                                duration-200

                                ${
                                  isActive
                                    ? `
                                      bg-emerald-500/15
                                      text-emerald-300
                                      border
                                      border-emerald-500/20
                                    `
                                    : `
                                      text-slate-500
                                      hover:bg-emerald-500/10
                                      hover:text-emerald-300
                                    `
                                }
                                `
                              }
                            >
                              {role.label}
                            </NavLink>
                          ))}

                        </motion.div>
                      )}

                  </AnimatePresence>

                  {/* =================================================
                      COLLAPSED TOOLTIP
                  ================================================= */}

                  <AnimatePresence>

                    {collapsed &&
                      hoveredPath === path && (

                        <motion.div
                          initial={{
                            opacity: 0,
                            x: -4,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -4,
                          }}
                          transition={{
                            duration: 0.15,
                          }}
                          className="
                            absolute
                            left-full
                            top-1/2
                            -translate-y-1/2
                            ml-2
                            z-50
                            px-2.5
                            py-1.5
                            rounded-lg
                            bg-[#111827]
                            border
                            border-white/10
                            text-white
                            text-xs
                            whitespace-nowrap
                            shadow-lg
                            pointer-events-none
                          "
                        >
                          {label}
                        </motion.div>

                      )}

                  </AnimatePresence>

                </div>
              );
            }
          )}

        </div>
      </nav>

      {/* =====================================================
          BOTTOM SECTION
      ===================================================== */}

      <div
        className="
          shrink-0
          p-3
          border-t
          border-white/5
          bg-[#0B1120]
          space-y-2
        "
      >

        {/* NOTIFICATIONS + PROFILE */}

        {bottomItems.map(
          ({ label, icon: Icon, path }) => (

            <div
              key={path}
              className="relative"
              onMouseEnter={() =>
                setHoveredPath(path)
              }
              onMouseLeave={() =>
                setHoveredPath(null)
              }
            >

              <NavLink
                to={path}
                className={({ isActive }) =>
                  `
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  border
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? `
                        bg-emerald-500
                        border-emerald-400/20
                        text-white
                        shadow-md
                        shadow-emerald-500/20
                      `
                      : `
                        bg-white/[0.03]
                        border-transparent
                        text-slate-400
                        hover:bg-emerald-500/10
                        hover:border-emerald-500/20
                        hover:text-emerald-300
                      `
                  }

                  ${collapsed ? "justify-center" : ""}
                  `
                }
              >

                <Icon
                  size={18}
                  className="
                    shrink-0
                    transition-transform
                    duration-200
                    group-hover:scale-105
                  "
                />

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{
                        opacity: 0,
                        x: -6,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -6,
                      }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

              </NavLink>

              {/* TOOLTIP */}

              <AnimatePresence>

                {collapsed &&
                  hoveredPath === path && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -4,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -4,
                      }}
                      transition={{
                        duration: 0.15,
                      }}
                      className="
                        absolute
                        left-full
                        top-1/2
                        -translate-y-1/2
                        ml-2
                        z-50
                        px-2.5
                        py-1.5
                        rounded-lg
                        bg-[#111827]
                        border
                        border-white/10
                        text-white
                        text-xs
                        whitespace-nowrap
                        shadow-lg
                        pointer-events-none
                      "
                    >
                      {label}
                    </motion.div>

                  )}

              </AnimatePresence>

            </div>
          )
        )}

        {/* =====================================================
            USER INFO
        ===================================================== */}

        <div
          className={`
            flex
            items-center
            gap-3
            rounded-xl
            bg-white/5
            border
            border-white/5
            p-2.5

            ${collapsed ? "justify-center" : ""}
          `}
        >

          <div
            className="
              w-9
              h-9
              shrink-0
              rounded-full
              bg-gradient-to-br
              from-emerald-400
              to-teal-500
              flex
              items-center
              justify-center
              text-white
              text-xs
              font-semibold
            "
          >
            {initials}
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (

              <motion.div
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -6,
                }}
                transition={{
                  duration: 0.2,
                  ease: EASE,
                }}
                className="
                  min-w-0
                  overflow-hidden
                "
              >

                <p
                  className="
                    text-white
                    text-xs
                    font-semibold
                    truncate
                  "
                >
                  {displayName}
                </p>

                <p
                  className="
                    text-slate-400
                    text-[11px]
                    truncate
                  "
                >
                  {displayEmail}
                </p>

              </motion.div>

            )}
          </AnimatePresence>

        </div>

        {/* =====================================================
            LOGOUT
        ===================================================== */}

        <button
          type="button"
          onClick={handleLogout}
          className={`
            w-full
            group
            flex
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-medium
            bg-white/[0.03]
            border
            border-transparent
            text-slate-400

            hover:bg-red-500/10
            hover:border-red-500/20
            hover:text-red-400

            active:bg-red-500/20

            transition-all
            duration-200

            ${collapsed ? "justify-center" : ""}
          `}
        >

          <LogOut
            size={18}
            className="
              shrink-0
              transition-transform
              duration-200
              group-hover:scale-105
            "
          />

          <AnimatePresence initial={false}>
            {!collapsed && (

              <motion.span
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -6,
                }}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>

            )}
          </AnimatePresence>

        </button>

      </div>

    </motion.aside>
  );
}