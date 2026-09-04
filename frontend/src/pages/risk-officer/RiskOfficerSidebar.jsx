// components/layout/Sidebar.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShieldAlert,
  ClipboardList,
  FileSearch,
  Wrench,
  Activity,
  Building2,
  FileBarChart2,
  Bell,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { getProfile } from "../../service/AuthService";
import NotificationService from "../../service/NotificationService";

// ---- Nav Config ----------------------------------------------------------
const NAV_ITEMS = [
  {
    type: "link",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/risk-officer/dashboards",
    roles: ["RISK_OFFICER"],
  },
  {
    type: "group",
    label: "Risk Management",
    icon: ShieldAlert,
    roles: ["RISK_OFFICER"],
    children: [
      {
        label: "Risk Register",
        to: "/risk-officer/risk-register",
        icon: ClipboardList,
      },
      // {
      //   label: "Risk Assessment",
      //   to: "/risk-officer/risk-assessment",
      //   icon: FileSearch,
      // },
    ],
  },
  {
    type: "link",
    label: "Mitigation",
    icon: Wrench,
    to: "/risk-officer/mitigation",
    roles: ["RISK_OFFICER"],
    badgeKey: "mitigationCount",
  },
  {
    type: "link",
    label: "KRI Monitoring",
    icon: Activity,
    to: "/risk-officer/kri",
    roles: ["RISK_OFFICER"],
    badgeKey: "criticalKriCount",
  },
  {
    type: "link",
    label: "Vendor Risk",
    icon: Building2,
    to: "/risk-officer/vendor",
    roles: ["RISK_OFFICER"],
  },
  {
    type: "link",
    label: "Reports",
    icon: FileBarChart2,
    to: "/risk-officer/reports",
    roles: ["RISK_OFFICER"],
  },
];

const BOTTOM_ITEMS = [
    {
      label: "Notifications",
      icon: Bell,
      to: "/risk-officer/notifications",
      badgeKey: "unreadCount",
    },
    {
      label: "Profile",
      icon: UserCircle,
      to: "/risk-officer/profile",
    },
  ];

// ---- Tooltip (collapsed mode) --------------------------------------------
function Tooltip({ label, show }) {
  if (!show) return null;
  return (
    <div
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2
                 whitespace-nowrap rounded-lg border border-white/10 bg-[#0B1120]/95
                 px-3 py-1.5 text-xs font-medium text-emerald-50 opacity-0
                 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md
                 transition-opacity duration-150 group-hover:opacity-100"
    >
      {label}
      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0B1120]/95" />
    </div>
  );
}

// ---- Badge -----------------------------------------------------------
function Badge({ count, collapsed }) {
  if (!count) return null;
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600
        text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]
        ${collapsed ? "absolute -right-1 -top-1 h-4 min-w-[16px] px-1" : "ml-auto h-5 min-w-[20px] px-1.5"}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ---- Nav Link Row ------------------------------------------------------
function NavRow({ icon: Icon, label, to, collapsed, badgeCount, indent = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
         transition-all duration-200 ease-out
         ${indent ? "ml-2" : ""}
         ${
           isActive
             ? "bg-gradient-to-r from-emerald-500/90 to-teal-500/80 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
             : "text-slate-300 hover:bg-white/5 hover:text-emerald-50"
         }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="active-pill-glow"
              className="absolute -left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(52,211,153,0.8)]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Icon
            size={19}
            strokeWidth={2}
            className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-300"}`}
          />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          <div className={collapsed ? "" : "ml-auto"}>
            <Badge count={badgeCount} collapsed={collapsed} />
          </div>
          <Tooltip label={label} show={collapsed} />
        </>
      )}
    </NavLink>
  );
}

// ---- Group (expandable submenu) ------------------------------------------
function NavGroup({ item, collapsed, badgeCounts }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  if (collapsed) {
    // In collapsed mode, show children as flyout on hover
    return (
      <div className="group relative">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-emerald-50 cursor-pointer">
          <Icon size={19} className="shrink-0 text-slate-400 group-hover:text-emerald-300" />
        </div>
        <div
          className="pointer-events-none absolute left-full top-0 z-50 ml-3 min-w-[190px] rounded-xl
                     border border-white/10 bg-[#0B1120]/95 p-2 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.5)]
                     backdrop-blur-md transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
        >
          <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {item.label}
          </p>
          <div className="space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors
                   ${isActive ? "bg-emerald-500/90 text-white" : "text-slate-300 hover:bg-white/5 hover:text-emerald-50"}`
                }
              >
                <child.icon size={16} />
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                   text-slate-300 transition-colors hover:bg-white/5 hover:text-emerald-50"
      >
        <Icon size={19} className="shrink-0 text-slate-400" />
        <span className="whitespace-nowrap">{item.label}</span>
        <ChevronDown
          size={15}
          className={`ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-1 space-y-1 overflow-hidden pl-3"
          >
            {item.children.map((child) => (
              <NavRow
                key={child.to}
                icon={child.icon}
                label={child.label}
                to={child.to}
                collapsed={false}
                indent
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Main Sidebar ---------------------------------------------------------
export default function RiskOfficerSidebar({
    badgeCounts,
 onLogout,
}) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);  
   
    useEffect(() => {
        const loadProfile = async () => {
          try {
            const profile = await getProfile();
      
            setUser(profile.data ?? profile);
          } catch (err) {
            console.error("Failed to load profile", err);
          } finally {
            setLoading(false);
          }
        };
      
        loadProfile();
      }, []);

      const role = user?.role || "";

const userName =
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

const userEmail = user?.email || "";

const initials = userName
  .split(" ")
  .map((n) => n[0])
  .join("")
  .substring(0, 2)
  .toUpperCase();

  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS;
  
  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("session");
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 280 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="relative flex h-screen flex-col border-r border-white/10
                 bg-[#0B1120]/90 backdrop-blur-xl shadow-[4px_0_30px_rgba(0,0,0,0.4)]"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-20 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />

      {/* Logo / Brand */}
      <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                        bg-gradient-to-br from-emerald-400 to-teal-600 font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.5)]">
          A
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold text-white">{userName}</p>
              <p className="text-[11px] text-slate-400">Audit & Risk Suite</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full
                     border border-white/10 bg-[#111827] text-slate-400 shadow-md
                     transition-colors hover:text-emerald-400"
        >
          {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin scrollbar-thumb-white/10">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Main
          </p>
        )}
        {visibleItems.map((item) =>
          item.type === "group" ? (
            <NavGroup key={item.label} item={item} collapsed={collapsed} badgeCounts={badgeCounts} />
          ) : (
            <NavRow
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              collapsed={collapsed}
              badgeCount={badgeCounts[item.badgeKey]}
            />
          )
        )}
      </nav>

      {/* Bottom section */}
      <div className="relative space-y-1 border-t border-white/10 px-3 py-4">
        {BOTTOM_ITEMS.map((item) => (
          <NavRow
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            collapsed={collapsed}
            badgeCount={badgeCounts[item.badgeKey]}
          />
        ))}

        <button
          onClick={handleLogout}
          className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                     text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={19} className="shrink-0 text-slate-400 group-hover:text-red-400" />
          {!collapsed && <span>Logout</span>}
          <Tooltip label="Logout" show={collapsed} />
        </button>

        {/* User card */}
        <div
          className={`mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-2.5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                          bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
            {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden whitespace-nowrap">
              <p className="truncate text-xs font-semibold text-white">{userName}</p>
              <p className="truncate text-[11px] text-slate-400">{userEmail}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}