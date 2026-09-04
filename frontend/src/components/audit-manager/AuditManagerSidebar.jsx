import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  UserRoundCheck,
  FileCheck2,
  TriangleAlert,
  FileBarChart,
  Bell,
  CircleUser,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  ClipboardCheck,
  ShieldAlert,
  Activity,
  ShieldCheck,
  Gauge,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/AuthService";


// ============================================================
// NAVIGATION ITEMS
// ============================================================

const NAV_ITEMS = [
  // ----------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/audit-manager/dashboard",
  },

  // ----------------------------------------------------------
  // AUDIT MANAGEMENT DROPDOWN
  // ----------------------------------------------------------
  {
    label: "Audit Management",
    icon: ClipboardList,
    dropdown: true,

    children: [
      {
        label: "Annual Audit Details",
        icon: CalendarDays,
        path: "/audit-manager/annual-audits",
      },

      {
        label: "Audits",
        icon: ClipboardCheck,
        path: "/audit-manager/audits",
      },
    ],
  },

  // ----------------------------------------------------------
  // AUDITOR ASSIGNMENT
  // ----------------------------------------------------------
  {
    label: "Auditor Assignment",
    icon: UserCheck,
    path: "/audit-manager/auditor-assignment",
  },

  // ----------------------------------------------------------
  // AUDITEE ASSIGNMENT
  // ----------------------------------------------------------
  {
    label: "Auditee Assignment",
    icon: UserRoundCheck,
    path: "/audit-manager/auditee-assignment",
  },

  // ----------------------------------------------------------
  // RISK MANAGEMENT DROPDOWN
  // ----------------------------------------------------------
  {
    label: "Risk Management",
    icon: ShieldAlert,
    dropdown: true,

    children: [
      {
        label: "Risk Register",
        icon: ShieldAlert,
        path: "/audit-manager/risk-management",
      },

      {
        label: "Risk Assessment",
        icon: Activity,
        path: "/audit-manager/risk-assessment",
      },

      {
        label: "Mitigation",
        icon: ShieldCheck,
        path: "/audit-manager/mitigation",
      },
    ],
  },

  // ----------------------------------------------------------
  // KRI
  // ----------------------------------------------------------
  {
    label: "KRI",
    icon: Gauge,
    path: "/audit-manager/kri",
  },

   // ----------------------------------------------------------
  // FINDINGS
  // ----------------------------------------------------------
  {
    label: "Findings",
    icon: TriangleAlert,
    path: "/audit-manager/findings",
  },

  // ----------------------------------------------------------
  // REPORTS
  // ----------------------------------------------------------
  {
    label: "Reports",
    icon: FileBarChart,
    path: "/audit-manager/reports",
  },
];


// ============================================================
// FRAMER MOTION EASING
// ============================================================

const EASE = [0.4, 0, 0.2, 1];


// ============================================================
// COMPONENT
// ============================================================

export default function AuditManagerSidebar({
  collapsed,
  onToggleCollapse,
}) {

  const { logout } = useAuth();

  const location = useLocation();

  const [profile, setProfile] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);


  // ==========================================================
  // FETCH PROFILE
  // ==========================================================

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const response = await getProfile();

        setProfile(response?.data || response);

      } catch (error) {

        console.error(
          "Failed to load Audit Manager profile:",
          error
        );

      }

    };

    fetchProfile();

  }, []);


  // ==========================================================
  // PROFILE DETAILS
  // ==========================================================

  const firstName = profile?.firstName || "Audit";

  const lastName = profile?.lastName || "Manager";

  const displayName = `${firstName} ${lastName}`;

  const displayEmail = profile?.email || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();


  // ==========================================================
  // AUTO OPEN DROPDOWN BASED ON CURRENT ROUTE
  // ==========================================================

  useEffect(() => {

    const activeDropdown = NAV_ITEMS.find(
      (item) =>
        item.dropdown &&
        item.children?.some((child) =>
          location.pathname.startsWith(child.path)
        )
    );

    if (activeDropdown) {

      setOpenDropdown(activeDropdown.label);

    }

  }, [location.pathname]);


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    if (logout) {

      logout();

    } else {

      localStorage.removeItem("token");

      localStorage.removeItem("user");

      window.location.href = "/";

    }

  };


  // ==========================================================
  // DROPDOWN TOGGLE
  // ==========================================================

  const handleDropdownToggle = (label) => {

    if (collapsed) {

      onToggleCollapse();

      setTimeout(() => {
        setOpenDropdown(label);
      }, 100);

      return;

    }

    setOpenDropdown((current) =>
      current === label ? null : label
    );

  };


  // ==========================================================
  // SIDEBAR
  // ==========================================================

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
          TOP USER SECTION
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

        {/* PROFILE AVATAR */}

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
          {initials}
        </div>


        {/* PROFILE NAME */}

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
                "
              >
                {displayName}
              </p>

              <p
                className="
                  text-slate-400
                  text-xs
                  truncate
                "
              >
                Audit Manager
              </p>

            </motion.div>

          )}

        </AnimatePresence>


        {/* =================================================
            COLLAPSE BUTTON
        ================================================= */}

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
          CUSTOM SCROLLBAR
      ===================================================== */}

      <style>
        {`

          .audit-manager-nav::-webkit-scrollbar {
            width: 6px;
          }

          .audit-manager-nav::-webkit-scrollbar-track {
            background: #050810;
          }

          .audit-manager-nav::-webkit-scrollbar-thumb {
            background: #111827;
            border-radius: 10px;
          }

          .audit-manager-nav:hover::-webkit-scrollbar-thumb {
            background: #374151;
          }

          .audit-manager-nav::-webkit-scrollbar-thumb:active {
            background: #10b981;
          }

          .audit-manager-nav {
            scrollbar-width: thin;
            scrollbar-color: #111827 #050810;
          }

          .audit-manager-nav:hover {
            scrollbar-color: #374151 #050810;
          }

        `}
      </style>


      {/* =====================================================
          MAIN NAVIGATION
      ===================================================== */}

      <nav
        className="
          audit-manager-nav
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          px-3
          py-4
        "
      >

        {/* MAIN LABEL */}

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
              Main
            </motion.p>

          )}

        </AnimatePresence>


        {/* =================================================
            NAV ITEMS
        ================================================= */}

        <div className="space-y-2">

          {NAV_ITEMS.map((item) => {

            const {
              label,
              icon: Icon,
              path,
              dropdown,
              children,
            } = item;


            // =================================================
            // NORMAL NAVIGATION ITEM
            // =================================================

            if (!dropdown) {

              return (

                <NavLink

                  key={path}

                  to={path}

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
                    `
                  }
                >

                  {({ isActive }) => (

                    <>

                      {/* ACTIVE INDICATOR */}

                      {isActive && (

                        <motion.span

                          layoutId="audit-manager-active"

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

                          ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-emerald-400"
                          }

                          group-hover:scale-105
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
                            "
                          >
                            {label}
                          </motion.span>

                        )}

                      </AnimatePresence>

                    </>

                  )}

                </NavLink>

              );

            }


            // =================================================
            // DROPDOWN ITEM
            // =================================================

            const isOpen =
              openDropdown === label;


            return (

              <div key={label}>

                {/* DROPDOWN HEADER */}

                <button

                  type="button"

                  onClick={() =>
                    handleDropdownToggle(label)
                  }

                  className={`
                    group
                    relative
                    w-full
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
                      isOpen

                        ? `
                          bg-emerald-500/10
                          border-emerald-500/20
                          text-emerald-300
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
                  `}
                >

                  {/* DROPDOWN ICON */}

                  <Icon

                    size={18}

                    className="
                      shrink-0
                      transition-all
                      duration-200
                      group-hover:scale-105
                      group-hover:text-emerald-400
                    "
                  />


                  {/* DROPDOWN LABEL */}

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
                          flex-1
                          text-left
                          whitespace-nowrap
                          overflow-hidden
                        "
                      >
                        {label}
                      </motion.span>

                    )}

                  </AnimatePresence>


                  {/* CHEVRON */}

                  {!collapsed && (

                    <motion.div

                      animate={{
                        rotate: isOpen ? 180 : 0,
                      }}

                      transition={{
                        duration: 0.2,
                      }}
                    >

                      <ChevronDown size={16} />

                    </motion.div>

                  )}

                </button>


                {/* =================================================
                    DROPDOWN CHILDREN
                ================================================= */}

                <AnimatePresence initial={false}>

                  {!collapsed && isOpen && (

                    <motion.div

                      initial={{
                        height: 0,
                        opacity: 0,
                      }}

                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}

                      exit={{
                        height: 0,
                        opacity: 0,
                      }}

                      transition={{
                        duration: 0.25,
                        ease: EASE,
                      }}

                      className="
                        overflow-hidden
                      "
                    >

                      <div
                        className="
                          ml-5
                          mt-1
                          pl-3
                          border-l
                          border-emerald-500/20
                          space-y-1
                        "
                      >

                        {children.map(
                          ({
                            label: childLabel,
                            icon: ChildIcon,
                            path: childPath,
                          }) => (

                            <NavLink

                              key={childPath}

                              to={childPath}

                              className={({ isActive }) =>

                                `
                                group
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                px-3
                                py-2.5
                                text-xs
                                font-medium
                                transition-all
                                duration-200

                                ${
                                  isActive

                                    ? `
                                      bg-emerald-500/20
                                      text-emerald-300
                                    `

                                    : `
                                      text-slate-500
                                      hover:text-emerald-300
                                      hover:bg-emerald-500/10
                                    `
                                }
                                `
                              }
                            >

                              {({ isActive }) => (

                                <>

                                  <ChildIcon

                                    size={15}

                                    className={`
                                      shrink-0
                                      transition-all
                                      duration-200

                                      ${
                                        isActive
                                          ? "text-emerald-300"
                                          : "text-slate-500 group-hover:text-emerald-400"
                                      }

                                      group-hover:scale-105
                                    `}
                                  />

                                  <span className="truncate">
                                    {childLabel}
                                  </span>

                                </>

                              )}

                            </NavLink>

                          )
                        )}

                      </div>

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>

            );

          })}

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

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <NavLink

          to="/audit-manager/notifications"

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
            `
          }
        >

          <Bell
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
                Notifications
              </motion.span>

            )}

          </AnimatePresence>

        </NavLink>


        {/* =================================================
            PROFILE
        ================================================= */}

        <NavLink

          to="/audit-manager/profile"

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
            `
          }
        >

          <CircleUser
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
                Profile
              </motion.span>

            )}

          </AnimatePresence>

        </NavLink>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button

          type="button"

          onClick={handleLogout}

          className="
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
          "
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


        {/* =================================================
            USER CARD
        ================================================= */}

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

          {/* USER AVATAR */}

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


          {/* USER DETAILS */}

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

      </div>

    </motion.aside>

  );

}