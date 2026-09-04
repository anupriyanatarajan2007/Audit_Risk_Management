import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiRefreshCw, FiDownload } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

import ReportStatsCards from "../../components/riskOfficer/report/ReportStatsCards";
import ReportFilters from "../../components/riskOfficer/report/ReportFilters";
import ReportTable from "../../components/riskOfficer/report/ReportTable";
import ReportFormModal from "../../components/riskOfficer/report/ReportFormModal";
import ReportViewDrawer from "../../components/riskOfficer/report/ReportViewDrawer";

import ReportService from "../../service/ReportService";
import ReportGeneratorService from "../../service/ReportGeneratorService";
import RiskService from "../../service/RiskService";
import KriService from "../../service/KriService";
import MitigationService from "../../service/MitigationService";

export default function ReportsDashboard() {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [risks, setRisks] = useState([]);
  const [kris, setKris] = useState([]);
  const [mitigations, setMitigations] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  const [actioningId, setActioningId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ReportService.getAllReports();

      console.log("Reports API:", res.data);

      setReports(
        Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load reports. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [riskRes, kriRes, mitigationRes] = await Promise.all([
        RiskService.getAllRisks(),
        KriService.getAllKris(),
        MitigationService.getAllMitigations(),
      ]);

      setRisks(
        Array.isArray(riskRes.data?.data)
          ? riskRes.data.data
          : Array.isArray(riskRes.data)
          ? riskRes.data
          : []
      );

      setKris(
        Array.isArray(kriRes.data?.data)
          ? kriRes.data.data
          : Array.isArray(kriRes.data)
          ? kriRes.data
          : []
      );

      setMitigations(
        Array.isArray(mitigationRes)
          ? mitigationRes
          : Array.isArray(mitigationRes.data?.data)
          ? mitigationRes.data.data
          : Array.isArray(mitigationRes.data)
          ? mitigationRes.data
          : []
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchDropdownData();
  }, [fetchReports]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        !search ||
        r.reportTitle?.toLowerCase().includes(search.toLowerCase()) ||
        r.reportId?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        !typeFilter || r.reportType === typeFilter;

      const matchesStatus =
        !statusFilter || r.status === statusFilter;

      const matchesCreatedBy =
        !createdBy ||
        r.generatedByName?.toLowerCase().includes(createdBy.toLowerCase());

      const created = r.createdAt ? new Date(r.createdAt) : null;

      const matchesStart =
        !dateStart || (created && created >= new Date(dateStart));

      const matchesEnd =
        !dateEnd ||
        (created && created <= new Date(dateEnd + "T23:59:59"));

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesCreatedBy &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [
    reports,
    search,
    typeFilter,
    statusFilter,
    createdBy,
    dateStart,
    dateEnd,
  ]);

  const stats = useMemo(
    () => ({
      total: reports.length,
      draft: reports.filter((r) => r.status === "DRAFT").length,
      submitted: reports.filter((r) => r.status === "SUBMITTED").length,
      approved: reports.filter((r) => r.status === "APPROVED").length,
      rejected: reports.filter((r) => r.status === "REJECTED").length,
    }),
    [reports]
  );

  const hasActiveFilters =
    search ||
    typeFilter ||
    statusFilter ||
    createdBy ||
    dateStart ||
    dateEnd;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setCreatedBy("");
    setDateStart("");
    setDateEnd("");
  };

  const handleDelete = async (report) => {
    const result = await Swal.fire({
      title: `Delete "${report.reportTitle}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await ReportService.deleteReport(report.id);
      toast.success("Report deleted successfully");
      fetchReports();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete report"
      );
    }
  };

  const triggerBlobDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);
  };

  const withAction = async (
    report,
    action,
    successMessage,
    options = {}
  ) => {
    setActioningId(report.id);

    try {
      await action();

      toast.success(successMessage);

      if (options.closeDrawer) {
        setViewingReport(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setActioningId(null);
    }
  };

  const handleDownloadPdf = (report) =>
    withAction(
      report,
      async () => {
        const res =
          await ReportGeneratorService.downloadPdf(
            report.reportId
          );

        triggerBlobDownload(
          res.data,
          `${report.reportId}.pdf`
        );
      },
      "PDF downloaded"
    );

  const handleDownloadWord = (report) =>
    withAction(
      report,
      async () => {
        const res =
          await ReportGeneratorService.downloadWord(
            report.reportId
          );

        triggerBlobDownload(
          res.data,
          `${report.reportId}.docx`
        );
      },
      "Word downloaded"
    );

  const handleSavePdf = (report) =>
    withAction(
      report,
      () =>
        ReportGeneratorService.savePdf(report.reportId),
      "PDF saved"
    );

  const handleSaveWord = (report) =>
    withAction(
      report,
      () =>
        ReportGeneratorService.saveWord(report.reportId),
      "Word document saved"
    );

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to export");
      return;
    }

    const headers = [
      "reportId",
      "reportTitle",
      "reportType",
      "status",
      "generatedByName",
      "createdAt",
    ];

    const rows = filtered.map((r) =>
      headers
        .map((h) => `"${r[h] ?? ""}"`)
        .join(",")
    );

    const csv = [
      headers.join(","),
      ...rows,
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url =
      window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `reports_${Date.now()}.csv`;

    a.click();

    window.URL.revokeObjectURL(url);

    toast.success("CSV exported");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-xs font-medium text-indigo-500">
            Audit & Risk Management / Reports
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-800">
            Report Management
          </h1>

          <p className="text-sm text-slate-500">
            Generate, manage and download audit reports
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <FiRefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <FiDownload size={15} />
            Export CSV
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingReport(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700"
          >
            <FiPlus size={15} />
            Create Report
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <ReportStatsCards
        stats={stats}
        loading={loading}
      />

      {/* Filters */}
      <ReportFilters
        search={search}
        onSearch={setSearch}
        typeFilter={typeFilter}
        onType={setTypeFilter}
        statusFilter={statusFilter}
        onStatus={setStatusFilter}
        createdBy={createdBy}
        onCreatedBy={setCreatedBy}
        dateStart={dateStart}
        onDateStart={setDateStart}
        dateEnd={dateEnd}
        onDateEnd={setDateEnd}
        showFilters={showFilters}
        onToggleFilters={() =>
          setShowFilters((prev) => !prev)
        }
        hasActive={hasActiveFilters}
        onClear={clearFilters}
      />

      {/* Error */}
      {error ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
          {error}

          <button
            onClick={fetchReports}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <ReportTable
          reports={filtered}
          loading={loading}
          actioningId={actioningId}
          onView={setViewingReport}
          onEdit={(report) => {
            setEditingReport(report);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onDownloadPdf={handleDownloadPdf}
          onDownloadWord={handleDownloadWord}
          onSavePdf={handleSavePdf}
          onSaveWord={handleSaveWord}
        />
      )}

      {/* Create / Edit Modal */}
      <ReportFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReport(null);
        }}
        editingReport={editingReport}
        onSaved={() => {
          fetchReports();
          setModalOpen(false);
        }}
        risks={risks}
        kris={kris}
        mitigations={mitigations}
      />

      {/* View Drawer */}
      <ReportViewDrawer
        report={viewingReport}
        onClose={() => setViewingReport(null)}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        onSavePdf={handleSavePdf}
        onSaveWord={handleSaveWord}
        actionLoading={
          actioningId === viewingReport?.id
        }
      />
    </div>
  );
}