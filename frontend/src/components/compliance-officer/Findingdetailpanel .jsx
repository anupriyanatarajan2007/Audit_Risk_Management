import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Paperclip,
  ClipboardList,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  getFindingId,
  getFindingTitle,
  getFindingDescription,
  getFindingSeverity,
  getFindingStatus,
  getFindingCreatedDate,
  getEvidenceId,
  getEvidenceName,
  getEvidenceType,
  getEvidenceDescription,
  getEvidenceUploadedBy,
  getEvidenceUploadedDate,
  getEvidenceStatus,
  getRecommendationId,
  getRecommendationText,
  getRecommendationPriority,
  getRecommendationStatus,
  getRecommendationDueDate,
  getRecommendationAssignee,
  getRecommendationImplementationStatus,
  getReviewStatus,
  getReviewer,
  getReviewDate,
  getReviewCompliancePercentage,
  getReviewComments,
  formatDate,
  formatPercent,
  titleCase,
  badgeClasses,
  SEVERITY_COLORS,
  STATUS_COLORS,
} from "../../utils/Reportdataadapters";

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function SectionHeading({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-teal-700" />
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      {typeof count === "number" && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
}

function EmptyRow({ text }) {
  return <p className="text-sm text-slate-400 italic py-3">{text}</p>;
}

export default function FindingDetailPanel({
  finding,
  evidence,
  recommendations,
  review,
  loadingEvidence,
  loadingRecommendations,
  onClose,
  onOpenEvidence,
}) {
  return (
    <AnimatePresence>
      {finding && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-900/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto border-l border-slate-200"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between z-10">
              <div>
                <p className="text-xs text-slate-400 mb-1">Finding #{getFindingId(finding)}</p>
                <h3 className="text-base font-semibold text-slate-900 pr-6">
                  {getFindingTitle(finding)}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 rounded-md p-1 hover:bg-slate-100"
                aria-label="Close finding details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-8">
              {/* FINDING DETAILS */}
              <section>
                <SectionHeading icon={FileText} title="Finding Details" />
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={badgeClasses(SEVERITY_COLORS, getFindingSeverity(finding))}>
                    {titleCase(getFindingSeverity(finding))}
                  </Badge>
                  <Badge className={badgeClasses(STATUS_COLORS, getFindingStatus(finding))}>
                    {titleCase(getFindingStatus(finding))}
                  </Badge>
                  <span className="text-xs text-slate-400 self-center">
                    Identified {formatDate(getFindingCreatedDate(finding))}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {getFindingDescription(finding) || "No description provided."}
                </p>
              </section>

              <div className="h-px bg-slate-100" />

              {/* EVIDENCE TRACK */}
              <section>
                <SectionHeading icon={Paperclip} title="Evidence Track" count={evidence.length} />
                <p className="text-xs text-slate-400 mb-3">
                  Total Evidence: {evidence.length}
                </p>
                {loadingEvidence ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading evidence…
                  </div>
                ) : evidence.length === 0 ? (
                  <EmptyRow text="No evidence available for this finding." />
                ) : (
                  <ul className="space-y-2">
                    {evidence.map((e) => (
                      <li
                        key={getEvidenceId(e)}
                        className="border border-slate-200 rounded-lg p-3 hover:border-teal-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {getEvidenceName(e)}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {getEvidenceType(e)} · Uploaded by {getEvidenceUploadedBy(e)} ·{" "}
                              {formatDate(getEvidenceUploadedDate(e))}
                            </p>
                            {getEvidenceDescription(e) && (
                              <p className="text-xs text-slate-500 mt-1">{getEvidenceDescription(e)}</p>
                            )}
                          </div>
                          <button
                            onClick={() => onOpenEvidence(e)}
                            className="shrink-0 text-teal-700 hover:text-teal-800 p-1 rounded-md hover:bg-teal-50"
                            title="View / open evidence file"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <Badge className={badgeClasses(STATUS_COLORS, getEvidenceStatus(e))}>
                            {titleCase(getEvidenceStatus(e))}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="h-px bg-slate-100" />

              {/* RECOMMENDATIONS */}
              <section>
                <SectionHeading icon={ClipboardList} title="Recommendations" count={recommendations.length} />
                {loadingRecommendations ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading recommendations…
                  </div>
                ) : recommendations.length === 0 ? (
                  <EmptyRow text="No recommendations available." />
                ) : (
                  <ul className="space-y-2">
                    {recommendations.map((r) => (
                      <li
                        key={getRecommendationId(r)}
                        className="border border-slate-200 rounded-lg p-3"
                      >
                        <p className="text-sm text-slate-700">{getRecommendationText(r)}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className={badgeClasses(SEVERITY_COLORS, getRecommendationPriority(r))}>
                            {titleCase(getRecommendationPriority(r))} priority
                          </Badge>
                          <Badge className={badgeClasses(STATUS_COLORS, getRecommendationStatus(r))}>
                            {titleCase(getRecommendationStatus(r))}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            Due {formatDate(getRecommendationDueDate(r))}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Assigned to {getRecommendationAssignee(r)} · Implementation:{" "}
                          {titleCase(getRecommendationImplementationStatus(r))}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="h-px bg-slate-100" />

              {/* COMPLIANCE REVIEW */}
              <section>
                <SectionHeading icon={ShieldCheck} title="Compliance Review" />
                {!review ? (
                  <EmptyRow text="No compliance review available." />
                ) : (
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={badgeClasses(STATUS_COLORS, getReviewStatus(review))}>
                        {titleCase(getReviewStatus(review))}
                      </Badge>
                      <span className="text-sm font-semibold text-teal-700">
                        {formatPercent(getReviewCompliancePercentage(review))}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Reviewed by {getReviewer(review)} on {formatDate(getReviewDate(review))}
                    </p>
                    {getReviewComments(review) && (
                      <p className="text-xs text-slate-600 border-t border-slate-100 pt-2">
                        “{getReviewComments(review)}”
                      </p>
                    )}
                  </div>
                )}
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}