import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShieldCheck,
  ClipboardCheck,
  Scale,
  ShieldAlert,
  CircleAlert,
  Lightbulb,
  ListChecks,
  FileBarChart,
  Bell,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/AuthService";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/compliance-officer/dashboard" },
   { label: "Compliance Reviews", icon: ClipboardCheck, path: "/compliance-officer/review" },
  { label: "Regulatory Requirements", icon: Scale, path: "/compliance-officer/regulatory-requirements" },
  { label: "Compliance Risks", icon: ShieldAlert, path: "/compliance-officer/risks" },
  { label: "Audit Findings", icon: CircleAlert, path: "/compliance-officer/findings" },
  { label: "Recommendations", icon: Lightbulb, path: "/compliance-officer/recommendations" },
  { label: "Compliance Reports", icon: FileBarChart, path: "/compliance-officer/reports" },
];

const EASE = [0.4, 0, 0.2, 1];

export default function ComplianceOfficerSidebar({ collapsed, onToggleCollapse }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [hoveredPath, setHoveredPath] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response?.data || response);
      } catch (error) {
        console.error("Failed to load Compliance Officer profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const firstName = profile?.firstName || "Compliance";
  const lastName = profile?.lastName || "Officer";
  const displayName = `${firstName} ${lastName}`;
  const displayEmail = profile?.email || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="relative shrink-0 h-screen bg-[#0B1120] border-r border-white/5 flex flex-col"
    >
      {/* HEADER */}
      <div className="relative shrink-0 flex items-center gap-3 px-4 py-5 border-b border-white/5 overflow-visible">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-emerald-500/20">
          A
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="min-w-0 overflow-hidden whitespace-nowrap"
            >
             <p className="text-white text-sm font-semibold truncate leading-tight">{displayName}</p>
              <p className="text-slate-400 text-[11px] truncate mt-0.5">Compliance Officer</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CIRCLE TOGGLE — always visible, same as other role sidebars */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex absolute -right-3 top-6 z-[60] w-6 h-6 items-center justify-center
                     rounded-full bg-[#111827] border border-white/10 text-slate-300 shadow-md
                     hover:text-emerald-400 hover:border-emerald-500/40 hover:scale-110
                     transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <style>
        {`
          .compliance-officer-nav::-webkit-scrollbar { width: 6px; }
          .compliance-officer-nav::-webkit-scrollbar-track { background: #050810; }
          .compliance-officer-nav::-webkit-scrollbar-thumb { background: #111827; border-radius: 10px; }
          .compliance-officer-nav:hover::-webkit-scrollbar-thumb { background: #374151; }
          .compliance-officer-nav::-webkit-scrollbar-thumb:active { background: #10b981; }
          .compliance-officer-nav { scrollbar-width: thin; scrollbar-color: #111827 #050810; }
          .compliance-officer-nav:hover { scrollbar-color: #374151 #050810; }
        `}
      </style>

      {/* MAIN NAV — sidebar stays dark; only the hovered/active item shows accent */}
      <nav className="compliance-officer-nav flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 pb-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
            >
              Main
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <div
              key={path}
              className="relative"
              onMouseEnter={() => setHoveredPath(path)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium border transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400/20 text-white shadow-md shadow-emerald-500/25"
                      : "bg-white/[0.03] border-transparent text-slate-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-300 active:bg-emerald-500/20"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="compliance-officer-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-emerald-200"
                      />
                    )}
                    <Icon
                      size={18}
                      className={`shrink-0 transition-all duration-200 group-hover:scale-105 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                      }`}
                    />
                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>

              {/* TOOLTIP — only shown when collapsed and hovered */}
              <AnimatePresence>
                {collapsed && hoveredPath === path && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5
                               rounded-lg bg-[#111827] border border-white/10 text-white text-xs
                               whitespace-nowrap shadow-lg pointer-events-none"
                  >
                    {label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </nav>

      {/* BOTTOM SECTION */}
      <div className="shrink-0 p-3 border-t border-white/5 bg-[#0B1120] space-y-2">
        {[
          { label: "Notifications", icon: Bell, path: "/compliance-officer/notifications" },
          { label: "Profile", icon: UserCircle, path: "/compliance-officer/profile" },
        ].map(({ label, icon: Icon, path }) => (
          <div
            key={path}
            className="relative"
            onMouseEnter={() => setHoveredPath(path)}
            onMouseLeave={() => setHoveredPath(null)}
          >
            <NavLink
              to={path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500 border-emerald-400/20 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white/[0.03] border-transparent text-slate-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-300 active:bg-emerald-500/20"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
            <AnimatePresence>
              {collapsed && hoveredPath === path && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5
                             rounded-lg bg-[#111827] border border-white/10 text-white text-xs
                             whitespace-nowrap shadow-lg pointer-events-none"
                >
                  {label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className={`flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 p-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="min-w-0 overflow-hidden"
              >
                <p className="text-white text-xs font-semibold truncate">{displayName}</p>
                <p className="text-slate-400 text-[11px] truncate">{displayEmail}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={`w-full group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium bg-white/[0.03] border border-transparent text-slate-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 active:bg-red-500/20 transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
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