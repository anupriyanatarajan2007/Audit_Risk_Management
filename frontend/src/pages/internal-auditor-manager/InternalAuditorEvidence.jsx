import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  getEvidenceByAudit,
  approveEvidence,
  rejectEvidence,
} from "../../service/evidenceService";

import { getMyAssignedAudits } from "../../service/auditService";

/* ============================================================
   STATUS STYLES
============================================================ */

const STATUS_STYLES = {
  PENDING:
    "bg-amber-50 text-amber-700 border border-amber-200",

  APPROVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",

  REJECTED:
    "bg-red-50 text-red-700 border border-red-200",
};

/* ============================================================
   COMPONENT
============================================================ */

const InternalAuditorEvidence = () => {
  const [evidence, setEvidence] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const [error, setError] = useState("");

  /* ==========================================================
     GET STATUS
  ========================================================== */

  const getStatus = (item) => {
    return (
      item?.status ||
      item?.evidenceStatus ||
      item?.approvalStatus ||
      "PENDING"
    ).toString().toUpperCase();
  };

  /* ==========================================================
     GET FILE NAME
  ========================================================== */

  const getFileName = (item) => {
    return (
      item?.fileName ||
      item?.originalFileName ||
      item?.name ||
      "Evidence File"
    );
  };

  /* ==========================================================
     GET AUDIT ID
  ========================================================== */

  const getAuditId = (item) => {
    return (
      item?.auditId ||
      item?.audit?.auditId ||
      item?.audit?.id ||
      item?.audit?.referenceId ||
      "-"
    );
  };

  /* ==========================================================
     GET AUDIT TITLE
  ========================================================== */

  const getAuditTitle = (item) => {
    return (
      item?.auditTitle ||
      item?.audit?.title ||
      item?.audit?.auditTitle ||
      "Audit"
    );
  };

  /* ==========================================================
     GET DESCRIPTION
  ========================================================== */

  const getDescription = (item) => {
    return (
      item?.description ||
      item?.remarks ||
      "No description provided"
    );
  };

  /* ==========================================================
     GET UPLOADED USER
  ========================================================== */

  const getUploadedBy = (item) => {
    return (
      item?.userName ||
      item?.uploadedByName ||
      item?.uploadedBy ||
      item?.user?.name ||
      item?.user?.email ||
      item?.auditeeName ||
      "Auditee"
    );
  };

  /* ==========================================================
     GET EVIDENCE URL
  ========================================================== */

  const getEvidenceUrl = (item) => {
    const fileUrl =
      item?.fileUrl ||
      item?.evidenceUrl ||
      item?.downloadUrl ||
      item?.url ||
      item?.filePath ||
      item?.file ||
      item?.documentUrl;

    if (!fileUrl) {
      return null;
    }

    if (
      fileUrl.startsWith("http://") ||
      fileUrl.startsWith("https://")
    ) {
      return fileUrl;
    }

    return `http://localhost:8080${
      fileUrl.startsWith("/") ? "" : "/"
    }${fileUrl}`;
  };

  /* ==========================================================
     NORMALIZE AUDIT RESPONSE
  ========================================================== */

  const normalizeAudits = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  };

  /* ==========================================================
     NORMALIZE EVIDENCE RESPONSE
  ========================================================== */

  const normalizeEvidence = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data?.content)) {
      return response.data.content;
    }

    return [];
  };

  /* ==========================================================
     LOAD ALL EVIDENCE
     
     IMPORTANT:
     
     DO NOT USE:
     
     getPendingEvidence()
     
     because that returns only pending records.
     
     Instead:
     
     1. Get audits assigned to current auditor
     2. Get evidence for every assigned audit
     3. Combine everything
     
     Therefore:
     
     PENDING + APPROVED + REJECTED
     
     will be displayed.
  ========================================================== */

  const loadEvidence = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /* ======================================================
         STEP 1
         GET AUDITS ASSIGNED TO CURRENT INTERNAL AUDITOR
      ====================================================== */

      const auditsResponse = await getMyAssignedAudits();

      const audits = normalizeAudits(auditsResponse);

      console.log(
        "ASSIGNED AUDITS FOR EVIDENCE:",
        audits
      );

      /* ======================================================
         NO ASSIGNED AUDITS
      ====================================================== */

      if (!audits.length) {
        setEvidence([]);
        return;
      }

      /* ======================================================
         STEP 2
         GET EVIDENCE FOR EACH AUDIT
         
         Promise.all allows all audit evidence to load together.
      ====================================================== */

      const evidenceResponses = await Promise.all(
        audits.map(async (audit) => {
          const auditId =
            audit?.id ||
            audit?.auditId;

          if (!auditId) {
            return [];
          }

          try {
            const response =
              await getEvidenceByAudit(auditId);

            const auditEvidence =
              normalizeEvidence(response);

            /*
             * Attach audit information locally.
             * This does NOT change backend data.
             */

            return auditEvidence.map((item) => ({
              ...item,

              /*
               * Keep audit ID available for UI/filter.
               */

              auditId:
                item?.auditId ||
                audit?.id ||
                audit?.auditId,

              /*
               * Keep audit title locally if evidence
               * doesn't contain it.
               */

              auditTitle:
                item?.auditTitle ||
                audit?.title ||
                audit?.auditTitle ||
                "Audit",
            }));
          } catch (auditError) {
            console.error(
              `Failed to load evidence for audit ${auditId}:`,
              auditError
            );

            /*
             * One audit failure should NOT prevent
             * other audit evidence from loading.
             */

            return [];
          }
        })
      );

      /* ======================================================
         STEP 3
         COMBINE ALL EVIDENCE
      ====================================================== */

      const allEvidence =
        evidenceResponses.flat();

      console.log(
        "ALL EVIDENCE FOR INTERNAL AUDITOR:",
        allEvidence
      );

      /* ======================================================
         STEP 4
         REMOVE DUPLICATES
      ====================================================== */

      const evidenceMap = new Map();

      allEvidence.forEach((item, index) => {
        const id =
          item?.id ||
          item?.evidenceId ||
          `${item?.auditId}-${index}`;

        evidenceMap.set(String(id), item);
      });

      const uniqueEvidence =
        Array.from(evidenceMap.values());

      /* ======================================================
         STEP 5
         SET FULL EVIDENCE LIST
      ====================================================== */

      setEvidence(uniqueEvidence);
    } catch (err) {
      console.error(
        "Failed to load Internal Auditor evidence:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load auditee evidence."
      );

      /*
       * Do not clear previous evidence if refresh fails.
      */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadEvidence();
  }, []);

  /* ==========================================================
     APPROVE EVIDENCE
     
     ONLY PENDING evidence gets Approve button.
     
     After successful backend call:
     
     PENDING → APPROVED
     
     We update frontend locally.
  ========================================================== */

  const handleApprove = async (id) => {
    if (!id) {
      alert("Evidence ID is missing.");
      return;
    }

    try {
      const response =
        await approveEvidence(id);

      console.log(
        "APPROVE RESPONSE:",
        response
      );

      const updatedEvidence =
        response?.data || response;

      /* ======================================================
         UPDATE TABLE
      ====================================================== */

      setEvidence((previous) =>
        previous.map((item) => {
          const itemId =
            item?.id ||
            item?.evidenceId;

          if (
            String(itemId) !== String(id)
          ) {
            return item;
          }

          return {
            ...item,

            /*
             * Keep backend response if available.
             */

            ...(typeof updatedEvidence ===
            "object"
              ? updatedEvidence
              : {}),

            /*
             * Force frontend status.
             */

            status:
              updatedEvidence?.status ||
              updatedEvidence?.evidenceStatus ||
              "APPROVED",

            evidenceStatus:
              updatedEvidence?.evidenceStatus ||
              updatedEvidence?.status ||
              "APPROVED",
          };
        })
      );

      /* ======================================================
         UPDATE OPEN MODAL
      ====================================================== */

      setSelectedEvidence((previous) => {
        if (!previous) {
          return null;
        }

        const previousId =
          previous?.id ||
          previous?.evidenceId;

        if (
          String(previousId) !== String(id)
        ) {
          return previous;
        }

        return {
          ...previous,

          ...(typeof updatedEvidence ===
          "object"
            ? updatedEvidence
            : {}),

          status:
            updatedEvidence?.status ||
            updatedEvidence?.evidenceStatus ||
            "APPROVED",

          evidenceStatus:
            updatedEvidence?.evidenceStatus ||
            updatedEvidence?.status ||
            "APPROVED",
        };
      });
    } catch (err) {
      console.error(
        "Approve evidence failed:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to approve evidence."
      );
    }
  };

  /* ==========================================================
     REJECT EVIDENCE
     
     ONLY PENDING evidence gets Reject button.
     
     PENDING → REJECTED
  ========================================================== */

  const handleReject = async (id) => {
    if (!id) {
      alert("Evidence ID is missing.");
      return;
    }

    try {
      const response =
        await rejectEvidence(id);

      console.log(
        "REJECT RESPONSE:",
        response
      );

      const updatedEvidence =
        response?.data || response;

      /* ======================================================
         UPDATE TABLE
      ====================================================== */

      setEvidence((previous) =>
        previous.map((item) => {
          const itemId =
            item?.id ||
            item?.evidenceId;

          if (
            String(itemId) !== String(id)
          ) {
            return item;
          }

          return {
            ...item,

            ...(typeof updatedEvidence ===
            "object"
              ? updatedEvidence
              : {}),

            status:
              updatedEvidence?.status ||
              updatedEvidence?.evidenceStatus ||
              "REJECTED",

            evidenceStatus:
              updatedEvidence?.evidenceStatus ||
              updatedEvidence?.status ||
              "REJECTED",
          };
        })
      );

      /* ======================================================
         UPDATE MODAL
      ====================================================== */

      setSelectedEvidence((previous) => {
        if (!previous) {
          return null;
        }

        const previousId =
          previous?.id ||
          previous?.evidenceId;

        if (
          String(previousId) !== String(id)
        ) {
          return previous;
        }

        return {
          ...previous,

          ...(typeof updatedEvidence ===
          "object"
            ? updatedEvidence
            : {}),

          status:
            updatedEvidence?.status ||
            updatedEvidence?.evidenceStatus ||
            "REJECTED",

          evidenceStatus:
            updatedEvidence?.evidenceStatus ||
            updatedEvidence?.status ||
            "REJECTED",
        };
      });
    } catch (err) {
      console.error(
        "Reject evidence failed:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to reject evidence."
      );
    }
  };

  /* ==========================================================
     FILTER EVIDENCE
     
     DEFAULT:
     
     ALL
     
     So first load shows:
     
     APPROVED
     PENDING
     REJECTED
  ========================================================== */

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const status = getStatus(item);

      const fileName =
        getFileName(item)
          .toLowerCase();

      const description =
        getDescription(item)
          .toLowerCase();

      const auditId =
        String(getAuditId(item))
          .toLowerCase();

      const auditTitle =
        String(getAuditTitle(item))
          .toLowerCase();

      const uploadedBy =
        getUploadedBy(item)
          .toLowerCase();

      const searchValue =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        fileName.includes(searchValue) ||
        description.includes(searchValue) ||
        auditId.includes(searchValue) ||
        auditTitle.includes(searchValue) ||
        uploadedBy.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    evidence,
    search,
    statusFilter,
  ]);

  /* ==========================================================
     COUNTS
  ========================================================== */

  const totalEvidence =
    evidence.length;

  const pendingEvidence =
    evidence.filter(
      (item) =>
        getStatus(item) === "PENDING"
    ).length;

  const approvedEvidence =
    evidence.filter(
      (item) =>
        getStatus(item) === "APPROVED"
    ).length;

  const rejectedEvidence =
    evidence.filter(
      (item) =>
        getStatus(item) === "REJECTED"
    ).length;

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Auditee Evidence
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Review and verify evidence submitted by auditees
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={() =>
            loadEvidence(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </motion.div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={FileText}
          label="Total Evidence"
          value={totalEvidence}
          iconClass="bg-teal-50 text-teal-600"
        />

        <StatCard
          icon={Clock3}
          label="Pending Review"
          value={pendingEvidence}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={approvedEvidence}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          icon={XCircle}
          label="Rejected"
          value={rejectedEvidence}
          iconClass="bg-red-50 text-red-600"
        />

      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search evidence, audit ID, auditee..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10"
            />

          </div>

          <div className="flex items-center gap-2">

            <Filter className="h-4 w-4 text-slate-400" />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="REJECTED">
                Rejected
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="text-base font-semibold text-slate-900">
            Evidence Submitted by Auditees
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            All evidence from your assigned audits
          </p>

        </div>

        {loading ? (
          <EvidenceSkeleton />
        ) : filteredEvidence.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Evidence
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Audit
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted By
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredEvidence.map(
                  (item, index) => {

                    const status =
                      getStatus(item);

                    const evidenceId =
                      item?.id ||
                      item?.evidenceId;

                    const fileUrl =
                      getEvidenceUrl(item);

                    return (
                      <motion.tr
                        key={
                          evidenceId ||
                          index
                        }
                        initial={{
                          opacity: 0,
                          y: 6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.03,
                        }}
                        className="transition hover:bg-slate-50"
                      >

                        {/* FILE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                              <FileText className="h-5 w-5 text-teal-600" />
                            </div>

                            <div className="min-w-0">

                              <p className="max-w-[260px] truncate text-sm font-semibold text-slate-800">
                                {getFileName(item)}
                              </p>

                              <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-400">
                                {getDescription(item)}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* AUDIT */}

                        <td className="px-5 py-4">

                          <div>
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {getAuditId(item)}
                            </span>

                            <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                              {getAuditTitle(item)}
                            </p>
                          </div>

                        </td>

                        {/* USER */}

                        <td className="px-5 py-4">

                          <p className="text-sm text-slate-700">
                            {getUploadedBy(item)}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Auditee
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              STATUS_STYLES[
                                status
                              ] ||
                              STATUS_STYLES.PENDING
                            }`}
                          >

                            {status ===
                              "APPROVED" && (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}

                            {status ===
                              "REJECTED" && (
                              <XCircle className="h-3.5 w-3.5" />
                            )}

                            {status ===
                              "PENDING" && (
                              <Clock3 className="h-3.5 w-3.5" />
                            )}

                            {status}

                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            {/* VIEW */}

                            <button
                              onClick={() =>
                                setSelectedEvidence(
                                  item
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>

                            {/* OPEN FILE */}

                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-700 transition hover:bg-teal-100"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open
                              </a>
                            )}

                            {/* APPROVE / REJECT */}

                            {status ===
                              "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApprove(
                                      evidenceId
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Approve
                                </button>

                                <button
                                  onClick={() =>
                                    handleReject(
                                      evidenceId
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              </>
                            )}

                          </div>

                        </td>

                      </motion.tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      <AnimatePresence>

        {selectedEvidence && (
          <EvidenceModal
            evidence={
              selectedEvidence
            }
            onClose={() =>
              setSelectedEvidence(null)
            }
            onApprove={
              handleApprove
            }
            onReject={
              handleReject
            }
            getFileName={
              getFileName
            }
            getAuditId={
              getAuditId
            }
            getAuditTitle={
              getAuditTitle
            }
            getDescription={
              getDescription
            }
            getUploadedBy={
              getUploadedBy
            }
            getStatus={
              getStatus
            }
            getEvidenceUrl={
              getEvidenceUrl
            }
          />
        )}

      </AnimatePresence>

    </div>
  );
};

/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconClass,
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 10,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
  >

    <div className="flex items-center justify-between">

      <div>

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value}
        </p>

      </div>

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>

    </div>

  </motion.div>
);

/* ============================================================
   EVIDENCE MODAL
============================================================ */

const EvidenceModal = ({
  evidence,
  onClose,
  onApprove,
  onReject,
  getFileName,
  getAuditId,
  getAuditTitle,
  getDescription,
  getUploadedBy,
  getStatus,
  getEvidenceUrl,
}) => {
  const status =
    getStatus(evidence);

  const fileUrl =
    getEvidenceUrl(evidence);

  const evidenceId =
    evidence?.id ||
    evidence?.evidenceId;

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
        }}
        onClick={(e) =>
          e.stopPropagation()
        }
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <FileText className="h-5 w-5 text-teal-600" />
            </div>

            <div>

              <h3 className="text-base font-semibold text-slate-900">
                Evidence Details
              </h3>

              <p className="text-xs text-slate-400">
                Submitted by auditee
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* DETAILS */}

        <div className="space-y-4 p-5">

          <DetailRow
            label="File Name"
            value={getFileName(
              evidence
            )}
          />

          <DetailRow
            label="Audit ID"
            value={getAuditId(
              evidence
            )}
          />

          <DetailRow
            label="Audit"
            value={getAuditTitle(
              evidence
            )}
          />

          <DetailRow
            label="Submitted By"
            value={getUploadedBy(
              evidence
            )}
          />

          <DetailRow
            label="Status"
            value={
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  STATUS_STYLES[
                    status
                  ] ||
                  STATUS_STYLES.PENDING
                }`}
              >
                {status}
              </span>
            }
          />

          <div>

            <p className="mb-1 text-xs font-medium text-slate-400">
              Description
            </p>

            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {getDescription(
                evidence
              )}
            </div>

          </div>

          {/* EVIDENCE FILE */}

          {fileUrl ? (
            <div className="space-y-2">

              <p className="text-xs font-medium text-slate-400">
                Evidence File
              </p>

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
              >
                <Download className="h-4 w-4" />

                View / Download Evidence
              </a>

              <div className="break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                {fileUrl}
              </div>

            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              Evidence URL is not available in the backend response.
            </div>
          )}

        </div>

        {/* ACTIONS */}

        {status ===
          "PENDING" && (
          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">

            <button
              onClick={() =>
                onReject(
                  evidenceId
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>

            <button
              onClick={() =>
                onApprove(
                  evidenceId
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </button>

          </div>
        )}

        {/* APPROVED / REJECTED */}

        {status !==
          "PENDING" && (
          <div className="flex justify-end border-t border-slate-100 px-5 py-4">

            <button
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>

          </div>
        )}

      </motion.div>

    </motion.div>
  );
};

/* ============================================================
   DETAIL ROW
============================================================ */

const DetailRow = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">

    <span className="text-xs font-medium text-slate-400">
      {label}
    </span>

    <span className="text-right text-sm font-medium text-slate-700">
      {value}
    </span>

  </div>
);

/* ============================================================
   EMPTY STATE
============================================================ */

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">

    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
      <FileText className="h-7 w-7 text-teal-500" />
    </div>

    <h3 className="text-sm font-semibold text-slate-800">
      No evidence found
    </h3>

    <p className="mt-1 max-w-sm text-xs text-slate-400">
      There is currently no auditee evidence matching your filters.
    </p>

  </div>
);

/* ============================================================
   SKELETON
============================================================ */

const EvidenceSkeleton = () => (
  <div className="divide-y divide-slate-100">

    {[1, 2, 3, 4].map(
      (item) => (
        <div
          key={item}
          className="flex items-center justify-between px-5 py-5"
        >

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />

            <div>

              <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />

              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />

            </div>

          </div>

          <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />

        </div>
      )
    )}

  </div>
);

export default InternalAuditorEvidence;