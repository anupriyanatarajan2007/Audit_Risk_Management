import React from "react";
import {
  X,
  Lock,
  ClipboardList,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const levelBadgeClass = {
  HIGH: "bg-red-50 text-red-500",
  MEDIUM: "bg-orange-50 text-orange-700",
  LOW: "bg-[#E5FAF3] text-[#00A874]",
};

const Field = ({ label, value, full = false }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
      {label}
    </p>

    <p className="text-sm font-medium text-[#101A33] whitespace-pre-wrap break-words">
      {value !== null && value !== undefined && value !== ""
        ? value
        : "—"}
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <section className="mb-6">
    <h3 className="text-sm font-bold text-[#101A33] mb-3">
      {title}
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-xl p-4 bg-white">
      {children}
    </div>
  </section>
);

const RiskDetails = ({
  risk,
  onClose,
  onStartAuditPlanning,
  onViewRelatedAudit,
}) => {
  if (!risk) return null;

  const level = (risk.riskLevel || "").toUpperCase();

  console.log("RISK DETAILS COMPONENT:", risk);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

          <div>
            <div className="flex items-center gap-3 flex-wrap">

              <h2 className="text-lg font-bold text-[#101A33]">
                Risk Details
              </h2>

              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                {risk.riskId || "—"}
              </span>

              <span
                className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${
                  levelBadgeClass[level] ||
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {level || "—"}
              </span>

            </div>

            <p className="text-sm text-gray-500 mt-1">
              Review the assigned risk before starting audit planning.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 mb-5">

            <Lock size={14} className="shrink-0 mt-0.5" />

            <span>
              This risk was created by the Risk Officer and assigned by
              the Audit Manager. It is view-only here — use it as the
              basis for audit planning.
            </span>

          </div>

          <Section title="Basic Information">

            <Field
              label="Risk Title"
              value={risk.title}
              full
            />

            <Field
              label="Description"
              value={risk.description}
              full
            />

            <Field
              label="Risk Category"
              value={risk.category}
            />

            <Field
              label="Risk Level"
              value={risk.riskLevel}
            />

            <Field
              label="Risk Score"
              value={risk.riskScore}
            />

          </Section>

          <Section title="Business Information">

            <Field
              label="Department"
              value={risk.department}
            />

            <Field
              label="Business Unit"
              value={risk.businessUnit}
            />

            <Field
              label="Process Name"
              value={risk.processName}
            />

            <Field
              label="Control Owner"
              value={risk.controlOwner}
            />

          </Section>

          <Section title="Risk Assessment">

            <Field
              label="Likelihood"
              value={risk.likelihood}
            />

            <Field
              label="Impact"
              value={risk.impact}
            />

            <Field
              label="Existing Controls"
              value={risk.existingControls}
              full
            />

          </Section>

          <Section title="Mitigation">

            <Field
              label="Mitigation Plan"
              value={risk.mitigationPlan}
              full
            />

            <Field
              label="Target Closure Date"
              value={formatDate(risk.targetClosureDate)}
            />

            <Field
              label="Remarks"
              value={risk.remarks}
              full
            />

          </Section>

          <Section title="Audit Information">

            <Field
              label="Assigned Auditor"
              value={risk.assignedAuditor}
            />

            <Field
              label="Assignment Date"
              value={formatDate(risk.assignmentDate)}
            />

            <Field
              label="Audit Status"
              value={risk.status?.replaceAll("_", " ")}
            />

            <Field
              label="Priority"
              value={risk.priority}
            />

            <Field
              label="Related Audit ID"
              value={risk.relatedAuditId || "Not started"}
            />

          </Section>

        </div>

        {/* FOOTER */}
        <div className="flex flex-wrap gap-2.5 px-6 py-4 bg-white border-t border-gray-200">

          <button
            type="button"
            onClick={() => onStartAuditPlanning(risk)}
            className="flex items-center gap-1.5 bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold rounded-lg px-4 py-2.5 active:scale-95 transition"
          >
            <ClipboardList size={15} />
            Start Audit Planning
          </button>

          {risk.relatedAuditId && (
            <button
              type="button"
              onClick={() => onViewRelatedAudit(risk)}
              className="flex items-center gap-1.5 border border-gray-200 text-[#101A33] text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-gray-100 active:scale-95 transition"
            >
              <ExternalLink size={15} />
              View Related Audit
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-semibold px-4 py-2.5 transition"
          >
            <ArrowLeft size={15} />
            Back to Assigned Risks
          </button>

        </div>

      </div>
    </div>
  );
};

export default RiskDetails;