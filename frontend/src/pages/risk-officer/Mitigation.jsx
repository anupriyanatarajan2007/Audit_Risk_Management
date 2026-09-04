// src/pages/riskOfficer/Mitigation.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import MitigationService from "../../service/MitigationService";
import MitigationDashboard from "../../components/riskOfficer/mitigation/MitigationDashboard";
import MitigationFilters from "../../components/riskOfficer/mitigation/MitigationFilters";
import MitigationKanban from "../../components/riskOfficer/mitigation/MitigationKanban";
import MitigationTable from "../../components/riskOfficer/mitigation/MitigationTable";
import MitigationTimeline from "../../components/riskOfficer/mitigation/MitigationTimeline";
import MitigationForm from "../../components/riskOfficer/mitigation/MitigationForm";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { isOverdue } from "../../utils/mitigationConstants";

const DEFAULT_FILTERS = { search: "", status: "ALL", type: "ALL", overdueOnly: false };

export default function Mitigation() {
  const toast = useToast();

  const [mitigations, setMitigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState("dashboard"); // dashboard | kanban | table
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [selected, setSelected] = useState(null); // drill-in timeline
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMitigations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MitigationService.getAllMitigations();
      setMitigations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load mitigations. Please retry.");
      toast.error("Failed to load mitigations");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMitigations();
  }, [loadMitigations]);

  const counts = useMemo(() => {
    const c = { total: mitigations.length, planned: 0, inProgress: 0, completed: 0, cancelled: 0, overdue: 0 };
    mitigations.forEach((m) => {
      if (m.status === "PLANNED") c.planned++;
      if (m.status === "IN_PROGRESS") c.inProgress++;
      if (m.status === "COMPLETED") c.completed++;
      if (m.status === "CANCELLED") c.cancelled++;
      if (isOverdue(m)) c.overdue++;
    });
    return c;
  }, [mitigations]);

  const filtered = useMemo(() => {
    return mitigations.filter((m) => {
      if (filters.status !== "ALL" && m.status !== filters.status) return false;
      if (filters.type !== "ALL" && m.mitigationType !== filters.type) return false;
      if (filters.overdueOnly && !isOverdue(m)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${m.mitigationTitle ?? ""} ${m.riskTitle ?? ""} ${m.ownerName ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [mitigations, filters]);

  const getId = (m) => m?.mitigationId ?? m?.id;

  // ---- Status change (kanban drag, table action, timeline buttons) ----
  const handleStatusChange = async (mitigationOrId, newStatus) => {
    const mitigation =
      typeof mitigationOrId === "object"
        ? mitigationOrId
        : mitigations.find((m) => getId(m) === mitigationOrId);
  
    if (!mitigation || mitigation.status === newStatus) return;
  
    const id = getId(mitigation);
  
    console.log("Mitigation Object:", mitigation);
    console.log("ID Sent:", id);
    console.log("Status:", newStatus);
  
    setStatusUpdating(true);
  
    try {
      const updated =
        newStatus === "COMPLETED"
          ? await MitigationService.completeMitigation(id)
          : await MitigationService.updateStatus(id, newStatus);
  
      console.log("Update Response:", updated);
  
      setMitigations((prev) =>
        prev.map((m) =>
          getId(m) === id ? { ...m, ...updated, status: newStatus } : m
        )
      );
  
      setSelected((prev) =>
        prev && getId(prev) === id
          ? { ...prev, ...updated, status: newStatus }
          : prev
      );
  
      toast.success(`Mitigation moved to ${newStatus}`);
    } catch (err) {
      console.error("Status Update Error:", err);
      console.error("Response:", err.response?.data);
  
      toast.error("Status update failed");
    } finally {
      setStatusUpdating(false);
    }
  };

  // ---- Create / Edit ----
  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };
  const openEdit = (m) => {
    setEditTarget(m);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editTarget) {
        const id = getId(editTarget);
        const updated = await MitigationService.updateMitigation(id, payload);
        setMitigations((prev) => prev.map((m) => (getId(m) === id ? { ...m, ...updated } : m)));
        toast.success("Mitigation updated");
      } else {
        const created = await MitigationService.createMitigation(payload);
        setMitigations((prev) => [created, ...prev]);
        toast.success("Mitigation created");
      }
      console.log("Submitting Payload:", payload);

      setFormOpen(false);
      setEditTarget(null);
    } catch (err) {
      console.log(err.response);
      console.log(err.response?.status);
      console.log(err.response?.data);
    
      toast.error("Could not save mitigation");
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await MitigationService.deleteMitigation(getId(deleteTarget));
      setMitigations((prev) => prev.filter((m) => getId(m) !== getId(deleteTarget)));
      toast.success("Mitigation deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ---- Drill-in ----
  if (selected) {
    return (
      <div className="p-6">
        <MitigationTimeline
          mitigation={selected}
          onBack={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          updating={statusUpdating}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mitigation Management & Tracking</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track control implementation from planning through closure.</p>
      </div>

      <MitigationDashboard counts={counts} loading={loading} />

      <MitigationFilters
        filters={filters}
        onFilterChange={setFilters}
        view={view}
        onViewChange={setView}
        onCreateClick={openCreate}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-700">{error}</p>
          <button onClick={loadMitigations} className="mt-3 text-sm font-semibold text-rose-700 underline">
            Retry
          </button>
        </div>
      ) : view === "table" ? (
        <MitigationTable
          mitigations={filtered}
          loading={loading}
          onView={setSelected}
          onEdit={openEdit}
          onChangeStatus={setSelected}
          onDelete={setDeleteTarget}
        />
      ) : view === "kanban" ? (
        <MitigationKanban mitigations={filtered} onCardClick={setSelected} onStatusChange={handleStatusChange} />
      ) : (
        <MitigationKanban mitigations={filtered} onCardClick={setSelected} onStatusChange={handleStatusChange} />
      )}

      <MitigationForm
        open={formOpen}
        initialData={editTarget}
        saving={saving}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete this mitigation?"
        description={`"${deleteTarget?.mitigationTitle}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}