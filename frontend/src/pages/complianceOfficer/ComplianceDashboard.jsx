import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  FileWarning,
  ShieldCheck,
  AlertTriangle,
  Clock3,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import complianceReportService from "../../service/complianceReportService";
import ComplianceHeader from "../../components/compliance-officer/Complianceheader";
import ComplianceStatCard from "../../components/compliance-officer/Compliancestatcard";
import ComplianceScoreCard from "../../components/compliance-officer/Compliancescorecard";
import ComplianceTrendChart from "../../components/compliance-officer/Compliancetrendchart";
import RegulatoryStatusChart from "../../components/compliance-officer/Regulatorystatuschart";
import FindingsSeverityChart from "../../components/compliance-officer/Findingsseveritychart";
import ComplianceReviewsTable from "../../components/compliance-officer/Compliancereviewstable";
import UpcomingComplianceDeadlines from "../../components/compliance-officer/Upcomingcompliancedeadlines";
import ComplianceActivity from "../../components/compliance-officer/Complianceactivity";
import ComplianceStatusDistribution from "../../components/compliance-officer/ComplianceStatusDistribution";
import ComplianceAlerts from "../../components/compliance-officer/ComplianceAlerts";
import ComplianceQuickActions from "../../components/compliance-officer/ComplianceQuickActions";


const unwrapArray = (data) => {
  if (Array.isArray(data)) return data;

  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

const getDateValue = (item) =>
  item?.reviewDate ??
  item?.createdAt ??
  item?.createdDate ??
  item?.date ??
  item?.updatedAt ??
  null;

const getStatus = (item) =>
  normalize(
    item?.complianceStatus ??
      item?.status ??
      item?.reviewStatus
  );

const getRiskLevel = (item) =>
  normalize(
    item?.riskLevel ??
      item?.risk?.riskLevel
  );

const getFindingStatus = (item) =>
  normalize(
    item?.findingStatus ??
      item?.finding?.status
  );

const getEvidenceStatus = (item) =>
  normalize(
    item?.evidenceStatus ??
      item?.evidence?.status
  );

const calculateScore = (reviews) => {
  if (!reviews.length) return 0;

  let compliant = 0;
  let partial = 0;
  let nonCompliant = 0;

  reviews.forEach((review) => {
    const status = getStatus(review);

    if (
      ["APPROVED", "COMPLIANT", "COMPLETED", "PASS", "PASSED"].includes(
        status
      )
    ) {
      compliant++;
    } else if (
      [
        "PARTIAL",
        "PARTIALLY_COMPLIANT",
        "IN_PROGRESS",
        "PENDING",
        "UNDER_REVIEW",
      ].includes(status)
    ) {
      partial++;
    } else if (
      [
        "REJECTED",
        "NON_COMPLIANT",
        "FAILED",
        "FAIL",
      ].includes(status)
    ) {
      nonCompliant++;
    }
  });

  return Math.round(
    ((compliant + partial * 0.5) / reviews.length) * 100
  );
};

const getScoreStatus = (score) => {
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Attention";
};

const ComplianceDashboard = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);

  const loadReviews = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response =
        await complianceReportService.getReports();

      const data = unwrapArray(response);

      setReviews(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Failed to load compliance dashboard:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load compliance data."
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const total = reviews.length;

    let compliant = 0;
    let partial = 0;
    let nonCompliant = 0;

    let approved = 0;
    let rejected = 0;
    let pending = 0;
    let inProgress = 0;

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    let overdue = 0;

    reviews.forEach((review) => {
      const status = getStatus(review);
      const risk = getRiskLevel(review);

      // -----------------------------
      // Compliance status
      // -----------------------------

      if (
        ["APPROVED", "COMPLIANT", "COMPLETED", "PASS", "PASSED"].includes(
          status
        )
      ) {
        compliant++;
      } else if (
        [
          "PARTIAL",
          "PARTIALLY_COMPLIANT",
          "IN_PROGRESS",
          "PENDING",
          "UNDER_REVIEW",
        ].includes(status)
      ) {
        partial++;
      } else if (
        [
          "REJECTED",
          "NON_COMPLIANT",
          "FAILED",
          "FAIL",
        ].includes(status)
      ) {
        nonCompliant++;
      }

      // -----------------------------
      // Review status
      // -----------------------------

      if (
        ["APPROVED", "COMPLETED"].includes(status)
      ) {
        approved++;
      }

      if (
        ["REJECTED", "FAILED"].includes(status)
      ) {
        rejected++;
      }

      if (
        ["PENDING", "UNDER_REVIEW"].includes(status)
      ) {
        pending++;
      }

      if (status === "IN_PROGRESS") {
        inProgress++;
      }

      // -----------------------------
      // Risk
      // -----------------------------

      if (risk === "CRITICAL") critical++;
      if (risk === "HIGH") high++;
      if (risk === "MEDIUM") medium++;
      if (risk === "LOW") low++;

      // -----------------------------
      // Overdue
      // -----------------------------

      const dueDate =
        review?.dueDate ??
        review?.targetClosureDate ??
        review?.deadline;

      if (dueDate) {
        const due = new Date(dueDate);

        if (
          !Number.isNaN(due.getTime()) &&
          due < new Date() &&
          !["APPROVED", "COMPLETED"].includes(status)
        ) {
          overdue++;
        }
      }
    });

    const score = calculateScore(reviews);

    return {
      total,
      compliant,
      partial,
      nonCompliant,
      approved,
      rejected,
      pending,
      inProgress,
      critical,
      high,
      medium,
      low,
      overdue,
      score,
      scoreStatus: getScoreStatus(score),
    };
  }, [reviews]);

  // ============================================================
  // TREND
  //
  // Since backend currently exposes only /reviews,
  // derive monthly data from available review dates.
  // ============================================================

  const trendData = useMemo(() => {
    const months = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleString("en-US", {
          month: "short",
        }),
        reviews: [],
      });
    }

    reviews.forEach((review) => {
      const rawDate = getDateValue(review);

      if (!rawDate) return;

      const date = new Date(rawDate);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const bucket = months.find(
        (item) => item.key === key
      );

      if (bucket) {
        bucket.reviews.push(review);
      }
    });

    return months.map((month) => ({
      month: month.month,
      score:
        month.reviews.length > 0
          ? calculateScore(month.reviews)
          : 0,
    }));
  }, [reviews]);

  // ============================================================
  // REGULATORY STATUS CHART
  // ============================================================

  const regulatoryStatusData = useMemo(
    () => [
      {
        key: "COMPLIANT",
        name: "Compliant",
        value: summary.compliant,
        color: "#2dd4bf",
      },
      {
        key: "PARTIAL",
        name: "Partial",
        value: summary.partial,
        color: "#fbbf24",
      },
      {
        key: "NON_COMPLIANT",
        name: "Non-Compliant",
        value: summary.nonCompliant,
        color: "#fb7185",
      },
    ],
    [summary]
  );

  // ============================================================
  // FINDING SEVERITY
  // ============================================================

  const findingsSeverityData = useMemo(
    () => [
      {
        name: "Critical",
        value: summary.critical,
        color: "#fb7185",
      },
      {
        name: "High",
        value: summary.high,
        color: "#fb923c",
      },
      {
        name: "Medium",
        value: summary.medium,
        color: "#fbbf24",
      },
      {
        name: "Low",
        value: summary.low,
        color: "#2dd4bf",
      },
    ],
    [summary]
  );

  // ============================================================
  // STATUS DISTRIBUTION
  // ============================================================

  const statusDistribution = useMemo(
    () => ({
      compliant: summary.compliant,
      partial: summary.partial,
      nonCompliant: summary.nonCompliant,
    }),
    [summary]
  );

  // ============================================================
  // DEADLINES
  //
  // Derived from whatever due-date field is available.
  // ============================================================

  const deadlines = useMemo(() => {
    const result = [];

    reviews.forEach((review) => {
      const dateValue =
        review?.dueDate ??
        review?.targetClosureDate ??
        review?.deadline;

      if (!dateValue) return;

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) return;

      const today = new Date();

      const diff =
        Math.ceil(
          (date.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        );

      if (diff <= 30) {
        result.push({
          id:
            review.id ??
            review.reviewId ??
            `${dateValue}-${Math.random()}`,
          name:
            review.requirementName ??
            review.requirement?.name ??
            review.title ??
            review.reviewId ??
            "Compliance Review",
          daysRemaining: diff,
          department:
            review.department ??
            "General",
          priority:
            review.priority ??
            review.riskLevel ??
            "MEDIUM",
        });
      }
    });

    return result
      .sort(
        (a, b) =>
          a.daysRemaining -
          b.daysRemaining
      )
      .slice(0, 5);
  }, [reviews]);

  // ============================================================
  // ACTIVITY
  // ============================================================

  const activity = useMemo(() => {
    return [...reviews]
      .sort((a, b) => {
        const da = new Date(
          getDateValue(a) || 0
        ).getTime();

        const db = new Date(
          getDateValue(b) || 0
        ).getTime();

        return db - da;
      })
      .slice(0, 6)
      .map((review, index) => ({
        id:
          review.id ??
          review.reviewId ??
          index,

        type:
          getFindingStatus(review)
            ? "finding"
            : "review",

        description:
          review.title ??
          review.requirementName ??
          `Compliance review ${
            review.reviewId ?? ""
          }`,

        user:
          review.reviewer ??
          review.assignedTo ??
          review.complianceOfficer ??
          "Compliance Officer",

        timestamp:
          getDateValue(review),

        status:
          review.status ??
          review.complianceStatus ??
          "Updated",
      }));
  }, [reviews]);

  // ============================================================
  // ALERTS
  // ============================================================

  const alerts = useMemo(() => {
    const result = [];

    reviews.forEach((review) => {
      const risk = getRiskLevel(review);

      if (risk === "CRITICAL") {
        result.push({
          id:
            review.id ??
            review.reviewId,
          severity: "CRITICAL",
          title:
            review.title ??
            review.requirementName ??
            "Critical compliance review",
          description:
            "Critical risk requires immediate attention.",
          review,
        });
      }

      if (
        ["REJECTED", "NON_COMPLIANT", "FAILED"].includes(
          getStatus(review)
        )
      ) {
        result.push({
          id: `status-${
            review.id ??
            review.reviewId
          }`,
          severity: "HIGH",
          title:
            review.title ??
            review.requirementName ??
            "Non-compliant review",
          description:
            "Compliance status requires corrective action.",
          review,
        });
      }
    });

    return result.slice(0, 5);
  }, [reviews]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    loadReviews(true);
  };

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !reviews.length) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
        <ComplianceHeader
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl border border-rose-400/20 bg-rose-400/10 flex items-center justify-center">
              <AlertTriangle
                size={22}
                className="text-rose-300"
              />
            </div>

            <h2 className="text-lg font-semibold text-white mt-4">
              Unable to load compliance dashboard
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {error}
            </p>

            <button
              onClick={() => loadReviews()}
              className="mt-5 rounded-xl bg-teal-400/10 border border-teal-400/20 px-4 py-2 text-sm text-teal-300 hover:bg-teal-400/20"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <ComplianceHeader
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* =====================================================
            LAST UPDATED
        ====================================================== */}

        <div className="flex justify-end mb-4">
          <span className="text-[10px] text-slate-600">
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString()}`
              : "Loading compliance data..."}
          </span>
        </div>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.06,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          <ComplianceStatCard
            icon={ShieldCheck}
            label="Compliance Score"
            value={summary.score}
            suffix="%"
            description="Overall calculated score"
            accent="teal"
          />

          <ComplianceStatCard
            icon={FileText}
            label="Total Reviews"
            value={summary.total}
            description="Compliance reviews"
            accent="sky"
          />

          <ComplianceStatCard
            icon={ClipboardCheck}
            label="Approved"
            value={summary.approved}
            description="Completed approvals"
            accent="teal"
          />

          <ComplianceStatCard
            icon={FileWarning}
            label="Non-Compliant"
            value={summary.nonCompliant}
            description="Requires corrective action"
            accent="rose"
            attention={summary.nonCompliant > 0}
          />

          <ComplianceStatCard
            icon={Clock3}
            label="Pending"
            value={summary.pending}
            description="Awaiting review"
            accent="amber"
          />

          <ComplianceStatCard
            icon={AlertTriangle}
            label="Overdue"
            value={summary.overdue}
            description="Past due date"
            accent="rose"
            attention={summary.overdue > 0}
          />
        </motion.section>

        {/* =====================================================
            SCORE + TREND
        ====================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-5 gap-5 mt-5">

          <div className="xl:col-span-2">
            <ComplianceScoreCard
              score={summary.score}
              status={summary.scoreStatus}
              compliant={summary.compliant}
              partial={summary.partial}
              nonCompliant={summary.nonCompliant}
            />
          </div>

          <div className="xl:col-span-3">
            <ComplianceTrendChart
              data={trendData}
              loading={loading}
              error={error}
              onRetry={() => loadReviews(true)}
            />
          </div>

        </section>

        {/* =====================================================
            ANALYTICS
        ====================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

          <RegulatoryStatusChart
            data={regulatoryStatusData}
            loading={loading}
            error={error}
            onRetry={() => loadReviews(true)}
          />

          <FindingsSeverityChart
            data={findingsSeverityData}
            loading={loading}
            error={error}
            onRetry={() => loadReviews(true)}
          />

        </section>

        {/* =====================================================
            REVIEWS
        ====================================================== */}

        <section className="mt-5">
          <ComplianceReviewsTable
            reviews={reviews}
            loading={loading}
            error={error}
            onRetry={() => loadReviews(true)}
          />
        </section>

        {/* =====================================================
            DEADLINES + ACTIVITY
        ====================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

          <UpcomingComplianceDeadlines
            deadlines={deadlines}
            loading={loading}
            error={error}
            onRetry={() => loadReviews(true)}
          />

          <ComplianceActivity
            activity={activity}
            loading={loading}
            error={error}
            onRetry={() => loadReviews(true)}
          />

        </section>

        {/* =====================================================
            STATUS + ALERTS
        ====================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

          <ComplianceStatusDistribution
            data={statusDistribution}
            loading={loading}
            error={error}
            onRetry={() => loadReviews(true)}
          />

          <ComplianceAlerts
            alerts={alerts}
            loading={loading}
            error={error}
            onRetry={() => loadReviews(true)}
            onView={(alert) => {
              const id =
                alert?.review?.id ??
                alert?.review?.reviewId;

              if (id) {
                navigate(`/compliance/reviews/${id}`);
              }
            }}
          />

        </section>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="mt-5">
          <ComplianceQuickActions
            onNavigate={(path) => navigate(path)}
          />
        </section>

      </div>
    </div>
  );
};

export default ComplianceDashboard;