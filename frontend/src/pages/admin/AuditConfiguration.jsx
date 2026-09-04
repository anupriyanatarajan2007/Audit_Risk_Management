import React, { useEffect, useState } from "react";

import {
    getAuditConfiguration,
    updateAuditConfiguration,
} from "../../service/auditConfigurationService";

const AuditConfiguration = () => {

    // ============================================================
    // DEFAULT CONFIGURATION
    // ============================================================

    const defaultConfig = {
        minimumAuditDuration: 1,
        defaultAuditDuration: 30,
        maximumAuditDuration: 90,
        reminderDaysBeforeEnd: 7,
        maximumExtensions: 2,
        allowOverdueAudit: false,
        requireCaeApproval: true,
        requireManagerApproval: true,
    };


    // ============================================================
    // STATE
    // ============================================================

    const [config, setConfig] = useState(defaultConfig);

    const [saved, setSaved] = useState(false);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    // ============================================================
    // LOAD CONFIGURATION
    // ============================================================

    useEffect(() => {
        loadConfiguration();
    }, []);


    const loadConfiguration = async () => {

        try {

            setLoading(true);

            setError("");

            const data = await getAuditConfiguration();

            setConfig({
                minimumAuditDuration:
                    data.minimumAuditDuration,

                defaultAuditDuration:
                    data.defaultAuditDuration,

                maximumAuditDuration:
                    data.maximumAuditDuration,

                reminderDaysBeforeEnd:
                    data.reminderDaysBeforeEnd,

                maximumExtensions:
                    data.maximumExtensions,

                allowOverdueAudit:
                    data.allowOverdueAudit,

                requireCaeApproval:
                    data.requireCaeApproval,

                requireManagerApproval:
                    data.requireManagerApproval,
            });

        } catch (err) {

            console.error(
                "Failed to load audit configuration:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load audit configuration"
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // HANDLE NUMBER CHANGE
    // ============================================================

    const handleChange = (field, value) => {

        setConfig((prev) => ({
            ...prev,
            [field]: Number(value),
        }));

        setSaved(false);

        setError("");
    };


    // ============================================================
    // HANDLE BOOLEAN CHANGE
    // ============================================================

    const handleBooleanChange = (field) => {

        setConfig((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));

        setSaved(false);

        setError("");
    };


    // ============================================================
    // VALIDATION
    // ============================================================

    const validateConfig = () => {

        if (
            config.minimumAuditDuration < 1
        ) {
            return "Minimum audit duration must be at least 1 day.";
        }


        if (
            config.defaultAuditDuration <
            config.minimumAuditDuration
        ) {
            return "Default duration cannot be less than minimum duration.";
        }


        if (
            config.maximumAuditDuration <
            config.defaultAuditDuration
        ) {
            return "Maximum duration cannot be less than default duration.";
        }


        if (
            config.reminderDaysBeforeEnd < 0
        ) {
            return "Reminder days cannot be negative.";
        }


        if (
            config.reminderDaysBeforeEnd >=
            config.maximumAuditDuration
        ) {
            return "Reminder days must be less than maximum audit duration.";
        }


        if (
            config.maximumExtensions < 0
        ) {
            return "Maximum extensions cannot be negative.";
        }


        return null;
    };


    // ============================================================
    // SAVE CONFIGURATION
    // ============================================================

    const handleSave = async () => {

        const validationError = validateConfig();

        if (validationError) {

            setError(validationError);

            setSaved(false);

            return;
        }


        try {

            setSaving(true);

            setError("");

            setSaved(false);


            const updated =
                await updateAuditConfiguration(config);


            setConfig({
                minimumAuditDuration:
                    updated.minimumAuditDuration,

                defaultAuditDuration:
                    updated.defaultAuditDuration,

                maximumAuditDuration:
                    updated.maximumAuditDuration,

                reminderDaysBeforeEnd:
                    updated.reminderDaysBeforeEnd,

                maximumExtensions:
                    updated.maximumExtensions,

                allowOverdueAudit:
                    updated.allowOverdueAudit,

                requireCaeApproval:
                    updated.requireCaeApproval,

                requireManagerApproval:
                    updated.requireManagerApproval,
            });


            setSaved(true);


            setTimeout(() => {
                setSaved(false);
            }, 3000);

        } catch (err) {

            console.error(
                "Failed to update audit configuration:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save audit configuration"
            );

        } finally {

            setSaving(false);
        }
    };


    // ============================================================
    // RESET
    // ============================================================

    const handleReset = async () => {

        try {

            setError("");

            setSaved(false);

            await loadConfiguration();

        } catch (err) {

            console.error(err);
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">

                <div className="text-center">

                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600"></div>

                    <p className="text-sm text-slate-500">
                        Loading audit configuration...
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // UI
    // ============================================================

    return (

        <div className="min-h-screen bg-slate-50 p-6">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-slate-800">
                    Audit Configuration
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Configure audit duration, reminders, extensions,
                    and approval requirements.
                </p>

            </div>


            {/* =====================================================
                ERROR MESSAGE
            ====================================================== */}

            {error && (

                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4">

                    <div className="flex items-start gap-3">

                        <span className="text-red-600">
                            ⚠
                        </span>

                        <div>

                            <p className="font-semibold text-red-700">
                                Configuration Error
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                {error}
                            </p>

                        </div>

                    </div>

                </div>
            )}


            {/* =====================================================
                MAIN CARD
            ====================================================== */}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">


                {/* =================================================
                    CARD HEADER
                ================================================== */}

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-lg font-semibold text-slate-800">
                        Audit Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        These settings control how audits are created,
                        monitored, and approved.
                    </p>

                </div>


                {/* =================================================
                    AUDIT DURATION
                ================================================== */}

                <div className="border-b border-slate-200 p-6">

                    <h3 className="text-base font-semibold text-slate-800">
                        Audit Duration
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Configure the allowed duration for an audit.
                    </p>


                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">


                        {/* MINIMUM */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Minimum Duration
                            </label>

                            <div className="relative">

                                <input
                                    type="number"
                                    min="1"
                                    value={config.minimumAuditDuration}
                                    onChange={(e) =>
                                        handleChange(
                                            "minimumAuditDuration",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-14 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                                <span className="absolute right-4 top-3 text-sm text-slate-400">
                                    days
                                </span>

                            </div>

                        </div>


                        {/* DEFAULT */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Default Duration
                            </label>

                            <div className="relative">

                                <input
                                    type="number"
                                    min="1"
                                    value={config.defaultAuditDuration}
                                    onChange={(e) =>
                                        handleChange(
                                            "defaultAuditDuration",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-14 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                                <span className="absolute right-4 top-3 text-sm text-slate-400">
                                    days
                                </span>

                            </div>

                        </div>


                        {/* MAXIMUM */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Maximum Duration
                            </label>

                            <div className="relative">

                                <input
                                    type="number"
                                    min="1"
                                    value={config.maximumAuditDuration}
                                    onChange={(e) =>
                                        handleChange(
                                            "maximumAuditDuration",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-14 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                                <span className="absolute right-4 top-3 text-sm text-slate-400">
                                    days
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    REMINDERS
                ================================================== */}

                <div className="border-b border-slate-200 p-6">

                    <h3 className="text-base font-semibold text-slate-800">
                        Audit Reminders
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Configure when the system should remind users
                        about upcoming audit deadlines.
                    </p>


                    <div className="mt-5 max-w-md">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Reminder Before End Date
                        </label>

                        <div className="relative">

                            <input
                                type="number"
                                min="0"
                                value={config.reminderDaysBeforeEnd}
                                onChange={(e) =>
                                    handleChange(
                                        "reminderDaysBeforeEnd",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-14 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />

                            <span className="absolute right-4 top-3 text-sm text-slate-400">
                                days
                            </span>

                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                            Example: 7 means a reminder will be sent
                            7 days before the audit end date.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    EXTENSIONS
                ================================================== */}

                <div className="border-b border-slate-200 p-6">

                    <h3 className="text-base font-semibold text-slate-800">
                        Audit Extensions
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Control how many times an audit can be extended.
                    </p>


                    <div className="mt-5 max-w-md">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Maximum Extensions
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={config.maximumExtensions}
                            onChange={(e) =>
                                handleChange(
                                    "maximumExtensions",
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        />

                        <p className="mt-2 text-xs text-slate-400">
                            Set to 0 if audit extensions are not allowed.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    AUDIT BEHAVIOR
                ================================================== */}

                <div className="border-b border-slate-200 p-6">

                    <h3 className="text-base font-semibold text-slate-800">
                        Audit Behavior
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Configure how the system handles audit deadlines.
                    </p>


                    <div className="mt-5 space-y-4">


                        {/* ALLOW OVERDUE */}

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

                            <div>

                                <h4 className="font-medium text-slate-800">
                                    Allow Overdue Audits
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    Allow audits to remain active after
                                    their scheduled end date.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    handleBooleanChange(
                                        "allowOverdueAudit"
                                    )
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                    config.allowOverdueAudit
                                        ? "bg-teal-600"
                                        : "bg-slate-300"
                                }`}
                            >

                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                                        config.allowOverdueAudit
                                            ? "left-6"
                                            : "left-1"
                                    }`}
                                />

                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    APPROVAL SETTINGS
                ================================================== */}

                <div className="p-6">

                    <h3 className="text-base font-semibold text-slate-800">
                        Approval Requirements
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Configure approval requirements for audit
                        operations.
                    </p>


                    <div className="mt-5 space-y-4">


                        {/* CAE APPROVAL */}

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

                            <div>

                                <h4 className="font-medium text-slate-800">
                                    CAE Approval Required
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    Require Chief Audit Executive approval
                                    where applicable.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    handleBooleanChange(
                                        "requireCaeApproval"
                                    )
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                    config.requireCaeApproval
                                        ? "bg-teal-600"
                                        : "bg-slate-300"
                                }`}
                            >

                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                                        config.requireCaeApproval
                                            ? "left-6"
                                            : "left-1"
                                    }`}
                                />

                            </button>

                        </div>


                        {/* MANAGER APPROVAL */}

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

                            <div>

                                <h4 className="font-medium text-slate-800">
                                    Audit Manager Approval Required
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    Require Audit Manager approval for
                                    audit operations.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    handleBooleanChange(
                                        "requireManagerApproval"
                                    )
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                    config.requireManagerApproval
                                        ? "bg-teal-600"
                                        : "bg-slate-300"
                                }`}
                            >

                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                                        config.requireManagerApproval
                                            ? "left-6"
                                            : "left-1"
                                    }`}
                                />

                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CURRENT SUMMARY
                ================================================== */}

                <div className="mx-6 mb-6 rounded-lg border border-slate-200 overflow-hidden">

                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                        <h3 className="font-semibold text-slate-800">
                            Current Configuration
                        </h3>

                    </div>


                    <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">

                        <div className="p-5">

                            <p className="text-sm text-slate-500">
                                Audit Duration
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                                {config.minimumAuditDuration} -
                                {" "}
                                {config.maximumAuditDuration}
                                {" "}
                                days
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Default: {config.defaultAuditDuration} days
                            </p>

                        </div>


                        <div className="p-5">

                            <p className="text-sm text-slate-500">
                                Reminder
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                                {config.reminderDaysBeforeEnd} days
                                before end
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================== */}

                <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        {saved && (

                            <p className="flex items-center gap-2 text-sm font-medium text-green-600">

                                <span>
                                    ✓
                                </span>

                                Configuration saved successfully.

                            </p>

                        )}

                    </div>


                    <div className="flex gap-3">

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Reset
                        </button>


                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {saving ? (
                                "Saving..."
                            ) : (
                                "Save Configuration"
                            )}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AuditConfiguration;

