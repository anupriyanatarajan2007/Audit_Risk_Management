import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiActivity,
  FiCheckCircle,
  FiGrid,
  FiLayers,
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiDownload,
  FiX,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

import KriService from "../../service/KriService";

import KriStatCard from "../../components/riskOfficer/kri/KriStatCard";

import {
  CategoryAreaChart,
  DepartmentBarChart,
  StatusPieChart,
  TrendLineChart,
} from "../../components/riskOfficer/kri/KriCharts";

import {
  DEPARTMENT,
  KRI_STATUS,
  RISK_CATEGORY,
} from "../../constants/KriEnums";

import KriTable from "../../components/riskOfficer/kri/KriTable";
import KriFormModal from "../../components/riskOfficer/kri/KriFormModal";
import KriDetailDrawer from "../../components/riskOfficer/kri/KriDetailDrawer";


export default function KriDashboard() {

  // ============================================================
  // STATE
  // ============================================================

  const [kris, setKris] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [now, setNow] = useState(new Date());

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [deptFilter, setDeptFilter] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingKri, setEditingKri] = useState(null);

  const [viewingKri, setViewingKri] = useState(null);


  // ============================================================
  // CLOCK
  // ============================================================

  useEffect(() => {

    const t = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(t);

  }, []);


  // ============================================================
  // FETCH KRIs
  // ============================================================

  const fetchKris = useCallback(async () => {

    setLoading(true);

    setError(null);

    try {

      const response = await KriService.getAllKris();

      console.log("========================================");
      console.log("KRI API RESPONSE:");
      console.log(response);
      console.log("========================================");


      /*
       * Support:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       *
       * OR
       *
       * [...]
       */

      const data = response?.data ?? response;


      const normalizedData = Array.isArray(data)
        ? data
        : [];


      console.log(
        "NORMALIZED KRI DATA:",
        normalizedData
      );


      setKris(normalizedData);

    } catch (err) {

      console.error(
        "Failed to load KRIs:",
        err
      );

      setError(
        "Failed to load KRIs. Check your connection and try again."
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    fetchKris();

  }, [fetchKris]);


  // ============================================================
  // GET RISK ID FROM KRI
  // ============================================================
  /*
   * Backend may return:
   *
   * riskId: "RISK-001"
   *
   * OR
   *
   * risk: {
   *    riskId: "RISK-001"
   * }
   *
   * OR
   *
   * risk: {
   *    id: 1
   * }
   *
   * So we handle all common structures.
   */

  const getKriRiskId = useCallback((kri) => {

    if (!kri) {
      return null;
    }

    return (
      kri.riskId ??
      kri.risk?.riskId ??
      kri.risk?.id ??
      kri.associatedRiskId ??
      kri.associatedRisk?.riskId ??
      null
    );

  }, []);


  // ============================================================
  // RISKS THAT ALREADY HAVE KRI
  // ============================================================
  /*
   * IMPORTANT:
   *
   * If a risk already has a KRI,
   * it cannot be selected for creating another KRI.
   */

  const assignedRiskIds = useMemo(() => {

    const ids = new Set();

    kris.forEach((kri) => {

      const riskId = getKriRiskId(kri);

      if (riskId !== null && riskId !== undefined) {

        ids.add(String(riskId));

      }

    });

    return ids;

  }, [kris, getKriRiskId]);


  // ============================================================
  // DEBUG EXISTING KRI RISKS
  // ============================================================

  useEffect(() => {

    console.log(
      "========================================"
    );

    console.log(
      "RISKS ALREADY HAVING KRI:"
    );

    console.log(
      Array.from(assignedRiskIds)
    );

    console.log(
      "TOTAL RISKS HAVING KRI:",
      assignedRiskIds.size
    );

    console.log(
      "========================================"
    );

  }, [assignedRiskIds]);


  // ============================================================
  // STATUS CHANGE
  // ============================================================

  const handleStatusChanged = useCallback(async () => {

    await fetchKris();

    setViewingKri((prev) => {

      if (!prev) {
        return prev;
      }

      const updated = kris.find(
        (k) => k.id === prev.id
      );

      return updated
        ? { ...updated }
        : prev;

    });

  }, [fetchKris, kris]);


  // ============================================================
  // FILTERED KRIS
  // ============================================================

  const filtered = useMemo(() => {

    return kris.filter((k) => {

      const matchesSearch =
        !search ||
        k.kriName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        k.kriId
          ?.toLowerCase()
          .includes(search.toLowerCase());


      const matchesStatus =
        !statusFilter ||
        k.status === statusFilter;


      const matchesDept =
        !deptFilter ||
        k.department === deptFilter;


      const matchesCategory =
        !categoryFilter ||
        k.riskCategory === categoryFilter;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesDept &&
        matchesCategory
      );

    });

  }, [
    kris,
    search,
    statusFilter,
    deptFilter,
    categoryFilter,
  ]);


  // ============================================================
  // STATISTICS
  // ============================================================

  const stats = useMemo(() => ({

    total: kris.length,

    critical: kris.filter(
      (k) => k.status === "RED"
    ).length,

    warning: kris.filter(
      (k) => k.status === "AMBER"
    ).length,

    healthy: kris.filter(
      (k) => k.status === "GREEN"
    ).length,

    departments: new Set(
      kris
        .map((k) => k.department)
        .filter(Boolean)
    ).size,

  }), [kris]);


  // ============================================================
  // ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =
    statusFilter ||
    deptFilter ||
    categoryFilter ||
    search;


  const clearFilters = () => {

    setSearch("");

    setStatusFilter("");

    setDeptFilter("");

    setCategoryFilter("");

  };


  // ============================================================
  // OPEN CREATE KRI MODAL
  // ============================================================

  const handleCreateKri = () => {

    /*
     * We allow opening the modal.
     *
     * The modal receives assignedRiskIds and will prevent
     * already-used risks from being selected.
     */

    setEditingKri(null);

    setModalOpen(true);

  };


  // ============================================================
  // EDIT KRI
  // ============================================================

  const handleEditKri = (kri) => {

    if (!kri?.id) {

      toast.error(
        "Invalid KRI. KRI ID is missing."
      );

      return;

    }

    setEditingKri(kri);

    setModalOpen(true);

  };


  // ============================================================
  // VIEW KRI
  // ============================================================

  const handleViewKri = (kri) => {

    if (!kri?.id) {

      console.warn(
        "Cannot view KRI without ID:",
        kri
      );

      toast.error(
        "Invalid KRI ID"
      );

      return;

    }

    setViewingKri(kri);

  };


  // ============================================================
  // DELETE KRI
  // ============================================================

  const handleDelete = async (id) => {
    console.log("=================================");
    console.log("DELETE KRI - RECEIVED DATABASE ID:", id);
    console.log("DELETE KRI - ID TYPE:", typeof id);
    console.log("=================================");
  
    if (!id) {
      console.error("DELETE KRI - INVALID ID:", id);
      toast.error("Invalid KRI ID");
      return;
    }
  
    try {
      console.log("DELETE KRI - SENDING ID:", id);
  
      await KriService.deleteKri(id);
  
      toast.success("KRI deleted successfully");
  
      // Reload KRI list
      await loadKris();
  
    } catch (error) {
      console.error("DELETE KRI ERROR:", error);
  
      console.error(
        "DELETE KRI RESPONSE:",
        error?.response?.data
      );
  
      toast.error(
        error?.response?.data?.message ||
        "Failed to delete KRI"
      );
    }
  };


  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCsv = () => {

    if (filtered.length === 0) {

      toast.error(
        "Nothing to export"
      );

      return;

    }


    const headers = [
      "kriId",
      "kriName",
      "riskId",
      "department",
      "riskCategory",
      "status",
      "currentValue",
      "unit",
    ];


    const rows = filtered.map((k) => {

      return headers
        .map((h) => {

          if (h === "riskId") {

            return `"${getKriRiskId(k) ?? ""}"`;

          }

          return `"${k[h] ?? ""}"`;

        })
        .join(",");

    });


    const csv = [
      headers.join(","),
      ...rows,
    ].join("\n");


    const blob = new Blob(
      [csv],
      {
        type: "text/csv",
      }
    );


    const url =
      URL.createObjectURL(blob);


    const a =
      document.createElement("a");


    a.href = url;

    a.download =
      `kri_export_${Date.now()}.csv`;


    a.click();


    URL.revokeObjectURL(url);


    toast.success(
      "Exported to CSV"
    );

  };


  // ============================================================
  // READABLE ENUM
  // ============================================================

  const readableEnum = (value) => {

    if (!value) {
      return "-";
    }


    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      );

  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 p-6">

      <Toaster position="top-right" />


      {/* ======================================================
          HERO
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="mb-6 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl"
      >

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-xs font-medium text-indigo-400">
              Audit &amp; Risk Management / KRI Monitoring
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Key Risk Indicators
            </h1>

            <p className="text-sm text-slate-400">

              {now.toLocaleDateString(
                "en-IN",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}

              {" · "}

              {now.toLocaleTimeString("en-IN")}

            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              onClick={fetchKris}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >

              <FiRefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>


            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >

              <FiDownload size={14} />

              Export

            </button>


            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              onClick={handleCreateKri}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
            >

              <FiPlus size={14} />

              New KRI

            </motion.button>

          </div>

        </div>

      </motion.div>


      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <KriStatCard
          index={0}
          icon={FiGrid}
          label="Total KRIs"
          value={stats.total}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          loading={loading}
        />

        <KriStatCard
          index={1}
          icon={FiCheckCircle}
          label="Healthy"
          value={stats.healthy}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          loading={loading}
        />

        <KriStatCard
          index={2}
          icon={FiActivity}
          label="Warning"
          value={stats.warning}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          loading={loading}
        />

        <KriStatCard
          index={3}
          icon={FiAlertTriangle}
          label="Critical"
          value={stats.critical}
          gradient="bg-gradient-to-br from-rose-500 to-rose-600"
          glow={stats.critical > 0}
          loading={loading}
        />

        <KriStatCard
          index={4}
          icon={FiLayers}
          label="Departments"
          value={stats.departments}
          gradient="bg-gradient-to-br from-slate-600 to-slate-700"
          loading={loading}
        />

      </div>


      {/* ======================================================
          CHARTS
      ====================================================== */}

      {!loading && kris.length > 0 && (

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">

          <StatusPieChart kris={kris} />

          <DepartmentBarChart kris={kris} />

          <CategoryAreaChart kris={kris} />

          <TrendLineChart kris={kris} />

        </div>

      )}


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="mb-4 flex flex-col gap-3">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          <div className="relative flex-1">

            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={15}
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by KRI name or ID..."
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-3 text-sm outline-none backdrop-blur focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />

          </div>


          <button
            onClick={() =>
              setShowFilters((s) => !s)
            }
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-600 backdrop-blur hover:bg-slate-50"
          >

            {showFilters
              ? "Hide Filters"
              : "Advanced Filters"}

          </button>


          {hasActiveFilters && (

            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
            >

              <FiX size={14} />

              Clear

            </button>

          )}

        </div>


        {/* ====================================================
            ADVANCED FILTERS
        ==================================================== */}

        <motion.div
          initial={false}
          animate={{
            height: showFilters
              ? "auto"
              : 0,

            opacity: showFilters
              ? 1
              : 0,
          }}
          className="overflow-hidden"
        >

          <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 backdrop-blur">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >

              <option value="">
                All Statuses
              </option>

              {KRI_STATUS.map((s) => (

                <option
                  key={s}
                  value={s}
                >
                  {readableEnum(s)}
                </option>

              ))}

            </select>


            <select
              value={deptFilter}
              onChange={(e) =>
                setDeptFilter(e.target.value)
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >

              <option value="">
                All Departments
              </option>

              {DEPARTMENT.map((d) => (

                <option
                  key={d}
                  value={d}
                >
                  {readableEnum(d)}
                </option>

              ))}

            </select>


            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >

              <option value="">
                All Categories
              </option>

              {RISK_CATEGORY.map((c) => (

                <option
                  key={c}
                  value={c}
                >
                  {readableEnum(c)}
                </option>

              ))}

            </select>

          </div>

        </motion.div>

      </div>


      {/* ======================================================
          TABLE
      ====================================================== */}

      {error ? (

        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-600">

          {error}

          <button
            onClick={fetchKris}
            className="ml-3 font-medium underline"
          >
            Retry
          </button>

        </div>

      ) : (

        <KriTable
          kris={filtered}
          loading={loading}
          searchTerm={search}

          onView={handleViewKri}

          onEdit={handleEditKri}

          onDelete={handleDelete}

          onStatusChanged={fetchKris}
        />

      )}


      {/* ======================================================
          KRI FORM MODAL
      ====================================================== */}

      <KriFormModal
        isOpen={modalOpen}

        onClose={() =>
          setModalOpen(false)
        }

        editingKri={editingKri}

        onSaved={async () => {

          setModalOpen(false);

          await fetchKris();

        }}

        /*
         * IMPORTANT:
         *
         * These risk IDs already have a KRI.
         *
         * KriFormModal should prevent selecting these
         * risks while creating a new KRI.
         *
         * While editing, the current KRI's own risk must
         * remain selectable.
         */

        assignedRiskIds={assignedRiskIds}

      />


      {/* ======================================================
          DETAIL DRAWER
      ====================================================== */}

      <KriDetailDrawer
        kri={viewingKri}

        onClose={() =>
          setViewingKri(null)
        }

        onStatusChanged={
          handleStatusChanged
        }

      />

    </div>

  );

}