import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, UserCircle, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/AuthService";

const PAGE_TITLES = {
  "/chief-audit-executive/dashboard": "Dashboard",
  "/chief-audit-executive/annual-audit-plan": "Annual Audit Plan",
  "/chief-audit-executive/audits": "Audit Portfolio",
  "/chief-audit-executive/monitoring": "Audit Monitoring",
  "/chief-audit-executive/risks": "Risk Overview",
  "/chief-audit-executive/findings": "Findings & Issues",
  "/chief-audit-executive/recommendations": "Recommendations",
  "/chief-audit-executive/reports": "Audit Reports",
  "/chief-audit-executive/compliance": "Compliance Overview",
  "/chief-audit-executive/performance": "Audit Performance",
  "/chief-audit-executive/notifications": "Notifications",
  "/chief-audit-executive/profile": "Profile",
};

export default function ChiefAuditExecutiveTopBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response?.data || response);
      } catch (error) {
        console.error("Failed to load CAE profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : "Chief Audit Executive";

    const handleLogout = () => {
      setOpen(false);
    
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    
      window.location.href = "/";
    };
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 lg:px-6">
      <h1 className="text-slate-800 font-semibold text-base">{pageTitle}</h1>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-slate-700 font-medium text-sm hover:text-slate-900 transition-colors duration-200"
        >

          Chief Audit Executive
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden origin-top-right"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/chief-audit-executive/profile");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <UserCircle size={16} className="text-slate-400" />
                Profile
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/chief-audit-executive/notifications");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <Bell size={16} className="text-slate-400" />
                Notifications
              </button>
              <div className="border-t border-slate-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut size={16} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}