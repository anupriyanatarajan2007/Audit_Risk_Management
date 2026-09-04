import React, { useEffect, useState } from "react";
import RiskConfigurationService from "../../service/riskConfigurationService";

const DEFAULT_CONFIG = {
    lowMax: 5,
    mediumMin: 6,
    mediumMax: 11,
    highMin: 12,
    highMax: 19,
    criticalMin: 20,
};

const RiskConfiguration = () => {

    const [config, setConfig] = useState(DEFAULT_CONFIG);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD CONFIGURATION FROM BACKEND
    // ==========================================

    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await RiskConfigurationService.getConfiguration();

            setConfig({
                lowMax: data.lowMax,
                mediumMin: data.mediumMin,
                mediumMax: data.mediumMax,
                highMin: data.highMin,
                highMax: data.highMax,
                criticalMin: data.criticalMin,
            });

        } catch (err) {

            console.error(
                "Failed to load risk configuration:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load risk configuration"
            );

        } finally {

            setLoading(false);
        }
    };

    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (field, value) => {

        setConfig((prev) => ({
            ...prev,
            [field]: Number(value),
        }));

        setSaved(false);
        setError("");
    };

    // ==========================================
    // VALIDATE CONFIGURATION
    // ==========================================

    const validateConfiguration = () => {

        if (
            config.lowMax < 1 ||
            config.lowMax > 25
        ) {
            return "Low maximum must be between 1 and 25.";
        }

        if (
            config.mediumMin < 1 ||
            config.mediumMin > 25
        ) {
            return "Medium minimum must be between 1 and 25.";
        }

        if (
            config.mediumMax < 1 ||
            config.mediumMax > 25
        ) {
            return "Medium maximum must be between 1 and 25.";
        }

        if (
            config.highMin < 1 ||
            config.highMin > 25
        ) {
            return "High minimum must be between 1 and 25.";
        }

        if (
            config.highMax < 1 ||
            config.highMax > 25
        ) {
            return "High maximum must be between 1 and 25.";
        }

        if (
            config.criticalMin < 1 ||
            config.criticalMin > 25
        ) {
            return "Critical minimum must be between 1 and 25.";
        }

        if (
            config.lowMax >=
            config.mediumMin
        ) {
            return "Low and Medium ranges overlap.";
        }

        if (
            config.mediumMin >=
            config.mediumMax
        ) {
            return "Medium minimum must be less than Medium maximum.";
        }

        if (
            config.mediumMax >=
            config.highMin
        ) {
            return "Medium and High ranges overlap.";
        }

        if (
            config.highMin >=
            config.highMax
        ) {
            return "High minimum must be less than High maximum.";
        }

        if (
            config.highMax >=
            config.criticalMin
        ) {
            return "High and Critical ranges overlap.";
        }

        return null;
    };

    // ==========================================
    // SAVE CONFIGURATION
    // ==========================================

    const handleSave = async () => {

        const validationError =
            validateConfiguration();

        if (validationError) {

            setError(validationError);
            setSaved(false);

            return;
        }

        try {

            setSaving(true);
            setSaved(false);
            setError("");

            const response =
                await RiskConfigurationService
                    .updateConfiguration(config);

            setConfig({
                lowMax: response.lowMax,
                mediumMin: response.mediumMin,
                mediumMax: response.mediumMax,
                highMin: response.highMin,
                highMax: response.highMax,
                criticalMin: response.criticalMin,
            });

            setSaved(true);

        } catch (err) {

            console.error(
                "Failed to update risk configuration:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save risk configuration"
            );

        } finally {

            setSaving(false);
        }
    };

    // ==========================================
    // RESET
    // ==========================================

    const handleReset = () => {

        setConfig(DEFAULT_CONFIG);

        setSaved(false);
        setError("");
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">

                <div className="text-center">

                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-teal-600"></div>

                    <p className="text-sm text-slate-500">
                        Loading risk configuration...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-slate-800">
                    Risk Configuration
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Configure risk scoring thresholds used by the Risk Management System.
                </p>

            </div>


            {/* ==========================================
                MAIN CARD
            ========================================== */}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                {/* CARD HEADER */}

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-lg font-semibold text-slate-800">
                        Risk Scoring Configuration
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Risk score is calculated using Likelihood × Impact.
                    </p>

                </div>


                {/* ==========================================
                    FORMULA
                ========================================== */}

                <div className="mx-6 mt-6 rounded-lg bg-slate-100 p-4">

                    <p className="text-sm font-medium text-slate-600">
                        Risk Score Formula
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-800">
                        Likelihood × Impact = Risk Score
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Both Likelihood and Impact are scored from 1 to 5.
                    </p>

                </div>


                {/* ==========================================
                    ERROR MESSAGE
                ========================================== */}

                {error && (

                    <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>

                    </div>

                )}


                {/* ==========================================
                    CONFIGURATION
                ========================================== */}

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                    {/* LOW */}

                    <div className="rounded-lg border border-slate-200 p-5">

                        <h3 className="font-semibold text-slate-800">
                            Low Risk
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Maximum score allowed for Low risk.
                        </p>

                        <div className="mt-4">

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Maximum Score
                            </label>

                            <input
                                type="number"
                                min="1"
                                max="25"
                                value={config.lowMax}
                                onChange={(e) =>
                                    handleChange(
                                        "lowMax",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />

                        </div>

                    </div>


                    {/* MEDIUM */}

                    <div className="rounded-lg border border-slate-200 p-5">

                        <h3 className="font-semibold text-slate-800">
                            Medium Risk
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure the Medium risk score range.
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-4">

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Minimum Score
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="25"
                                    value={config.mediumMin}
                                    onChange={(e) =>
                                        handleChange(
                                            "mediumMin",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Maximum Score
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="25"
                                    value={config.mediumMax}
                                    onChange={(e) =>
                                        handleChange(
                                            "mediumMax",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>

                        </div>

                    </div>


                    {/* HIGH */}

                    <div className="rounded-lg border border-slate-200 p-5">

                        <h3 className="font-semibold text-slate-800">
                            High Risk
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure the High risk score range.
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-4">

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Minimum Score
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="25"
                                    value={config.highMin}
                                    onChange={(e) =>
                                        handleChange(
                                            "highMin",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Maximum Score
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="25"
                                    value={config.highMax}
                                    onChange={(e) =>
                                        handleChange(
                                            "highMax",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>

                        </div>

                    </div>


                    {/* CRITICAL */}

                    <div className="rounded-lg border border-slate-200 p-5">

                        <h3 className="font-semibold text-slate-800">
                            Critical Risk
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Minimum score required for Critical risk.
                        </p>

                        <div className="mt-4">

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Minimum Score
                            </label>

                            <input
                                type="number"
                                min="1"
                                max="25"
                                value={config.criticalMin}
                                onChange={(e) =>
                                    handleChange(
                                        "criticalMin",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    CURRENT CONFIGURATION
                ========================================== */}

                <div className="mx-6 mb-6 overflow-hidden rounded-lg border border-slate-200">

                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                        <h3 className="font-semibold text-slate-800">
                            Current Risk Levels
                        </h3>

                    </div>


                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="px-5 py-3 font-semibold text-slate-600">
                                        Risk Level
                                    </th>

                                    <th className="px-5 py-3 font-semibold text-slate-600">
                                        Score Range
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                <tr className="border-t">

                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        LOW
                                    </td>

                                    <td className="px-5 py-4 text-slate-600">
                                        1 - {config.lowMax}
                                    </td>

                                </tr>


                                <tr className="border-t">

                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        MEDIUM
                                    </td>

                                    <td className="px-5 py-4 text-slate-600">
                                        {config.mediumMin} - {config.mediumMax}
                                    </td>

                                </tr>


                                <tr className="border-t">

                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        HIGH
                                    </td>

                                    <td className="px-5 py-4 text-slate-600">
                                        {config.highMin} - {config.highMax}
                                    </td>

                                </tr>


                                <tr className="border-t">

                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        CRITICAL
                                    </td>

                                    <td className="px-5 py-4 text-slate-600">
                                        {config.criticalMin} - 25
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* ==========================================
                    ACTIONS
                ========================================== */}

                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-5">

                    <div>

                        {saved && (

                            <p className="text-sm font-medium text-green-600">
                                Configuration saved successfully.
                            </p>

                        )}

                    </div>


                    <div className="flex gap-3">

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Reset
                        </button>


                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {saving
                                ? "Saving..."
                                : "Save Configuration"}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default RiskConfiguration;