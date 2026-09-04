import { useState } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const formattedRole = role
    ?.toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const handleProfile = () => {
    switch (role) {
      case "SYSTEM_ADMINISTRATOR":
        navigate("/admin/profile");
        break;

      case "AUDIT_MANAGER":
        navigate("/audit-manager/profile");
        break;

      case "INTERNAL_AUDITOR":
        navigate("/internal-auditor/profile");
        break;

      case "RISK_OFFICER":
        navigate("/risk-officer/profile");
        break;

      case "AUDITEE":
        navigate("/auditee/profile");
        break;

      case "COMPLIANCE_OFFICER":
        navigate("/compliance-officer/profile");
        break;

      case "CHIEF_AUDIT_EXECUTIVE":
        navigate("/chief-audit-executive/profile");
        break;

      default:
        navigate("/");
    }

    setOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center px-8">
      {/* Push everything to the right */}
      <div className="relative ml-auto">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <span className="font-semibold text-gray-700">
            {formattedRole}
          </span>

          <ChevronDown
            size={18}
            className={`transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border shadow-lg z-50">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-gray-700"
            >
              <User size={18} />
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}