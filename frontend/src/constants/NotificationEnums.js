// ⚠️ Your NotificationService doesn't expose a status enum — markAsRead/getUnreadCount
// imply a boolean `read` field on each notification. If your backend actually returns
// a string status (e.g. "READ"/"UNREAD"), tell me and I'll switch this to an enum lookup.

export const STATUS_META = {
  UNREAD: { label: "Unread", bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", dot: "bg-blue-500" },
  READ:   { label: "Read",   bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" }
};

export const getStatusKey = (notification) => (notification.read ? "READ" : "UNREAD");

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};