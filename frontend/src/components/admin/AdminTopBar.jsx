import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  ChevronDown,
  UserCircle,
  Bell,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/AuthService";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "User Management",
  "/admin/roles-permissions": "Roles & Permissions",
  "/admin/organization": "Organization Management",
  "/admin/audit-configuration": "Audit Configuration",
  "/admin/risk-configuration": "Risk Configuration",
  "/admin/compliance-rules": "Compliance Rules",
  "/admin/notification-management": "Notification Management",
  "/admin/settings": "System Settings",
  "/admin/audit-logs": "Audit Logs",
  "/admin/notifications": "Notifications",
  "/admin/profile": "Profile",
};

export default function AdminTopBar() {

  const { logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const dropdownRef = useRef(null);

  /* ================= PROFILE ================= */

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const response = await getProfile();

        setProfile(
          response?.data || response
        );

      } catch (error) {

        console.error(
          "Failed to load Admin profile:",
          error
        );

      }

    };

    fetchProfile();

  }, []);

  /* ================= OUTSIDE CLICK ================= */

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  const pageTitle =
    PAGE_TITLES[location.pathname] ||
    "Dashboard";

  const displayName = profile?.firstName
    ? `${profile.firstName} ${
        profile.lastName || ""
      }`.trim()
    : "System Administrator";


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
  
    

  return (

    <header
      className="
        sticky
        top-0
        z-30
        h-16
        bg-white
        border-b
        border-slate-200
        shadow-sm
        flex
        items-center
        justify-between
        px-4
        lg:px-6
      "
    >

      {/* PAGE TITLE */}

      <h1
        className="
          text-slate-800
          font-semibold
          text-base
        "
      >
        {pageTitle}
      </h1>

      {/* USER DROPDOWN */}

      <div
        className="relative"
        ref={dropdownRef}
      >

        <button
          onClick={() =>
            setOpen((value) => !value)
          }
          className="
            flex
            items-center
            gap-2
            text-slate-700
            font-medium
            text-sm
            hover:text-slate-900
            transition-colors
            duration-200
          "
        >

          System Administrator

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
              className="
                absolute
                right-0
                mt-2
                w-48
                rounded-xl
                bg-white
                border
                border-slate-200
                shadow-lg
                overflow-hidden
                origin-top-right
              "
            >

              {/* PROFILE */}

              <button
                onClick={() => {

                  setOpen(false);

                  navigate(
                    "/admin/profile"
                  );

                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-2.5
                  px-4
                  py-2.5
                  text-sm
                  text-slate-700
                  hover:bg-slate-50
                  transition-colors
                  duration-150
                "
              >

                <UserCircle
                  size={16}
                  className="text-slate-400"
                />

                Profile

              </button>

              {/* NOTIFICATIONS */}

              <button
                onClick={() => {

                  setOpen(false);

                  navigate(
                    "/admin/notifications"
                  );

                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-2.5
                  px-4
                  py-2.5
                  text-sm
                  text-slate-700
                  hover:bg-slate-50
                  transition-colors
                  duration-150
                "
              >

                <Bell
                  size={16}
                  className="text-slate-400"
                />

                Notifications

              </button>

              <div
                className="
                  border-t
                  border-slate-100
                "
              />

              {/* LOGOUT */}

              <button
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-2.5
                  px-4
                  py-2.5
                  text-sm
                  text-red-500
                  hover:bg-red-50
                  transition-colors
                  duration-150
                "
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

