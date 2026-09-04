import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Calendar, User } from "lucide-react";
import RiskService from "../../../service/RiskService";

const LEVEL_STYLES = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

export default function RiskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
  
    RiskService.getRiskById(id)
      .then((data) => {
        if (active) {
          setRisk(data.data || data);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        console.log("Status:", err.response?.status);
        console.log("Response:", err.response?.data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
  
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-600">This risk could not be found.</p>
        <button
          onClick={() => navigate("/risk-officer/risk-register")}
          className="mt-4 text-sm font-semibold text-emerald-600 hover:underline"
        >
          Back to Risk Register
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <button
        onClick={() => navigate("/risk-officer/risk-register")}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600"
      >
        <ArrowLeft size={16} /> Back to Risk Register
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {risk.riskId}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">{risk.title}</h1>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              LEVEL_STYLES[risk.riskLevel] || "bg-slate-100 text-slate-600"
            }`}
          >
            {risk.riskLevel} · Score {risk.riskScore}
          </span>
        </div>

        <p className="mt-4 leading-relaxed text-slate-600">{risk.description}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <Building2 size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Department</p>
              <p className="text-sm font-medium text-slate-700">{risk.department}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <User size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Control Owner</p>
              <p className="text-sm font-medium text-slate-700">{risk.controlOwner || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Calendar size={16} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Target Closure</p>
              <p className="text-sm font-medium text-slate-700">{risk.targetClosureDate || "—"}</p>
            </div>
          </div>
        </div>

        {risk.mitigationPlan && (
          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mitigation Plan
            </p>
            <p className="text-sm text-slate-700">{risk.mitigationPlan}</p>
          </div>
        )}
      </div>
    </div>
  );
}