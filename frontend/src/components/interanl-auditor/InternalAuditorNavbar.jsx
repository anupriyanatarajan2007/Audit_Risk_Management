
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, UserCircle, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/AuthService";

const PAGE_TITLES = {
  "/internal-auditor/dashboard": "Dashboard",
  "/internal-auditor/audits": "My Audits",
  "/internal-auditor/risks": "Assigned Risks",
  "/internal-auditor/planning": "Audit Planning",
  "/internal-auditor/execution": "Audit Execution",
  "/internal-auditor/findings": "Findings",
  "/internal-auditor/evidence": "Evidence",
  "/internal-auditor/recommendations": "Recommendations",
  "/internal-auditor/reports": "Audit Reports",
  "/internal-auditor/notifications": "Notifications",
  "/internal-auditor/profile": "Profile",
};

export default function InternalAuditorNavbar() {
  const { logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const dropdownRef = useRef(null);

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();

        setProfile(response?.data || response);
      } catch (error) {
        console.error(
          "Failed to load Internal Auditor profile:",
          error
        );
      }
    };

    fetchProfile();
  }, []);

  // =========================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================
  // PAGE TITLE
  // =========================
  const pageTitle =
    PAGE_TITLES[location.pathname] || "Dashboard";

  // =========================
  // DISPLAY NAME
  // =========================
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : "Internal Auditor";

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    setOpen(false);

    // Clear authentication data
    if (logout) {
      logout();
    }

    // Login page is "/" in this application
    window.location.replace("/");
  };

  // =========================
  // COMPONENT
  // =========================
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 lg:px-6">

      {/* PAGE TITLE */}
      <h1 className="text-slate-800 font-semibold text-base">
        {pageTitle}
      </h1>

      {/* PROFILE DROPDOWN */}
      <div
        className="relative"
        ref={dropdownRef}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-slate-700 font-medium text-sm hover:text-slate-900 transition-colors duration-200"
        >
          <span className="hidden sm:inline">
            {displayName}
          </span>

          <span className="text-slate-400">
            ·
          </span>

          <span>
            Internal Auditor
          </span>

          <motion.span
            animate={{
              rotate: open ? 180 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <ChevronDown size={16} />
          </motion.span>
        </button>

        {/* DROPDOWN */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -5,
                scale: 0.98,
              }}
              transition={{
                duration: 0.18,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden origin-top-right"
            >

              {/* PROFILE */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(
                    "/internal-auditor/profile"
                  );
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <UserCircle
                  size={16}
                  className="text-slate-400"
                />

                Profile
              </button>

              {/* NOTIFICATIONS */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(
                    "/internal-auditor/notifications"
                  );
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <Bell
                  size={16}
                  className="text-slate-400"
                />

                Notifications
              </button>

              {/* DIVIDER */}
              <div className="border-t border-slate-100" />

              {/* LOGOUT */}
              <button
                type="button"
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
