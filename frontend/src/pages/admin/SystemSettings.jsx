
import React, { useEffect, useMemo, useState } from "react";

import {
    getSystemSettings,
    updateSystemSettings,
} from "../../service/systemSettingsService";

import {
    Settings,
    Save,
    RefreshCw,
    Clock,
    Calendar,
    ShieldCheck,
    LockKeyhole,
    Database,
    Wrench,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Timer,
    LogIn,
    KeyRound,
    Globe,
    Info,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";


// =========================================================
// DEFAULT SETTINGS
// =========================================================

const DEFAULT_SETTINGS = {
    systemName: "Audit & Risk Management System",
    timezone: "Asia/Kolkata",
    dateFormat: "dd-MM-yyyy",
    maintenanceMode: false,
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
    enableAuditLogs: true,
};


// =========================================================
// PRESETS
// =========================================================

const SESSION_PRESETS = [15, 30, 60, 120, 240];

const LOGIN_PRESETS = [3, 5, 10, 15];

const PASSWORD_PRESETS = [30, 60, 90, 180, 365];


// =========================================================
// TIMEZONE OPTIONS
// =========================================================

const TIMEZONE_OPTIONS = [
    {
        value: "Asia/Kolkata",
        label: "India Standard Time",
        short: "Asia/Kolkata (IST)",
    },
    {
        value: "UTC",
        label: "Coordinated Universal Time",
        short: "UTC",
    },
    {
        value: "Asia/Dubai",
        label: "Gulf Standard Time",
        short: "Asia/Dubai (GST)",
    },
    {
        value: "Asia/Singapore",
        label: "Singapore Standard Time",
        short: "Asia/Singapore (SGT)",
    },
    {
        value: "Europe/London",
        label: "United Kingdom",
        short: "Europe/London (GMT/BST)",
    },
    {
        value: "America/New_York",
        label: "Eastern Time",
        short: "America/New_York (ET)",
    },
    {
        value: "America/Los_Angeles",
        label: "Pacific Time",
        short: "America/Los_Angeles (PT)",
    },
];


// =========================================================
// DATE FORMAT OPTIONS
// =========================================================

const DATE_FORMAT_OPTIONS = [
    {
        value: "dd-MM-yyyy",
        label: "DD-MM-YYYY",
        example: "04-09-2026",
    },
    {
        value: "MM-dd-yyyy",
        label: "MM-DD-YYYY",
        example: "09-04-2026",
    },
    {
        value: "yyyy-MM-dd",
        label: "YYYY-MM-DD",
        example: "2026-09-04",
    },
    {
        value: "dd/MM/yyyy",
        label: "DD/MM/YYYY",
        example: "04/09/2026",
    },
];


// =========================================================
// COMPONENT
// =========================================================

const SystemSettings = () => {

    // =========================================================
    // STATE
    // =========================================================

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [activeSection, setActiveSection] = useState("general");


    // =========================================================
    // LOAD SETTINGS
    // =========================================================

    const loadSettings = async () => {

        try {

            setLoading(true);

            setError("");

            const data = await getSystemSettings();

            console.log("SYSTEM SETTINGS RESPONSE:", data);

            setSettings({
                systemName:
                    data?.systemName ??
                    DEFAULT_SETTINGS.systemName,

                timezone:
                    data?.timezone ??
                    DEFAULT_SETTINGS.timezone,

                dateFormat:
                    data?.dateFormat ??
                    DEFAULT_SETTINGS.dateFormat,

                maintenanceMode:
                    data?.maintenanceMode ??
                    DEFAULT_SETTINGS.maintenanceMode,

                sessionTimeoutMinutes:
                    data?.sessionTimeoutMinutes ??
                    DEFAULT_SETTINGS.sessionTimeoutMinutes,

                maxLoginAttempts:
                    data?.maxLoginAttempts ??
                    DEFAULT_SETTINGS.maxLoginAttempts,

                passwordExpiryDays:
                    data?.passwordExpiryDays ??
                    DEFAULT_SETTINGS.passwordExpiryDays,

                enableAuditLogs:
                    data?.enableAuditLogs ??
                    DEFAULT_SETTINGS.enableAuditLogs,
            });

        } catch (err) {

            console.error(
                "Failed to load system settings:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to load system settings"
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadSettings();

    }, []);


    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setSettings((prev) => ({
            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                        ? Number(value)
                        : value,
        }));

        setMessage("");

        setError("");
    };


    // =========================================================
    // NUMBER SETTER
    // =========================================================

    const setNumberValue = (name, value) => {

        setSettings((prev) => ({
            ...prev,
            [name]: Number(value),
        }));

        setMessage("");

        setError("");
    };


    // =========================================================
    // UPDATE SETTINGS
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        // -----------------------------------------------------
        // FRONTEND VALIDATION
        // -----------------------------------------------------

        if (
            !settings.systemName ||
            !settings.systemName.trim()
        ) {

            setError("System name is required.");

            return;
        }

        if (
            !settings.sessionTimeoutMinutes ||
            settings.sessionTimeoutMinutes <= 0
        ) {

            setError(
                "Session timeout must be greater than 0 minutes."
            );

            return;
        }

        if (
            !settings.maxLoginAttempts ||
            settings.maxLoginAttempts <= 0
        ) {

            setError(
                "Maximum login attempts must be greater than 0."
            );

            return;
        }

        if (
            !settings.passwordExpiryDays ||
            settings.passwordExpiryDays <= 0
        ) {

            setError(
                "Password expiry must be greater than 0 days."
            );

            return;
        }

        try {

            setSaving(true);

            setMessage("");

            setError("");

            console.log(
                "UPDATING SYSTEM SETTINGS:",
                settings
            );

            await updateSystemSettings(settings);

            setMessage(
                "System settings updated successfully."
            );

            // Reload from backend so UI shows the actual
            // saved database values.

            await loadSettings();

        } catch (err) {

            console.error(
                "Failed to update settings:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to update system settings"
            );

        } finally {

            setSaving(false);

        }
    };


    // =========================================================
    // DATE FORMAT PREVIEW
    // =========================================================

    const selectedDateFormat = useMemo(() => {

        return DATE_FORMAT_OPTIONS.find(
            (item) =>
                item.value === settings.dateFormat
        );

    }, [settings.dateFormat]);


    // =========================================================
    // TIMEZONE LABEL
    // =========================================================

    const selectedTimezone = useMemo(() => {

        return TIMEZONE_OPTIONS.find(
            (item) =>
                item.value === settings.timezone
        );

    }, [settings.timezone]);


    // =========================================================
    // RESET TO DEFAULTS
    // =========================================================

    const resetToDefaults = () => {

        setSettings({
            ...DEFAULT_SETTINGS,
        });

        setMessage("");

        setError("");
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center">

                        <Loader2
                            size={32}
                            className="text-teal-600 animate-spin"
                        />

                    </div>

                    <p className="mt-4 text-slate-600 font-medium">
                        Loading system settings...
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Reading configuration from database
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="min-h-screen bg-slate-50">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="bg-white border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-6 py-5">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">

                                <Settings size={25} />

                            </div>

                            <div>

                                <h1 className="text-2xl font-bold text-slate-800">

                                    System Settings

                                </h1>

                                <p className="text-sm text-slate-500 mt-1">

                                    Configure global system behavior and security policies

                                </p>

                            </div>

                        </div>


                        <div className="flex items-center gap-3">

                            <button
                                type="button"
                                onClick={resetToDefaults}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
                            >
                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={loadSettings}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition"
                            >

                                <RefreshCw
                                    size={17}
                                    className={
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh

                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="max-w-7xl mx-auto px-6 py-8">


                {/* =================================================
                    ALERTS
                ================================================= */}

                <AnimatePresence>

                    {message && (

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl"
                        >

                            <CheckCircle2 size={20} />

                            <span className="font-medium">
                                {message}
                            </span>

                        </motion.div>

                    )}

                </AnimatePresence>


                {error && (

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl"
                    >

                        <AlertTriangle
                            size={20}
                            className="mt-0.5 shrink-0"
                        />

                        <span className="font-medium">
                            {error}
                        </span>

                    </motion.div>

                )}


                {/* =================================================
                    QUICK OVERVIEW
                ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="relative overflow-hidden bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-600 rounded-3xl p-7 text-white shadow-lg mb-7"
                >

                    <div className="absolute right-[-70px] top-[-100px] w-72 h-72 bg-white/10 rounded-full" />

                    <div className="absolute left-[-80px] bottom-[-120px] w-80 h-80 bg-white/5 rounded-full" />


                    <div className="relative">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                            <div>

                                <div className="flex items-center gap-3">

                                    <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">

                                        <Activity size={23} />

                                    </div>

                                    <div>

                                        <p className="text-teal-200 text-sm">
                                            System Configuration
                                        </p>

                                        <h2 className="text-xl font-bold">
                                            {settings.systemName}
                                        </h2>

                                    </div>

                                </div>

                                <p className="mt-4 text-sm text-teal-100 max-w-2xl">

                                    Changes made here are stored in the database
                                    and used by the application's authentication,
                                    session, password and audit logging services.

                                </p>

                            </div>


                            <div className="flex flex-wrap gap-3">

                                <StatusPill
                                    enabled={!settings.maintenanceMode}
                                    enabledText="System Operational"
                                    disabledText="Maintenance Mode"
                                />

                                <StatusPill
                                    enabled={settings.enableAuditLogs}
                                    enabledText="Audit Logs ON"
                                    disabledText="Audit Logs OFF"
                                />

                            </div>

                        </div>


                        {/* QUICK VALUES */}

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">

                            <OverviewItem
                                icon={<Clock size={17} />}
                                label="Session"
                                value={`${settings.sessionTimeoutMinutes} min`}
                            />

                            <OverviewItem
                                icon={<LogIn size={17} />}
                                label="Login Attempts"
                                value={settings.maxLoginAttempts}
                            />

                            <OverviewItem
                                icon={<KeyRound size={17} />}
                                label="Password Expiry"
                                value={`${settings.passwordExpiryDays} days`}
                            />

                            <OverviewItem
                                icon={<Globe size={17} />}
                                label="Timezone"
                                value={
                                    selectedTimezone?.short ||
                                    settings.timezone
                                }
                            />

                        </div>

                    </div>

                </motion.div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form onSubmit={handleSubmit}>


                    {/* =================================================
                        GENERAL SETTINGS
                    ================================================= */}

                    <SectionCard
                        icon={<Settings size={20} />}
                        title="General Settings"
                        description="Configure basic system information, timezone and date display."
                    >

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                            {/* SYSTEM NAME */}

                            <div className="md:col-span-2">

                                <label className="block text-sm font-semibold text-slate-700 mb-2">

                                    System Name

                                </label>

                                <input
                                    type="text"
                                    name="systemName"
                                    value={settings.systemName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter system name"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                                />

                                <p className="text-xs text-slate-400 mt-2">

                                    This name is used to identify the application.

                                </p>

                            </div>


                            {/* TIMEZONE */}

                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">

                                    Timezone

                                </label>

                                <div className="relative">

                                    <Globe
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />

                                    <select
                                        name="timezone"
                                        value={settings.timezone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                                    >

                                        {TIMEZONE_OPTIONS.map(
                                            (timezone) => (

                                                <option
                                                    key={timezone.value}
                                                    value={timezone.value}
                                                >
                                                    {timezone.short}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                <p className="text-xs text-slate-400 mt-2">

                                    {selectedTimezone?.label ||
                                        settings.timezone}

                                </p>

                            </div>


                            {/* DATE FORMAT */}

                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">

                                    Date Format

                                </label>

                                <div className="relative">

                                    <Calendar
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />

                                    <select
                                        name="dateFormat"
                                        value={settings.dateFormat}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                                    >

                                        {DATE_FORMAT_OPTIONS.map(
                                            (format) => (

                                                <option
                                                    key={format.value}
                                                    value={format.value}
                                                >
                                                    {format.label}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">

                                    <Info size={13} />

                                    Example:{" "}

                                    <span className="font-semibold text-slate-600">
                                        {selectedDateFormat?.example ||
                                            "04-09-2026"}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </SectionCard>


                    {/* =================================================
                        SECURITY SETTINGS
                    ================================================= */}

                    <SectionCard
                        icon={<LockKeyhole size={20} />}
                        title="Security Settings"
                        description="Control authentication, session timeout and password policies."
                        delay={0.1}
                    >

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                            {/* SESSION TIMEOUT */}

                            <NumberSetting
                                icon={<Timer size={19} />}
                                title="Session Timeout"
                                description="JWT session duration"
                                name="sessionTimeoutMinutes"
                                value={settings.sessionTimeoutMinutes}
                                min={1}
                                suffix="minutes"
                                onChange={handleChange}
                                presets={SESSION_PRESETS}
                                onPreset={(value) =>
                                    setNumberValue(
                                        "sessionTimeoutMinutes",
                                        value
                                    )
                                }
                            />


                            {/* LOGIN ATTEMPTS */}

                            <NumberSetting
                                icon={<LogIn size={19} />}
                                title="Maximum Login Attempts"
                                description="Failed attempts before account lock"
                                name="maxLoginAttempts"
                                value={settings.maxLoginAttempts}
                                min={1}
                                suffix="attempts"
                                onChange={handleChange}
                                presets={LOGIN_PRESETS}
                                onPreset={(value) =>
                                    setNumberValue(
                                        "maxLoginAttempts",
                                        value
                                    )
                                }
                            />


                            {/* PASSWORD EXPIRY */}

                            <NumberSetting
                                icon={<KeyRound size={19} />}
                                title="Password Expiry"
                                description="Days before password expires"
                                name="passwordExpiryDays"
                                value={settings.passwordExpiryDays}
                                min={1}
                                suffix="days"
                                onChange={handleChange}
                                presets={PASSWORD_PRESETS}
                                onPreset={(value) =>
                                    setNumberValue(
                                        "passwordExpiryDays",
                                        value
                                    )
                                }
                            />

                        </div>


                        {/* SECURITY INFO */}

                        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">

                            <Info
                                size={19}
                                className="text-blue-600 mt-0.5 shrink-0"
                            />

                            <div>

                                <p className="text-sm font-semibold text-blue-800">
                                    Security policy
                                </p>

                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">

                                    Session timeout controls JWT expiration.
                                    Maximum login attempts controls account
                                    locking after repeated failed passwords.
                                    Password expiry controls how long a user's
                                    password remains valid.

                                </p>

                            </div>

                        </div>

                    </SectionCard>


                    {/* =================================================
                        SYSTEM OPERATIONS
                    ================================================= */}

                    <SectionCard
                        icon={<Wrench size={20} />}
                        title="System Operations"
                        description="Control maintenance mode and audit logging."
                        delay={0.2}
                    >

                        <div className="space-y-4">


                            {/* MAINTENANCE */}

                            <ToggleSetting
                                icon={<Wrench size={21} />}
                                iconBg="bg-amber-50"
                                iconColor="text-amber-600"
                                title="Maintenance Mode"
                                description="Temporarily restrict normal system login and operations."
                                checked={settings.maintenanceMode}
                                onChange={handleChange}
                                name="maintenanceMode"
                                enabledText="Maintenance mode is ON"
                                disabledText="System is operating normally"
                            />


                            {/* AUDIT LOGS */}

                            <ToggleSetting
                                icon={<Database size={21} />}
                                iconBg="bg-teal-50"
                                iconColor="text-teal-600"
                                title="Audit Logs"
                                description="Record user and system activities for auditing."
                                checked={settings.enableAuditLogs}
                                onChange={handleChange}
                                name="enableAuditLogs"
                                enabledText="Audit logging is enabled"
                                disabledText="Audit logging is disabled"
                            />

                        </div>

                    </SectionCard>


                    {/* =================================================
                        CURRENT CONFIGURATION
                    ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.25,
                        }}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-8"
                    >

                        <div className="px-6 py-5 border-b border-slate-100">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">

                                    <ShieldCheck size={20} />

                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-slate-800">

                                        Current Configuration

                                    </h2>

                                    <p className="text-sm text-slate-500">

                                        Review the values currently selected before saving.

                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


                            <SummaryItem
                                icon={<Clock size={18} />}
                                title="Session Timeout"
                                value={`${settings.sessionTimeoutMinutes} minutes`}
                            />


                            <SummaryItem
                                icon={<LogIn size={18} />}
                                title="Login Attempts"
                                value={`${settings.maxLoginAttempts} attempts`}
                            />


                            <SummaryItem
                                icon={<KeyRound size={18} />}
                                title="Password Expiry"
                                value={`${settings.passwordExpiryDays} days`}
                            />


                            <SummaryItem
                                icon={<Calendar size={18} />}
                                title="Date Format"
                                value={
                                    selectedDateFormat?.label ||
                                    settings.dateFormat
                                }
                            />


                            <SummaryItem
                                icon={<Globe size={18} />}
                                title="Timezone"
                                value={
                                    selectedTimezone?.short ||
                                    settings.timezone
                                }
                            />


                            <SummaryItem
                                icon={<Database size={18} />}
                                title="Audit Logs"
                                value={
                                    settings.enableAuditLogs
                                        ? "Enabled"
                                        : "Disabled"
                                }
                            />


                            <SummaryItem
                                icon={<Wrench size={18} />}
                                title="Maintenance"
                                value={
                                    settings.maintenanceMode
                                        ? "Enabled"
                                        : "Disabled"
                                }
                            />


                            <SummaryItem
                                icon={<Settings size={18} />}
                                title="System Name"
                                value={settings.systemName}
                            />

                        </div>

                    </motion.div>


                    {/* =================================================
                        SAVE BAR
                    ================================================= */}

                    <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-xl p-4">

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                            <div className="flex items-start gap-3">

                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">

                                    <Save size={19} />

                                </div>

                                <div>

                                    <p className="text-sm font-semibold text-slate-800">

                                        Save System Configuration

                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">

                                        Changes will affect system-wide behavior.

                                    </p>

                                </div>

                            </div>


                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full lg:w-auto min-w-[180px] flex items-center justify-center gap-2 px-7 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition"
                            >

                                {saving ? (

                                    <>

                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Saving...

                                    </>

                                ) : (

                                    <>

                                        <Save size={18} />

                                        Save Changes

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </form>

            </main>

        </div>
    );
};


// =========================================================
// SECTION CARD
// =========================================================

const SectionCard = ({
    icon,
    title,
    description,
    children,
    delay = 0,
}) => {

    return (

        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                delay,
            }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden"
        >

            <div className="px-6 py-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">

                        {icon}

                    </div>

                    <div>

                        <h2 className="text-lg font-bold text-slate-800">
                            {title}
                        </h2>

                        <p className="text-sm text-slate-500">
                            {description}
                        </p>

                    </div>

                </div>

            </div>

            <div className="p-6">
                {children}
            </div>

        </motion.div>
    );
};


// =========================================================
// NUMBER SETTING
// =========================================================

const NumberSetting = ({
    icon,
    title,
    description,
    name,
    value,
    min,
    suffix,
    onChange,
    presets,
    onPreset,
}) => {

    return (

        <div className="border border-slate-200 rounded-2xl p-5 hover:border-teal-200 transition">

            <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">

                    {icon}

                </div>

                <div>

                    <p className="font-semibold text-slate-800">
                        {title}
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                        {description}
                    </p>

                </div>

            </div>


            {/* INPUT */}

            <div className="relative">

                <input
                    type="number"
                    name={name}
                    min={min}
                    value={value}
                    onChange={onChange}
                    className="w-full px-4 py-3 pr-24 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-lg font-semibold text-slate-800 transition"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 uppercase">
                    {suffix}
                </span>

            </div>


            {/* PRESETS */}

            <div className="mt-4">

                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                    Quick Select
                </p>

                <div className="flex flex-wrap gap-2">

                    {presets.map((preset) => (

                        <button
                            key={preset}
                            type="button"
                            onClick={() => onPreset(preset)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                Number(value) === Number(preset)
                                    ? "bg-teal-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                            }`}
                        >
                            {preset}
                        </button>

                    ))}

                </div>

            </div>

        </div>
    );
};


// =========================================================
// TOGGLE SETTING
// =========================================================

const ToggleSetting = ({
    icon,
    iconBg,
    iconColor,
    title,
    description,
    checked,
    onChange,
    name,
    enabledText,
    disabledText,
}) => {

    return (

        <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 border rounded-2xl transition ${
                checked
                    ? "border-teal-200 bg-teal-50/30"
                    : "border-slate-200 hover:border-slate-300"
            }`}
        >

            <div className="flex items-center gap-4">

                <div
                    className={`w-11 h-11 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shrink-0`}
                >
                    {icon}
                </div>

                <div>

                    <p className="font-semibold text-slate-800">
                        {title}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                        {description}
                    </p>

                    <div
                        className={`text-xs font-medium mt-2 ${
                            checked
                                ? "text-teal-600"
                                : "text-slate-400"
                        }`}
                    >
                        {checked
                            ? enabledText
                            : disabledText}
                    </div>

                </div>

            </div>


            <label className="relative inline-flex items-center cursor-pointer shrink-0">

                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    className="sr-only peer"
                />

                <div className="w-14 h-8 bg-slate-200 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 peer-checked:bg-teal-600 transition" />

                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow transition peer-checked:translate-x-6" />

            </label>

        </div>
    );
};


// =========================================================
// STATUS PILL
// =========================================================

const StatusPill = ({
    enabled,
    enabledText,
    disabledText,
}) => {

    return (

        <div
            className={`flex items-center gap-2 px-4 py-2 border rounded-full ${
                enabled
                    ? "bg-white/15 border-white/20"
                    : "bg-red-500/20 border-red-300/30"
            }`}
        >

            <span
                className={`w-2.5 h-2.5 rounded-full ${
                    enabled
                        ? "bg-green-300 animate-pulse"
                        : "bg-red-300"
                }`}
            />

            <span className="text-sm font-semibold">
                {enabled
                    ? enabledText
                    : disabledText}
            </span>

        </div>
    );
};


// =========================================================
// OVERVIEW ITEM
// =========================================================

const OverviewItem = ({
    icon,
    label,
    value,
}) => {

    return (

        <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">

            <div className="flex items-center gap-2 text-teal-200">

                {icon}

                <span className="text-xs font-medium">
                    {label}
                </span>

            </div>

            <p className="mt-1 font-bold text-white text-sm truncate">
                {value}
            </p>

        </div>
    );
};


// =========================================================
// SUMMARY ITEM
// =========================================================

const SummaryItem = ({
    icon,
    title,
    value,
}) => {

    return (

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">

            <div className="flex items-center gap-2 text-teal-600">

                {icon}

                <span className="text-xs font-semibold uppercase text-slate-400">
                    {title}
                </span>

            </div>

            <p
                className="mt-2 text-sm font-bold text-slate-800 truncate"
                title={value}
            >
                {value}
            </p>

        </div>
    );
};


export default SystemSettings;