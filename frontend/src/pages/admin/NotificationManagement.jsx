import { useEffect, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Settings,
  ChevronRight,
  Info,
} from "lucide-react";

import notificationConfigurationService from "../../service/notificationConfigurationService";

const NotificationManagement = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [config, setConfig] = useState({
    id: null,
    inAppNotificationsEnabled: true,
  });

  const [originalConfig, setOriginalConfig] = useState(null);

  // =========================================================
  // LOAD CONFIGURATION
  // =========================================================

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response =
        await notificationConfigurationService.getConfiguration();

      console.log("Notification Configuration:", response);

      const data = response?.data || response;

      /*
       * Only use the backend functionality that is currently
       * implemented by NotificationServiceImpl:
       *
       * inAppNotificationsEnabled
       */

      const cleanedConfig = {
        id: data?.id ?? null,
        inAppNotificationsEnabled:
          data?.inAppNotificationsEnabled ?? true,
      };

      setConfig(cleanedConfig);
      setOriginalConfig(cleanedConfig);
    } catch (error) {
      console.error(
        "Error loading notification configuration:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Unable to load notification configuration."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TOGGLE IN-APP
  // =========================================================

  const handleToggle = () => {
    setConfig((previous) => ({
      ...previous,
      inAppNotificationsEnabled:
        !previous.inAppNotificationsEnabled,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      /*
       * IMPORTANT
       *
       * Frontend only sends the functionality we are actually
       * using: In-App Notifications.
       *
       * However, if your backend RequestDTO still requires
       * the other Boolean fields, we preserve them as their
       * existing values without displaying them in the UI.
       */

      const requestData = {
        emailNotificationsEnabled: true,

        inAppNotificationsEnabled:
          Boolean(config.inAppNotificationsEnabled),

        auditNotificationsEnabled: true,

        riskNotificationsEnabled: true,

        complianceNotificationsEnabled: true,

        reminderNotificationsEnabled: true,

        reminderDaysBeforeDue: 7,
      };

      console.log(
        "Sending Notification Configuration:",
        requestData
      );

      const response =
        await notificationConfigurationService.updateConfiguration(
          requestData
        );

      console.log(
        "Updated Notification Configuration:",
        response
      );

      const updatedData = response?.data || response;

      const cleanedConfig = {
        id: updatedData?.id ?? config.id ?? null,
        inAppNotificationsEnabled:
          updatedData?.inAppNotificationsEnabled ??
          config.inAppNotificationsEnabled,
      };

      setConfig(cleanedConfig);
      setOriginalConfig(cleanedConfig);

      setSuccessMessage(
        "In-app notification configuration updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating notification configuration:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Unable to update notification configuration."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    if (originalConfig) {
      setConfig({
        ...originalConfig,
      });
    }

    setSuccessMessage("");
    setErrorMessage("");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse">
            <div className="h-8 w-80 rounded-lg bg-gray-200" />

            <div className="mt-3 h-4 w-[500px] max-w-full rounded bg-gray-200" />

            <div className="mt-8 h-48 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Settings
              size={16}
              className="text-teal-600"
            />

            <span>Administration</span>

            <ChevronRight size={14} />

            <span className="font-medium text-gray-700">
              Notification Management
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Notification Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Manage in-app notification availability for
                the Audit & Risk Management System.
              </p>
            </div>

            {/* ACTIVE STATUS */}

            <div className="flex w-fit items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                <Bell
                  size={19}
                  className="text-teal-600"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  In-App Notifications
                </p>

                <p
                  className={`text-sm font-bold ${
                    config.inAppNotificationsEnabled
                      ? "text-emerald-600"
                      : "text-gray-500"
                  }`}
                >
                  {config.inAppNotificationsEnabled
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <CheckCircle2
              size={20}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-700">
              {successMessage}
            </span>
          </div>
        )}

        {/* =====================================================
            ERROR MESSAGE
        ====================================================== */}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <AlertCircle
              size={20}
              className="text-red-600"
            />

            <span className="text-sm font-semibold text-red-700">
              {errorMessage}
            </span>
          </div>
        )}

        {/* =====================================================
            DELIVERY CHANNEL
        ====================================================== */}

        <section className="mb-8">
          <SectionHeader
            icon={Bell}
            title="Notification Delivery"
            description="Control whether notifications are displayed inside the application."
          />

          <NotificationCard
            icon={LayoutDashboard}
            title="In-App Notifications"
            description="Display notification alerts directly within the Audit & Risk Management System."
            enabled={config.inAppNotificationsEnabled}
            onToggle={handleToggle}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
          />
        </section>

        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <section className="mb-8">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                <Info
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-blue-900">
                  In-App Notifications
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  When enabled, users can receive notifications
                  inside the application. Notifications contain
                  a sender, receiver, title, message and read/unread
                  status.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CURRENT CONFIGURATION
        ====================================================== */}

        <section className="mb-8">
          <SectionHeader
            icon={Bell}
            title="Current Configuration"
            description="Current status of the supported notification channel."
          />

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <StatusItem
              title="In-App Notifications"
              enabled={config.inAppNotificationsEnabled}
            />
          </div>
        </section>

        {/* =====================================================
            ACTION BAR
        ====================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-gray-800">
              Notification Configuration
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Save your changes to update the in-app notification setting.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RotateCcw size={16} />

              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================
// NOTIFICATION CARD
// =============================================================

const NotificationCard = ({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon
              size={23}
              className={iconColor}
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-800">
              {title}
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              {description}
            </p>
          </div>
        </div>

        {/* TOGGLE */}

        <button
          type="button"
          onClick={onToggle}
          aria-label={`Toggle ${title}`}
          aria-pressed={enabled}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${
            enabled
              ? "bg-teal-600"
              : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
              enabled
                ? "left-6"
                : "left-1"
            }`}
          />
        </button>
      </div>

      {/* STATUS */}

      <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
        <span
          className={`h-2 w-2 rounded-full ${
            enabled
              ? "bg-emerald-500"
              : "bg-gray-300"
          }`}
        />

        <span
          className={`text-xs font-semibold ${
            enabled
              ? "text-emerald-600"
              : "text-gray-400"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
    </div>
  );
};

// =============================================================
// STATUS ITEM
// =============================================================

const StatusItem = ({
  title,
  enabled,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            enabled
              ? "bg-emerald-500"
              : "bg-gray-300"
          }`}
        />

        <span className="text-sm font-semibold text-gray-700">
          {title}
        </span>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-bold ${
          enabled
            ? "bg-emerald-50 text-emerald-600"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </div>
  );
};

// =============================================================
// SECTION HEADER
// =============================================================

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
        <Icon
          size={19}
          className="text-teal-600"
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default NotificationManagement;