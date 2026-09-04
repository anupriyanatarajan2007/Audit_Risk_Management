import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardList } from "lucide-react";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import { SkeletonBlock } from "./Skeletons";

const statusStyles = {
  COMPLETED:
    "text-emerald-600 bg-emerald-50 border-emerald-200",
  APPROVED:
    "text-emerald-600 bg-emerald-50 border-emerald-200",
  COMPLIANT:
    "text-emerald-600 bg-emerald-50 border-emerald-200",
  "IN PROGRESS":
    "text-sky-600 bg-sky-50 border-sky-200",
  IN_PROGRESS:
    "text-sky-600 bg-sky-50 border-sky-200",
  PENDING:
    "text-amber-600 bg-amber-50 border-amber-200",
  UNDER_REVIEW:
    "text-amber-600 bg-amber-50 border-amber-200",
  OVERDUE:
    "text-rose-600 bg-rose-50 border-rose-200",
  REJECTED:
    "text-rose-600 bg-rose-50 border-rose-200",
  NON_COMPLIANT:
    "text-rose-600 bg-rose-50 border-rose-200",
};

const riskStyles = {
  CRITICAL:
    "text-rose-600 bg-rose-50 border-rose-200",
  HIGH:
    "text-orange-600 bg-orange-50 border-orange-200",
  MEDIUM:
    "text-amber-600 bg-amber-50 border-amber-200",
  LOW:
    "text-teal-600 bg-teal-50 border-teal-200",
};

const Badge = ({ value, styleMap }) => {
  const key = String(value ?? "")
    .toUpperCase()
    .replaceAll("-", "_");

  const cls =
    styleMap[key] ??
    "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <span
      className={`inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${cls}`}
    >
      {String(value ?? "Unknown").replaceAll("_", " ")}
    </span>
  );
};

const SkeletonTableRow = () => {
  return (
    <div className="flex items-center gap-4 py-4 border-t border-slate-100">
      <SkeletonBlock className="h-3 w-20 bg-slate-100" />
      <SkeletonBlock className="h-3 w-40 bg-slate-100" />
      <SkeletonBlock className="h-3 w-24 bg-slate-100" />
      <SkeletonBlock className="h-3 w-24 bg-slate-100" />
      <SkeletonBlock className="h-6 w-20 bg-slate-100" />
      <SkeletonBlock className="h-3 w-20 bg-slate-100" />
      <SkeletonBlock className="h-6 w-16 bg-slate-100" />
    </div>
  );
};

const ComplianceReviewsTable = ({
  reviews,
  loading,
  error,
  onRetry,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return (reviews ?? []).filter((r) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        !search ||
        [
          r.regulatoryRequirement,
          r.requirementName,
          r.department,
          r.reviewer,
          r.reviewId,
          r.auditId,
        ]
          .filter(Boolean)
          .some((f) =>
            String(f).toLowerCase().includes(searchValue)
          );

      const currentStatus = String(
        r.status ?? r.complianceStatus ?? ""
      )
        .toUpperCase()
        .replaceAll("-", "_");

      const currentRisk = String(
        r.riskLevel ?? r.risk?.riskLevel ?? ""
      ).toUpperCase();

      const normalizedStatusFilter =
        statusFilter.replaceAll(" ", "_");

      const matchesStatus =
        statusFilter === "ALL" ||
        currentStatus === normalizedStatusFilter;

      const matchesRisk =
        riskFilter === "ALL" ||
        currentRisk === riskFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk
      );
    });
  }, [
    reviews,
    search,
    statusFilter,
    riskFilter,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <ClipboardList
                size={16}
                className="text-teal-600"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Compliance Reviews
              </h3>

              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length} reviews
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search reviews..."
              className="pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 w-full sm:w-52"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300"
          >
            <option value="ALL">
              All Statuses
            </option>
            <option value="COMPLETED">
              Completed
            </option>
            <option value="IN PROGRESS">
              In Progress
            </option>
            <option value="PENDING">
              Pending
            </option>
            <option value="OVERDUE">
              Overdue
            </option>
            <option value="REJECTED">
              Rejected
            </option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value)
            }
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300"
          >
            <option value="ALL">
              All Risk Levels
            </option>
            <option value="CRITICAL">
              Critical
            </option>
            <option value="HIGH">
              High
            </option>
            <option value="MEDIUM">
              Medium
            </option>
            <option value="LOW">
              Low
            </option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error ? (
        <ErrorState
          message="Unable to load compliance reviews."
          onRetry={onRetry}
        />
      ) : loading ? (
        /* LOADING */
        <div>
          {Array.from({ length: 5 }).map(
            (_, i) => (
              <SkeletonTableRow key={i} />
            )
          )}
        </div>
      ) : filtered.length === 0 ? (
        /* EMPTY */
        <EmptyState
          icon={ClipboardList}
          title="No compliance reviews available"
        />
      ) : (
        /* TABLE */
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[850px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="px-3 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Review ID
                </th>

                <th className="px-3 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Requirement
                </th>

                <th className="px-3 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Department
                </th>

                <th className="px-3 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Reviewer
                </th>

                <th className="px-3 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Status
                </th>

                <th className="px-3 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Due Date
                </th>

                <th className="px-3 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-500">
                  Risk
                </th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {filtered.map((r, idx) => (
                  <motion.tr
                    key={
                      r.id ??
                      r.reviewId ??
                      idx
                    }
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.25,
                      delay: idx * 0.02,
                    }}
                    className="text-sm text-slate-600 border-b border-slate-100 hover:bg-teal-50/40 transition-colors"
                  >
                    <td className="px-3 py-3.5 font-mono text-xs font-medium text-slate-500">
                      #
                      {r.id ??
                        r.reviewId ??
                        "—"}
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="max-w-[220px]">
                        <p className="font-medium text-slate-800 truncate">
                          {r.regulatoryRequirement ??
                            r.requirementName ??
                            "—"}
                        </p>

                        {r.auditId && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Audit: {r.auditId}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-slate-600">
                      {r.department ?? "—"}
                    </td>

                    <td className="px-3 py-3.5 text-slate-600">
                      {r.reviewer ?? "—"}
                    </td>

                    <td className="px-3 py-3.5">
                      <Badge
                        value={
                          r.status ??
                          r.complianceStatus
                        }
                        styleMap={statusStyles}
                      />
                    </td>

                    <td className="px-3 py-3.5 text-xs text-slate-500">
                      {r.dueDate
                        ? new Date(
                            r.dueDate
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-3 py-3.5">
                      <Badge
                        value={
                          r.riskLevel ??
                          r.risk?.riskLevel
                        }
                        styleMap={riskStyles}
                      />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default ComplianceReviewsTable;