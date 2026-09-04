
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { getAllDepartments } from "../../service/departmentService";

// Backend Enum Values
const STATUSES = [
  { label: "New", value: "NEW" },
  { label: "Analyzed", value: "ANALYZED" },
  { label: "Approved", value: "APPROVED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Mitigated", value: "MITIGATED" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Reopened", value: "REOPENED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
];

const LEVELS = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
];

const CATEGORIES = [
  { label: "Financial", value: "FINANCIAL" },
  { label: "Operational", value: "OPERATIONAL" },
  { label: "Compliance", value: "COMPLIANCE" },
  { label: "Strategic", value: "STRATEGIC" },
  {
    label: "Information Technology",
    value: "INFORMATION_TECHNOLOGY",
  },
  {
    label: "Cyber Security",
    value: "CYBER_SECURITY",
  },
  { label: "Legal", value: "LEGAL" },
  { label: "Reputational", value: "REPUTATIONAL" },
];

export default function RiskFilters({
  filters,
  onFilterChange,
  onSearch,
  searchValue,
  onSearchChange,
}) {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // =========================================================
  // LOAD DEPARTMENTS FROM BACKEND
  // =========================================================

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const response = await getAllDepartments();

        console.log(
          "========== FILTER DEPARTMENT RESPONSE =========="
        );
        console.log(response);

        let departmentList = [];

        if (Array.isArray(response)) {
          departmentList = response;
        } else if (Array.isArray(response?.data)) {
          departmentList = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          departmentList = response.data.data;
        }

        console.log(
          "FILTER DEPARTMENT LIST:",
          departmentList
        );

        setDepartments(departmentList);
      } catch (error) {
        console.error(
          "Failed to load departments for filter:",
          error
        );

        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-3 border-b border-slate-200 bg-white px-5 py-4">

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && onSearch()
          }
          placeholder="Search risks by title..."
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="flex flex-wrap gap-2">

        {/* STATUS */}

        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange("status", e.target.value)
          }
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
        >
          <option value="">Status : All</option>

          {STATUSES.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>

        {/* LEVEL */}

        <select
          value={filters.level}
          onChange={(e) =>
            onFilterChange("level", e.target.value)
          }
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
        >
          <option value="">Level : All</option>

          {LEVELS.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>

        {/* CATEGORY */}

        <select
          value={filters.category}
          onChange={(e) =>
            onFilterChange("category", e.target.value)
          }
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
        >
          <option value="">Category : All</option>

          {CATEGORIES.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>

        {/* =================================================
            DEPARTMENT - BACKEND LOADED
        ================================================= */}

        <select
          value={filters.department}
          onChange={(e) =>
            onFilterChange("department", e.target.value)
          }
          disabled={loadingDepartments}
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">
            {loadingDepartments
              ? "Loading departments..."
              : "Department : All"}
          </option>

          {departments.map((department) => (
            <option
              key={department.id}
              value={department.id}
            >
              {department.name}
            </option>
          ))}
        </select>

        {/* CLEAR FILTERS */}

        {activeCount > 0 && (
          <button
            onClick={() => onFilterChange("clear")}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
          >
            <X size={13} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
