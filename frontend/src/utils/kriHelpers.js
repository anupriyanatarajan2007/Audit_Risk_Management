// Centralized so both the modal and the table parse the same way — 
// this alone kills most of the "NaN sent to backend" bugs.

export const toNumberOrNull = (val) => {
  if (val === "" || val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
};

export const toInputValue = (val) => (val === null || val === undefined ? "" : val);

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const readableEnum = (val) =>
  val ? val.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "—";