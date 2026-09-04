import { useEffect } from "react";
import { useRiskCreation } from "../../../context/RiskCreationContext";
import RiskStepper from "../../../components/riskOfficer/RiskStepper";
import RiskMatrix from "../../../components/riskOfficer/RiskMatrix";

const CATEGORIES = [
  { value: "FINANCIAL", label: "Financial" },
  { value: "OPERATIONAL", label: "Operational" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "STRATEGIC", label: "Strategic" },
  { value: "INFORMATION_TECHNOLOGY", label: "Information Technology" },
  { value: "CYBER_SECURITY", label: "Cyber Security" },
  { value: "LEGAL", label: "Legal" },
  { value: "REPUTATIONAL", label: "Reputational" },
];

const LIKELIHOODS = [
  { value: "RARE", label: "Rare", score: 1 },
  { value: "UNLIKELY", label: "Unlikely", score: 2 },
  { value: "POSSIBLE", label: "Possible", score: 3 },
  { value: "LIKELY", label: "Likely", score: 4 },
  { value: "ALMOST_CERTAIN", label: "Almost Certain", score: 5 },
];

const IMPACTS = [
  { value: "VERY_LOW", label: "Very Low", score: 1 },
  { value: "LOW", label: "Low", score: 2 },
  { value: "MEDIUM", label: "Medium", score: 3 },
  { value: "HIGH", label: "High", score: 4 },
  { value: "VERY_HIGH", label: "Very High", score: 5 },
];

function levelFromScore(score) {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

const LEVEL_BADGE = {
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
};

export default function RiskAssessment({
  onNext,
  onPrevious,
  onCancel,
}) {
  const { data, updateData, step } = useRiskCreation();

  useEffect(() => {
    const likelihood = LIKELIHOODS.find(
      (l) => l.value === data.likelihood
    );

    const impact = IMPACTS.find(
      (i) => i.value === data.impact
    );

    if (likelihood && impact) {
      const score = likelihood.score * impact.score;

      updateData({
        riskScore: score,
        riskLevel: levelFromScore(score),
      });
    }
  }, [data.likelihood, data.impact]);

  const handleChange = (e) => {
    updateData({
      [e.target.name]: e.target.value,
    });
  };

  const canProceed =
    data.category &&
    data.likelihood &&
    data.impact;

  return (
    <div className="flex h-full flex-col">
      <RiskStepper currentStep={step} />

      <div className="flex-1 overflow-y-auto px-8 pb-6">

        <h3 className="mb-1 text-lg font-bold text-slate-800">
          Risk Assessment
        </h3>

        <p className="mb-6 text-sm text-slate-500">
          Score the risk and see its level calculated live.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="space-y-5">

            {/* Category */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>

              <select
                name="category"
                value={data.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="">Select Category</option>

                {CATEGORIES.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Likelihood */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Likelihood <span className="text-red-500">*</span>
              </label>

              <select
                name="likelihood"
                value={data.likelihood}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="">Select Likelihood</option>

                {LIKELIHOODS.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Impact */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Impact <span className="text-red-500">*</span>
              </label>

              <select
                name="impact"
                value={data.impact}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="">Select Impact</option>

                {IMPACTS.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Existing Controls */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Existing Controls
              </label>

              <textarea
                rows={4}
                name="existingControls"
                value={data.existingControls}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            {/* Risk Score */}

            {data.riskScore > 0 && (
              <div className="flex items-center gap-5 rounded-lg border border-slate-200 bg-slate-50 p-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Risk Score
                  </p>

                  <p className="text-2xl font-bold">
                    {data.riskScore}
                  </p>
                </div>

                <div className="h-8 w-px bg-slate-300" />

                <div>
                  <p className="text-xs text-slate-500">
                    Risk Level
                  </p>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      LEVEL_BADGE[data.riskLevel]
                    }`}
                  >
                    {data.riskLevel}
                  </span>
                </div>

              </div>
            )}

          </div>

          <RiskMatrix
            likelihood={data.likelihood}
            impact={data.impact}
          />

        </div>

      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4">

        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>

        <div className="flex gap-3">

          <button
            onClick={onPrevious}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Previous
          </button>

          <button
            onClick={onNext}
            disabled={!canProceed}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
}