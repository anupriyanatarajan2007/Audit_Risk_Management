import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiRefreshCw, FiBell } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

import NotificationService from "../../service/NotificationService";

import NotificationStatsCards from "../../components/riskOfficer/notification/NotificationStatsCards";
import NotificationFilters from "../../components/riskOfficer/notification/NotificationFilters";
import NotificationTable from "../../components/riskOfficer/notification/NotificationTable";
import NotificationFormModal from "../../components/riskOfficer/notification/NotificationFormModal";
import NotificationViewDrawer from "../../components/riskOfficer/notification/NotificationViewDrawer";

import { getAllUsers, getProfile } from "../../service/AuthService";

import {
  getStatusKey,
  isToday,
} from "../../constants/NotificationEnums";

export default function NotificationDashboard() {
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [receiverSearch, setReceiverSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  // =========================================================
  // Fetch Notifications
  // =========================================================

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await NotificationService.getNotifications();

      const notificationData = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];

      setNotifications(
        Array.isArray(notificationData) ? notificationData : []
      );
    } catch (err) {
      console.error("Notification fetch error:", err);

      setError(
        "Failed to load notifications. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // Fetch Users
  // =========================================================

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();

      const userData = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];

      /*
       * Backend may return:
       *
       * department: {
       *   id: 1,
       *   name: "INFORMATION_TECHNOLOGY",
       *   active: true
       * }
       *
       * role: {
       *   id: 2,
       *   name: "RISK_OFFICER",
       *   active: true
       * }
       *
       * Normalize them so child components can safely display
       * department and role.
       */

      const normalizedUsers = Array.isArray(userData)
        ? userData.map((user) => ({
            ...user,

            department:
              typeof user.department === "object"
                ? user.department?.name ?? ""
                : user.department ?? "",

            role:
              typeof user.role === "object"
                ? user.role?.name ?? ""
                : user.role ?? "",

            // Keep original objects too, if needed by child components
            departmentEntity:
              typeof user.department === "object"
                ? user.department
                : null,

            roleEntity:
              typeof user.role === "object"
                ? user.role
                : null,
          }))
        : [];

      console.log("RAW USERS RESPONSE:", userData);
      console.log("NORMALIZED USERS:", normalizedUsers);

      setUsers(normalizedUsers);
    } catch (err) {
      console.error("Users fetch error:", err);

      // Non-fatal — send modal can still open.
      toast.error("Could not load users for recipient search");
      setUsers([]);
    }
  }, []);

  // =========================================================
  // Fetch Current User
  // =========================================================

  const fetchCurrentUser = useCallback(async () => {
    try {
      const profile = await getProfile();

      setCurrentUserEmail(profile?.email ?? "");
    } catch (err) {
      console.error("Current user profile error:", err);

      // Non-fatal — From field can remain blank.
      setCurrentUserEmail("");
    }
  }, []);

  // =========================================================
  // Initial Load
  // =========================================================

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
    fetchCurrentUser();
  }, [
    fetchNotifications,
    fetchUsers,
    fetchCurrentUser,
  ]);

  // =========================================================
  // Filter Notifications
  // =========================================================

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const title =
        typeof n.title === "string"
          ? n.title
          : "";

      const receiverName =
        typeof n.receiverName === "string"
          ? n.receiverName
          : "";

      const receiverEmail =
        typeof n.receiverEmail === "string"
          ? n.receiverEmail
          : "";

      const matchesSearch =
        !search ||
        title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesReceiver =
        !receiverSearch ||
        `${receiverName} ${receiverEmail}`
          .toLowerCase()
          .includes(receiverSearch.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        getStatusKey(n) === statusFilter;

      const created = n.createdAt
        ? new Date(n.createdAt)
        : null;

      const matchesDate =
        !dateFilter ||
        (created &&
          !Number.isNaN(created.getTime()) &&
          created.toISOString().slice(0, 10) === dateFilter);

      return (
        matchesSearch &&
        matchesReceiver &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    notifications,
    search,
    receiverSearch,
    statusFilter,
    dateFilter,
  ]);

  // =========================================================
  // Statistics
  // =========================================================

  const stats = useMemo(
    () => ({
      total: notifications.length,

      unread: notifications.filter(
        (n) => !n.read
      ).length,

      read: notifications.filter(
        (n) => n.read
      ).length,

      sentToday: notifications.filter(
        (n) => isToday(n.createdAt)
      ).length,
    }),
    [notifications]
  );

  // =========================================================
  // Filters
  // =========================================================

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(receiverSearch) ||
    Boolean(statusFilter) ||
    Boolean(dateFilter);

  const clearFilters = () => {
    setSearch("");
    setReceiverSearch("");
    setStatusFilter("");
    setDateFilter("");
  };

  // =========================================================
  // Mark Notification as Read
  // =========================================================

  const handleMarkRead = async (notification) => {
    if (!notification?.id) {
      return;
    }

    setActioningId(notification.id);

    try {
      await NotificationService.markAsRead(
        notification.id
      );

      toast.success("Marked as read");

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                read: true,
              }
            : n
        )
      );

      setViewingNotification((prev) =>
        prev?.id === notification.id
          ? {
              ...prev,
              read: true,
            }
          : prev
      );
    } catch (err) {
      console.error(
        "Mark notification read error:",
        err
      );

      toast.error("Failed to mark as read");
    } finally {
      setActioningId(null);
    }
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 p-6">
      <Toaster position="top-right" />

      {/* =====================================================
          Header
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-xs font-medium text-indigo-400">
            Audit &amp; Risk Management / Notifications
          </p>

          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
            <FiBell className="text-indigo-500" />

            Notification Center
          </h1>

          <p className="text-sm text-slate-400">
            {stats.total} total · {stats.unread} unread
          </p>
        </div>

        <div className="flex gap-2">
          {/* Refresh */}

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          {/* Send Notification */}

          <motion.button
            whileTap={{
              scale: 0.96,
            }}
            onClick={() =>
              setModalOpen(true)
            }
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <FiPlus size={14} />

            Send Notification
          </motion.button>
        </div>
      </motion.div>

      {/* =====================================================
          Statistics
      ===================================================== */}

      <NotificationStatsCards
        stats={stats}
        loading={loading}
      />

      {/* =====================================================
          Filters
      ===================================================== */}

      <NotificationFilters
        search={search}
        onSearch={setSearch}
        receiverSearch={receiverSearch}
        onReceiverSearch={setReceiverSearch}
        statusFilter={statusFilter}
        onStatus={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilter={setDateFilter}
        showFilters={showFilters}
        onToggleFilters={() =>
          setShowFilters((s) => !s)
        }
        hasActive={hasActiveFilters}
        onClear={clearFilters}
      />

      {/* =====================================================
          Notification Table
      ===================================================== */}

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-600">
          {error}

          <button
            onClick={fetchNotifications}
            className="ml-3 font-medium underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <NotificationTable
          notifications={filtered}
          loading={loading}
          actioningId={actioningId}
          onView={setViewingNotification}
          onMarkRead={handleMarkRead}
        />
      )}

      {/* =====================================================
          Send Notification Modal
      ===================================================== */}

      <NotificationFormModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSent={fetchNotifications}
        users={users}
        currentUserEmail={currentUserEmail}
      />

      {/* =====================================================
          Notification View Drawer
      ===================================================== */}

      <NotificationViewDrawer
        notification={viewingNotification}
        onClose={() =>
          setViewingNotification(null)
        }
        onMarkRead={handleMarkRead}
        actionLoading={
          actioningId ===
          viewingNotification?.id
        }
      />
    </div>
  );
}
