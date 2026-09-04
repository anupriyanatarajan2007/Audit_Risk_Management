import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import auditeeAuditService from "../../service/auditeeAuditService";

import AuditeeAuditStats from "../../components/auditee/my_audits/AuditeeAuditStats";
import AuditeeAuditTable from "../../components/auditee/my_audits/AuditeeAuditTable";
import AuditeeAuditQuickView from "../../components/auditee/my_audits/AuditeeAuditQuickView";
import AuditeeAuditFilters from "../../components/auditee/my_audits/AuditeeAuditFilters";


// ============================================================
// CONSTANTS
// ============================================================

const PAGE_SIZE = 10;

const DEFAULT_FILTERS = {
  search: "",
  status: "All Status",
  type: "All Types",
  date: "All Dates",
};

const FINDINGS_API = "http://localhost:8080/api/findings";
const EVIDENCE_API = "http://localhost:8080/api/evidence";


// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  return localStorage.getItem("token");
};


// ============================================================
// AUTH CONFIG
// ============================================================

const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


// ============================================================
// SAFE ENTITY NAME
// ============================================================

const getEntityName = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return (
      value.name ??
      value.departmentName ??
      value.roleName ??
      value.title ??
      value.label ??
      value.code ??
      ""
    );
  }

  return String(value);
};


// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const d = new Date(value);

  if (isNaN(d.getTime())) {
    return String(value);
  }

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// ============================================================
// NUMBER HELPER
// ============================================================

const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};


// ============================================================
// NORMALIZE API LIST
//
// Supports:
//
// []
//
// { data: [] }
//
// { success: true, data: [] }
// ============================================================

const normalizeListResponse = (response) => {
  const body = response?.data;

  if (Array.isArray(body)) {
    return body;
  }

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  return [];
};


// ============================================================
// GET FINDINGS COUNT
// ============================================================

const getFindingsCount = (raw) => {
  if (
    raw?.findingsCount !== undefined &&
    raw?.findingsCount !== null
  ) {
    return toNumber(raw.findingsCount);
  }

  if (Array.isArray(raw?.findings)) {
    return raw.findings.length;
  }

  if (
    raw?.findings &&
    typeof raw.findings === "object"
  ) {
    return toNumber(
      raw.findings.total ??
        raw.findings.totalFindings ??
        raw.findings.count ??
        raw.findings.totalCount
    );
  }

  if (
    raw?.findingsSummary &&
    typeof raw.findingsSummary === "object"
  ) {
    return toNumber(
      raw.findingsSummary.total ??
        raw.findingsSummary.totalFindings ??
        raw.findingsSummary.count ??
        raw.findingsSummary.totalCount
    );
  }

  if (
    raw?.totalFindings !== undefined &&
    raw?.totalFindings !== null
  ) {
    return toNumber(raw.totalFindings);
  }

  if (
    raw?.findingCount !== undefined &&
    raw?.findingCount !== null
  ) {
    return toNumber(raw.findingCount);
  }

  return 0;
};


// ============================================================
// GET EVIDENCE COUNT
// ============================================================

const getEvidenceCount = (raw) => {
  if (
    raw?.evidenceCount !== undefined &&
    raw?.evidenceCount !== null
  ) {
    return toNumber(raw.evidenceCount);
  }

  if (Array.isArray(raw?.evidence)) {
    return raw.evidence.length;
  }

  if (
    raw?.evidence &&
    typeof raw.evidence === "object"
  ) {
    return toNumber(
      raw.evidence.total ??
        raw.evidence.totalEvidence ??
        raw.evidence.count ??
        raw.evidence.totalCount
    );
  }

  if (
    raw?.evidenceSummary &&
    typeof raw.evidenceSummary === "object"
  ) {
    return toNumber(
      raw.evidenceSummary.total ??
        raw.evidenceSummary.totalEvidence ??
        raw.evidenceSummary.count ??
        raw.evidenceSummary.totalCount
    );
  }

  if (
    raw?.pendingEvidenceCount !== undefined &&
    raw?.pendingEvidenceCount !== null
  ) {
    return toNumber(raw.pendingEvidenceCount);
  }

  return 0;
};


// ============================================================
// GET PENDING FINDINGS COUNT
// ============================================================

const getPendingFindingsFromList = (findings) => {
  if (!Array.isArray(findings)) {
    return 0;
  }

  return findings.filter((finding) => {
    const status = String(
      finding?.status ?? ""
    )
      .toUpperCase()
      .replace(/[\s-]/g, "_");

    return [
      "OPEN",
      "PENDING",
      "DRAFT",
      "SUBMITTED",
      "UNDER_REVIEW",
      "RESPONSE_PENDING",
    ].includes(status);
  }).length;
};


// ============================================================
// FETCH FINDINGS FOR ONE AUDIT
//
// IMPORTANT:
// Uses auditDbId
//
// Example:
//
// Audit:
// id = 1
// auditDbId = 4
//
// Finding:
// auditDbId = 4
//
// Therefore endpoint:
//
// /api/findings/audit/4
// ============================================================

const fetchFindingsForAudit = async (auditDbId) => {
  if (!auditDbId) {
    return {
      findings: [],
      count: 0,
      pending: 0,
    };
  }

  try {
    const response = await axios.get(
      `${FINDINGS_API}/audit/${auditDbId}`,
      authConfig()
    );

    console.log(
      `FINDINGS RESPONSE FOR AUDIT DB ID ${auditDbId}:`,
      response.data
    );

    const findings =
      normalizeListResponse(response);

    console.log(
      `FINDINGS COUNT FOR AUDIT ${auditDbId}:`,
      findings.length
    );

    return {
      findings,
      count: findings.length,
      pending: getPendingFindingsFromList(findings),
    };
  } catch (error) {
    console.error(
      `Failed to fetch findings for audit ${auditDbId}:`,
      error.response?.data || error
    );

    return {
      findings: [],
      count: 0,
      pending: 0,
    };
  }
};


// ============================================================
// FETCH EVIDENCE FOR ONE AUDIT
//
// IMPORTANT:
// Uses auditDbId
//
// Endpoint:
//
// /api/evidence/audit/{auditDbId}
// ============================================================

const fetchEvidenceForAudit = async (auditDbId) => {
  if (!auditDbId) {
    return {
      evidence: [],
      count: 0,
      pending: 0,
    };
  }

  try {
    const response = await axios.get(
      `${EVIDENCE_API}/audit/${auditDbId}`,
      authConfig()
    );

    console.log(
      `EVIDENCE RESPONSE FOR AUDIT DB ID ${auditDbId}:`,
      response.data
    );

    const evidence =
      normalizeListResponse(response);

    console.log(
      `EVIDENCE COUNT FOR AUDIT ${auditDbId}:`,
      evidence.length
    );

    const pending = evidence.filter((item) => {
      const status = String(
        item?.status ?? ""
      ).toUpperCase();

      return [
        "PENDING",
        "SUBMITTED",
        "UNDER_REVIEW",
      ].includes(status);
    }).length;

    return {
      evidence,
      count: evidence.length,
      pending,
    };
  } catch (error) {
    console.error(
      `Failed to fetch evidence for audit ${auditDbId}:`,
      error.response?.data || error
    );

    return {
      evidence: [],
      count: 0,
      pending: 0,
    };
  }
};


// ============================================================
// NORMALIZE AUDIT
// ============================================================

const normalizeAudit = (raw) => {
  if (!raw) {
    return null;
  }


  // ----------------------------------------------------------
  // ACTUAL DATABASE AUDIT ID
  // ----------------------------------------------------------

  const auditDbId =
    raw.auditDbId ??
    raw.auditDatabaseId ??
    raw.audit?.id ??
    raw.id ??
    null;


  // ----------------------------------------------------------
  // DEPARTMENT ENTITY
  // ----------------------------------------------------------

  const departmentName = getEntityName(
    raw.department ??
      raw.dept ??
      raw.auditDepartment
  );


  // ----------------------------------------------------------
  // ROLE ENTITY
  // ----------------------------------------------------------

  const roleName = getEntityName(
    raw.role ??
      raw.userRole
  );


  // ----------------------------------------------------------
  // BUSINESS UNIT ENTITY
  // ----------------------------------------------------------

  const businessUnitName = getEntityName(
    raw.businessUnit ??
      raw.auditBusinessUnit
  );


  // ----------------------------------------------------------
  // PROCESS ENTITY
  // ----------------------------------------------------------

  const processName = getEntityName(
    raw.processName ??
      raw.process
  );


  // ----------------------------------------------------------
  // AUDIT TYPE
  // ----------------------------------------------------------

  const auditTypeName = getEntityName(
    raw.auditType ??
      raw.type
  );


  // ----------------------------------------------------------
  // RISK CATEGORY
  // ----------------------------------------------------------

  const riskCategoryName = getEntityName(
    raw.riskCategory ??
      raw.risk?.category ??
      raw.risk?.riskCategory
  );


  // ----------------------------------------------------------
  // INITIAL COUNTS
  //
  // These will be replaced after API calls.
  // ----------------------------------------------------------

  const findingsCount =
    getFindingsCount(raw);

  const evidenceCount =
    getEvidenceCount(raw);

  const pendingFindingsCount =
    raw?.pendingFindingsCount !== undefined
      ? toNumber(raw.pendingFindingsCount)
      : 0;


  // ----------------------------------------------------------
  // NORMALIZED OBJECT
  // ----------------------------------------------------------

  return {
    // ========================================================
    // IDS
    // ========================================================

    id:
      raw.id,

    auditDbId,

    auditId:
      raw.auditId ??
      raw.auditCode ??
      raw.id,


    // ========================================================
    // BASIC
    // ========================================================

    auditTitle:
      raw.auditName ??
      raw.auditTitle ??
      raw.title ??
      "Untitled Audit",

    description:
      raw.description ?? "",


    // ========================================================
    // ENTITIES
    // ========================================================

    department:
      departmentName || "—",

    businessUnit:
      businessUnitName || "—",

    processName:
      processName || "—",

    role:
      roleName || "—",

    riskCategory:
      riskCategoryName || "—",


    // ========================================================
    // AUDIT TYPE
    // ========================================================

    auditType:
      auditTypeName ||
      "Internal Audit",


    // ========================================================
    // OBJECTIVE / SCOPE
    // ========================================================

    objective:
      raw.objective ?? "",

    scope:
      raw.scope ?? "",


    // ========================================================
    // AUDITOR
    // ========================================================

    auditorName:
      raw.internalAuditorName ??
      raw.auditorName ??
      raw.internalAuditor?.name ??
      "Unassigned",


    // ========================================================
    // DATES
    // ========================================================

    startDate:
      formatDate(
        raw.startDate
      ),

    dueDate:
      formatDate(
        raw.endDate ??
          raw.dueDate
      ),


    // ========================================================
    // STATUS
    // ========================================================

    status:
      getEntityName(
        raw.status
      ) || "UNKNOWN",


    // ========================================================
    // COUNTS
    // ========================================================

    findingsCount,

    pendingFindingsCount,

    evidenceCount,

    pendingEvidenceCount:
      evidenceCount,


    // ========================================================
    // FINDINGS DATA
    // ========================================================

    findings:
      Array.isArray(raw.findings)
        ? raw.findings
        : [],


    // ========================================================
    // EVIDENCE DATA
    // ========================================================

    evidence:
      Array.isArray(raw.evidence)
        ? raw.evidence
        : [],


    // ========================================================
    // RISK
    // ========================================================

    riskId:
      raw.riskId ??
      raw.risk?.riskId ??
      raw.risk?.id ??
      null,

    riskTitle:
      raw.riskTitle ??
      raw.risk?.title ??
      raw.risk?.riskTitle ??
      "",


    // ========================================================
    // ORIGINAL ENTITIES
    // ========================================================

    departmentEntity:
      raw.department ?? null,

    roleEntity:
      raw.role ?? null,

    businessUnitEntity:
      raw.businessUnit ?? null,

    processEntity:
      raw.process ?? null,

    riskCategoryEntity:
      raw.riskCategory ?? null,


    // ========================================================
    // ORIGINAL RESPONSE
    // ========================================================

    rawAudit:
      raw,
  };
};


// ============================================================
// PARSE DISPLAY DATE
// ============================================================

const parseDisplayDate = (value) => {
  if (
    !value ||
    value === "—"
  ) {
    return null;
  }

  const parsed =
    new Date(value);

  return isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
};


// ============================================================
// DATE FILTER
// ============================================================

const matchesDateFilter = (
  dateStr,
  filter
) => {
  if (
    filter === "All Dates"
  ) {
    return true;
  }

  const date =
    parseDisplayDate(
      dateStr
    );

  if (!date) {
    return false;
  }

  const now =
    new Date();

  if (
    filter === "This Month"
  ) {
    return (
      date.getMonth() ===
        now.getMonth() &&
      date.getFullYear() ===
        now.getFullYear()
    );
  }

  if (
    filter === "Last 3 Months"
  ) {
    const threshold =
      new Date();

    threshold.setMonth(
      now.getMonth() - 3
    );

    return (
      date >= threshold &&
      date <= now
    );
  }

  if (
    filter === "This Year"
  ) {
    return (
      date.getFullYear() ===
      now.getFullYear()
    );
  }

  return true;
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const AuditeeMyAudits = () => {
  const navigate =
    useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [audits, setAudits] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [filters, setFilters] =
    useState(
      DEFAULT_FILTERS
    );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedAudit, setSelectedAudit] =
    useState(null);


  // ==========================================================
  // FETCH AUDITS + FINDINGS + EVIDENCE
  // ==========================================================

  const fetchAudits =
    useCallback(
      async () => {
        setLoading(true);
        setError(false);

        try {
          // --------------------------------------------------
          // STEP 1
          // GET MY AUDITS
          // --------------------------------------------------

          const response =
            await auditeeAuditService.getMyAudits();

          console.log(
            "AUDITEE MY AUDITS RAW RESPONSE:",
            response
          );


          // --------------------------------------------------
          // HANDLE RESPONSE
          // --------------------------------------------------

          let data = response;

          if (
            response &&
            !Array.isArray(response) &&
            Array.isArray(
              response.data
            )
          ) {
            data =
              response.data;
          }


          if (
            !Array.isArray(data)
          ) {
            console.error(
              "Expected audit array but received:",
              data
            );

            setAudits([]);
            setError(true);

            return;
          }


          // --------------------------------------------------
          // STEP 2
          // NORMALIZE AUDITS
          // --------------------------------------------------

          const normalized =
            data
              .map(
                normalizeAudit
              )
              .filter(Boolean);


          console.log(
            "NORMALIZED AUDITS BEFORE COUNTS:",
            normalized
          );


          // --------------------------------------------------
          // STEP 3
          // FETCH FINDINGS + EVIDENCE
          //
          // IMPORTANT:
          // USE auditDbId
          // --------------------------------------------------

          const auditsWithCounts =
            await Promise.all(
              normalized.map(
                async (audit) => {

                  const auditDbId =
                    audit.auditDbId;

                  console.log(
                    "FETCHING COUNTS FOR:",
                    {
                      id: audit.id,
                      auditDbId:
                        auditDbId,
                      auditId:
                        audit.auditId,
                    }
                  );


                  if (!auditDbId) {
                    console.warn(
                      "auditDbId missing:",
                      audit
                    );

                    return audit;
                  }


                  // ------------------------------------------------
                  // FETCH BOTH AT SAME TIME
                  // ------------------------------------------------

                  const [
                    findingResult,
                    evidenceResult,
                  ] =
                    await Promise.all([
                      fetchFindingsForAudit(
                        auditDbId
                      ),

                      fetchEvidenceForAudit(
                        auditDbId
                      ),
                    ]);


                  // ------------------------------------------------
                  // FINAL AUDIT OBJECT
                  // ------------------------------------------------

                  const updatedAudit = {
                    ...audit,

                    findingsCount:
                      findingResult.count,

                    pendingFindingsCount:
                      findingResult.pending,

                    findings:
                      findingResult.findings,

                    evidenceCount:
                      evidenceResult.count,

                    pendingEvidenceCount:
                      evidenceResult.pending,

                    evidence:
                      evidenceResult.evidence,
                  };


                  console.log(
                    `FINAL COUNTS FOR ${audit.auditId}:`,
                    {
                      auditDbId,

                      findings:
                        updatedAudit.findingsCount,

                      pendingFindings:
                        updatedAudit.pendingFindingsCount,

                      evidence:
                        updatedAudit.evidenceCount,

                      pendingEvidence:
                        updatedAudit.pendingEvidenceCount,

                      department:
                        updatedAudit.department,
                    }
                  );


                  return updatedAudit;
                }
              )
            );


          // --------------------------------------------------
          // STEP 4
          // SET STATE
          // --------------------------------------------------

          setAudits(
            auditsWithCounts
          );


          console.log(
            "AUDITEE MY AUDITS FINAL:",
            auditsWithCounts
          );

        } catch (err) {
          console.error(
            "Failed to fetch auditee audits:",
            err.response?.data ||
              err
          );

          setError(true);
        } finally {
          setLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);


  // ==========================================================
  // RESET PAGE ON FILTER CHANGE
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);


  // ==========================================================
  // FILTERED AUDITS
  // ==========================================================

  const filteredAudits =
    useMemo(
      () => {
        return audits.filter(
          (audit) => {

            const search =
              filters.search
                .trim()
                .toLowerCase();


            const auditId =
              String(
                audit.auditId ??
                  ""
              ).toLowerCase();


            const auditTitle =
              String(
                audit.auditTitle ??
                  ""
              ).toLowerCase();


            const department =
              String(
                audit.department ??
                  ""
              ).toLowerCase();


            const processName =
              String(
                audit.processName ??
                  ""
              ).toLowerCase();


            const businessUnit =
              String(
                audit.businessUnit ??
                  ""
              ).toLowerCase();


            const matchesSearch =
              !search ||
              auditId.includes(search) ||
              auditTitle.includes(search) ||
              department.includes(search) ||
              processName.includes(search) ||
              businessUnit.includes(search);


            const normalizedAuditStatus =
              String(
                audit.status ?? ""
              )
                .toLowerCase()
                .replace(
                  /_/g,
                  " "
                );


            const normalizedFilterStatus =
              String(
                filters.status ?? ""
              ).toLowerCase();


            const matchesStatus =
              filters.status ===
                "All Status" ||
              normalizedAuditStatus ===
                normalizedFilterStatus;


            const matchesType =
              filters.type ===
                "All Types" ||
              String(
                audit.auditType ??
                  ""
              ) ===
                filters.type;


            const matchesDate =
              matchesDateFilter(
                audit.startDate,
                filters.date
              );


            return (
              matchesSearch &&
              matchesStatus &&
              matchesType &&
              matchesDate
            );
          }
        );
      },
      [
        audits,
        filters,
      ]
    );


  // ==========================================================
  // STATS
  // ==========================================================

  const stats =
    useMemo(
      () => {

        const total =
          audits.length;


        const inProgress =
          audits.filter(
            (audit) =>
              String(
                audit.status ?? ""
              ).toUpperCase() ===
              "IN_PROGRESS"
          ).length;


        const responsePending =
          audits.filter(
            (audit) =>
              String(
                audit.status ?? ""
              ).toUpperCase() ===
              "RESPONSE_PENDING"
          ).length;


        const completed =
          audits.filter(
            (audit) =>
              [
                "COMPLETED",
                "CLOSED",
              ].includes(
                String(
                  audit.status ?? ""
                ).toUpperCase()
              )
          ).length;


        return {
          total,
          inProgress,
          responsePending,
          completed,
        };
      },
      [audits]
    );


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredAudits.length /
          PAGE_SIZE
      )
    );


  const paginatedAudits =
    filteredAudits.slice(
      (currentPage - 1) *
        PAGE_SIZE,

      currentPage *
        PAGE_SIZE
    );


  const pagination = {
    currentPage,

    totalPages,

    totalItems:
      filteredAudits.length,

    startItem:
      filteredAudits.length === 0
        ? 0
        : (currentPage - 1) *
            PAGE_SIZE +
          1,

    endItem:
      Math.min(
        currentPage *
          PAGE_SIZE,
        filteredAudits.length
      ),
  };


  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const handleResetFilters =
    () => {
      setFilters(
        DEFAULT_FILTERS
      );
    };


  // ==========================================================
  // PAGE CHANGE
  // ==========================================================

  const handlePageChange =
    (page) => {
      if (
        page < 1 ||
        page > totalPages
      ) {
        return;
      }

      setCurrentPage(page);
    };


  // ==========================================================
  // VIEW AUDIT
  // ==========================================================

  const handleView =
    (audit) => {

      if (!audit?.id) {
        console.error(
          "Cannot navigate to audit details — audit.id is missing:",
          audit
        );

        return;
      }


      navigate(
        `/auditee-officer/audit-details/${audit.id}`
      );
    };


  // ==========================================================
  // VIEW EVIDENCE
  // ==========================================================

  const handleViewEvidence =
    (audit) => {

      if (!audit?.auditDbId) {
        console.error(
          "Cannot open evidence — auditDbId is missing:",
          audit
        );

        return;
      }


      navigate(
        `/auditee-officer/evidence?auditId=${audit.auditDbId}`
      );
    };


  // ==========================================================
  // VIEW FINDINGS
  // ==========================================================

  const handleViewFindings =
    (audit) => {

      if (!audit?.auditDbId) {
        console.error(
          "Cannot open findings — auditDbId is missing:",
          audit
        );

        return;
      }


      navigate(
        `/auditee-officer/findings?auditId=${audit.auditDbId}`
      );
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.35,
      }}
      className="min-h-full bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <h1 className="text-xl font-semibold text-gray-900">
          My Audits
        </h1>

        <p className="text-sm text-gray-500 mt-0.5">
          View and track audits assigned to your department
        </p>

      </div>


      {/* ======================================================
          STATS
      ====================================================== */}

      <AuditeeAuditStats
        stats={stats}
        loading={loading}
      />


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <AuditeeAuditFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />


      {/* ======================================================
          TABLE
      ====================================================== */}

      <AuditeeAuditTable
        audits={paginatedAudits}
        loading={loading}
        error={error}
        onRetry={fetchAudits}

        onView={handleView}

        onViewEvidence={
          handleViewEvidence
        }

        onViewFindings={
          handleViewFindings
        }

        pagination={pagination}
        onPageChange={
          handlePageChange
        }
      />


      {/* ======================================================
          QUICK VIEW
      ====================================================== */}

      {selectedAudit && (
        <AuditeeAuditQuickView
          audit={selectedAudit}

          onClose={() =>
            setSelectedAudit(null)
          }
        />
      )}

    </motion.div>
  );
};


export default AuditeeMyAudits;
