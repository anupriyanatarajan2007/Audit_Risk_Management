import { useState } from "react";
import {
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [openUser, setOpenUser] = useState(true);

  return (
    <aside className="w-72 h-full bg-slate-900 text-white shadow-2xl">

      {/* Sidebar Header */}
      <div className="px-6 py-5 border-b border-slate-700">
        <h2 className="text-lg font-bold tracking-wide">
          Admin Panel
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Audit & Risk Management
        </p>
      </div>

      {/* Menu */}
      <div className="p-4">

        <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">
          User Management
        </p>

        {/* Main Menu */}
        <button
          onClick={() => setOpenUser(!openUser)}
          className="
            w-full
            flex
            items-center
            justify-between
            px-4
            py-3
            rounded-xl
            bg-emerald-600
            hover:bg-emerald-700
            transition-all
            duration-300
            shadow-lg
          "
        >
          <div className="flex items-center gap-3">
            <Users size={20} />
            <span className="font-medium">
              User Management
            </span>
          </div>

          {openUser ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {/* Sub Menu */}
        {openUser && (
          <div className="mt-3 ml-3 space-y-2">
           

           <Link to="/admin/internal-auditor">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition">
              Internal Auditor
            </button>
            </Link>


            <Link to="/admin/audit-manager">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition">
              Audit Manager
            </button>
            </Link>


            <Link to="/admin/chief-audit-executive">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition">
              Chief Audit Executive
            </button>
            </Link>
            
            <Link to="/admin/risk-officer">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition">
              Risk Officer
            </button>
            </Link>

            <Link to="/admin/auditee">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition">
              Auditee
            </button>
            </Link>

            <Link to="/admin/compliance-officer">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition">
              Compliance Officer
            </button>
            </Link>

          </div>
        )}

      </div>

    </aside>
  );
}