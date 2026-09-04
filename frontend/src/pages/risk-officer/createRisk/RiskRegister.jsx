import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import RiskMitigation from "./RiskMitigation";
import RiskFilters from "../../../components/riskOfficer/RiskFilters";
import RiskList from "../../../components/riskOfficer/RiskList";
import FloatingAddButton from "../../../components/riskOfficer/FloatingAddButton";
import { RiskCreationProvider } from "../../../context/RiskCreationContext";
import RiskService from "../../../service/RiskService";
import { useRiskCreation } from "../../../context/RiskCreationContext";
import BasicRiskInfo from "./BasicRiskInfo.jsx";
import RiskAssessment from "./RiskAssessment.jsx";
function CreateRiskWizard({ onClose, onCreated }) {
  const { step, goNext, goPrevious, closeWizard } = useRiskCreation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const requestCancel = () => setShowCancelConfirm(true);
  
  const confirmCancel = () => {
    setShowCancelConfirm(false);
    closeWizard();
    onClose();
  };

  const handleSuccess = (createdRisk) => {
    closeWizard();
    onCreated(createdRisk);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-4">
          <h2 className="text-base font-bold text-slate-800">Create New Risk</h2>
          <button
            onClick={requestCancel}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {step === 1 && <BasicRiskInfo onNext={goNext} onCancel={requestCancel} />}
        {step === 2 && (
          <RiskAssessment onNext={goNext} onPrevious={goPrevious} onCancel={requestCancel} />
        )}
        {step === 3 && (
          <RiskMitigation onPrevious={goPrevious} onCancel={requestCancel} onSuccess={handleSuccess} />
        )}
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-800">Cancel risk creation?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to cancel? Everything you've entered will be lost.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep editing
              </button>
              <button
                onClick={confirmCancel}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Discard & Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskRegisterInner() {
  const navigate = useNavigate();
  const { isOpen, openWizard, closeWizard } = useRiskCreation();

  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({ status: "", level: "", category: "", department: "" });
  const [toast, setToast] = useState(null);

  const loadAllRisks = useCallback(async () => {
    setLoading(true);
  
    try {
        const result = await RiskService.getAllRisks();
        setRisks(result.data || []);
    } catch (err) {
         console.error(err);
      setRisks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllRisks();
  }, [loadAllRisks]);

  // Filters — call whichever endpoint matches the active filter, mutually exclusive per your API design
  const handleFilterChange = async (key, value) => {
    if (key === "clear") {
      setFilters({ status: "", level: "", category: "", department: "" });
      setSearchValue("");
      loadAllRisks();
      return;
    }

    const nextFilters = { status: "", level: "", category: "", department: "", [key]: value };
    setFilters(nextFilters);

    if (!value) {
      loadAllRisks();
      return;
    }

    setLoading(true);
    try {
      let result = [];
      if (key === "status") result = await RiskService.getRisksByStatus(value);
      if (key === "level") result = await RiskService.getRisksByLevel(value);
      if (key === "category") result = await RiskService.getRisksByCategory(value);
      if (key === "department") result = await RiskService.getRisksByDepartment(value);
      setRisks(result.data || []);
    } catch (err) {
      console.error("Failed to filter risks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskUpdated = (patch) => {
    setRisks((prev) => prev.map((r) => (r.id === patch.id ? { ...r, ...patch } : r)));
  };
  
  // 2. reuse your existing toast mechanism for both success/error:
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      loadAllRisks();
      return;
    }
    setLoading(true);
    try {
      const result = await RiskService.searchRisks(searchValue.trim());
      setRisks(result.data || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRisk = (id) => {
    setSelectedId(id);
    navigate(`/risk-officer/risks/${id}`);
  };

  const handleCreated = (createdRisk) => {
    setToast("Risk created successfully.");
    loadAllRisks();
    setTimeout(() => setToast(null), 3500);
    if (createdRisk?.id) navigate(`/risk-officer/risks/${createdRisk.id}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <h1 className="text-xl font-bold text-slate-800">Risk Register</h1>
        <p className="mt-0.5 text-sm text-slate-500">{risks.length} risks tracked</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-full flex-col overflow-hidden">
          <RiskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onSearch={handleSearch}
          />
<RiskList
  risks={risks}
  loading={loading}
  onSelectRisk={handleSelectRisk}
  selectedId={selectedId}
  onRiskUpdated={handleRiskUpdated}
  onToast={showToast}
/>

{toast && (
  <div
    className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-xl ${
      toast.type === "error" ? "bg-red-600" : "bg-slate-900"
    }`}
  >
    {toast.message}
  </div>
)}
        </div>
      </div>

      <FloatingAddButton onClick={openWizard} />

      {isOpen && <CreateRiskWizard onClose={closeWizard} onCreated={handleCreated} />}
    </div>
  );
}

export default function RiskRegister() {
  return (
    <RiskCreationProvider>
      <RiskRegisterInner />
    </RiskCreationProvider>
  );
}