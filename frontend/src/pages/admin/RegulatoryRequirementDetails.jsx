import React, { useEffect, useMemo, useState } from "react";

import {
    getRegulatoryRequirementById,
} from "../../service/regulatoryRequirementService";

import {
    getRulesByRegulatoryRequirement,
    createComplianceRule,
    deleteComplianceRule,
} from "../../service/complianceRuleService";

import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Plus,
    Search,
    ShieldCheck,
    Building2,
    FileText,
    Clock3,
    X,
    CheckCircle2,
    AlertCircle,
    Scale,
    Workflow,
    ClipboardCheck,
    Loader2,
    Trash2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const RegulatoryRequirementDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [requirement, setRequirement] = useState(null);
    const [rules, setRules] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [creating, setCreating] = useState(false);

    const [ruleForm, setRuleForm] = useState({
        ruleCode: "",
        ruleName: "",
        description: "",
        ruleType: "",
        applicableDepartment: "",
        applicableProcess: "",
        controlRequirement: "",
        evidenceRequired: "",
        frequency: "",
    });

    // =========================================================
    // LOAD REQUIREMENT + RULES
    // =========================================================

    const loadData = async () => {
        try {

            setLoading(true);

            const requirementData =
                await getRegulatoryRequirementById(id);

            const rulesData =
                await getRulesByRegulatoryRequirement(id);

            setRequirement(requirementData);

            setRules(
                Array.isArray(rulesData)
                    ? rulesData
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load regulatory requirement:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        if (id) {
            loadData();
        }

    }, [id]);

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleRuleChange = (e) => {

        const { name, value } = e.target;

        setRuleForm((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    // =========================================================
    // CREATE COMPLIANCE RULE
    // =========================================================

    const handleCreateRule = async (e) => {

        e.preventDefault();

        try {

            setCreating(true);

            await createComplianceRule({

                ...ruleForm,

                regulatoryRequirementId: Number(id),

            });

            alert(
                "Compliance rule created successfully!"
            );

            setRuleForm({
                ruleCode: "",
                ruleName: "",
                description: "",
                ruleType: "",
                applicableDepartment: "",
                applicableProcess: "",
                controlRequirement: "",
                evidenceRequired: "",
                frequency: "",
            });

            setShowRuleForm(false);

            await loadData();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to create compliance rule"
            );

        } finally {

            setCreating(false);

        }
    };

    // =========================================================
    // DELETE RULE
    // =========================================================

    const handleDeleteRule = async (ruleId) => {

        if (
            !window.confirm(
                "Are you sure you want to delete this compliance rule?"
            )
        ) {
            return;
        }

        try {

            await deleteComplianceRule(ruleId);

            await loadData();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete compliance rule"
            );

        }
    };

    // =========================================================
    // SEARCH / FILTER
    // =========================================================

    const filteredRules = useMemo(() => {

        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return rules;
        }

        return rules.filter((rule) => {

            return (

                rule.ruleCode
                    ?.toLowerCase()
                    .includes(search) ||

                rule.ruleName
                    ?.toLowerCase()
                    .includes(search) ||

                rule.ruleType
                    ?.toLowerCase()
                    .includes(search) ||

                rule.applicableDepartment
                    ?.toLowerCase()
                    .includes(search) ||

                rule.frequency
                    ?.toLowerCase()
                    .includes(search)

            );

        });

    }, [rules, searchTerm]);

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center">

                        <Loader2
                            size={32}
                            className="text-emerald-600 animate-spin"
                        />

                    </div>

                    <p className="mt-4 text-slate-500 font-medium">

                        Loading regulatory requirement...

                    </p>

                </div>

            </div>

        );

    }

    // =========================================================
    // NOT FOUND
    // =========================================================

    if (!requirement) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">

                    <div className="w-16 h-16 mx-auto bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">

                        <AlertCircle size={32} />

                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mt-5">

                        Regulatory Requirement Not Found

                    </h2>

                    <p className="text-sm text-slate-500 mt-2">

                        The requested regulatory requirement could not be found.

                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/regulatory-requirements"
                            )
                        }
                        className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                    >

                        Back to Requirements

                    </button>

                </div>

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-slate-50">

            {/* =====================================================
                TOP NAVIGATION
            ===================================================== */}

            <div className="bg-white border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-6 py-4">

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/regulatory-requirements"
                            )
                        }
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition"
                    >

                        <ArrowLeft size={18} />

                        Back to Regulatory Requirements

                    </button>

                </div>

            </div>


            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* =====================================================
                    HERO
                ===================================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 p-8 text-white shadow-xl"
                >

                    {/* Decorative shapes */}

                    <div className="absolute -right-20 -top-24 w-80 h-80 bg-white/10 rounded-full" />

                    <div className="absolute -left-24 -bottom-32 w-96 h-96 bg-white/5 rounded-full" />

                    <div className="absolute right-40 bottom-[-80px] w-48 h-48 bg-white/5 rounded-full" />


                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                        <div className="max-w-4xl">

                            <div className="flex items-center gap-3 mb-5">

                                <div className="p-3 bg-white/15 border border-white/10 rounded-xl backdrop-blur">

                                    <Scale size={25} />

                                </div>

                                <span className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">

                                    Regulatory Requirement

                                </span>

                            </div>


                            <p className="text-emerald-200 text-sm font-semibold">

                                {requirement.requirementCode}

                            </p>


                            <h1 className="text-3xl md:text-4xl font-bold mt-2">

                                {requirement.title}

                            </h1>


                            <p className="text-emerald-50/90 mt-4 leading-relaxed max-w-3xl">

                                {requirement.description ||
                                    "No description available for this regulatory requirement."}

                            </p>

                        </div>


                        <div className="shrink-0">

                            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 border border-white/20 backdrop-blur text-sm font-semibold">

                                <CheckCircle2 size={17} />

                                {requirement.status || "ACTIVE"}

                            </span>

                        </div>

                    </div>

                </motion.div>


                {/* =====================================================
                    REQUIREMENT INFORMATION
                ===================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">

                    {[
                        {
                            label: "Regulatory Body",
                            value: requirement.regulatoryBody,
                            icon: Scale,
                        },
                        {
                            label: "Category",
                            value: requirement.category,
                            icon: FileText,
                        },
                        {
                            label: "Department",
                            value: requirement.applicableDepartment,
                            icon: Building2,
                        },
                        {
                            label: "Process",
                            value: requirement.applicableProcess,
                            icon: Workflow,
                        },
                    ].map((item, index) => {

                        const Icon = item.icon;

                        return (

                            <motion.div
                                key={item.label}
                                initial={{
                                    opacity: 0,
                                    y: 15,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: index * 0.08,
                                }}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                                        <Icon size={21} />

                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs text-slate-400 uppercase tracking-wide">

                                            {item.label}

                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1 truncate">

                                            {item.value || "—"}

                                        </p>

                                    </div>

                                </div>

                            </motion.div>

                        );

                    })}

                </div>


                {/* =====================================================
                    STATISTICS
                ===================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

                    {/* Total */}

                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">

                                    Total Compliance Rules

                                </p>

                                <p className="text-3xl font-bold text-slate-800 mt-2">

                                    {rules.length}

                                </p>

                            </div>

                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                                <ShieldCheck size={25} />

                            </div>

                        </div>

                    </motion.div>


                    {/* Active */}

                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">

                                    Active Rules

                                </p>

                                <p className="text-3xl font-bold text-emerald-600 mt-2">

                                    {
                                        rules.filter(
                                            (rule) =>
                                                !rule.status ||
                                                rule.status === "ACTIVE"
                                        ).length
                                    }

                                </p>

                            </div>

                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                                <CheckCircle2 size={25} />

                            </div>

                        </div>

                    </motion.div>


                    {/* Coverage */}

                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">

                                    Compliance Coverage

                                </p>

                                <p className="text-3xl font-bold text-green-600 mt-2">

                                    {rules.length > 0
                                        ? "100%"
                                        : "0%"}

                                </p>

                            </div>

                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-50 text-green-600">

                                <ClipboardCheck size={25} />

                            </div>

                        </div>

                    </motion.div>

                </div>


                {/* =====================================================
                    COMPLIANCE RULE HEADER
                ===================================================== */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10 mb-5">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl">

                                <ShieldCheck size={21} />

                            </div>

                            <h2 className="text-2xl font-bold text-slate-800">

                                Compliance Rules

                            </h2>

                        </div>

                        <p className="text-sm text-slate-500 mt-2">

                            Rules associated with this regulatory requirement

                        </p>

                    </div>


                    <button
                        onClick={() =>
                            setShowRuleForm(true)
                        }
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow-md transition"
                    >

                        <Plus size={19} />

                        Add Compliance Rule

                    </button>

                </div>


                {/* =====================================================
                    SEARCH
                ===================================================== */}

                {rules.length > 0 && (

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">

                        <div className="relative">

                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={19}
                            />

                            <input
                                type="text"
                                placeholder="Search rules by code, name, type, department or frequency..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                            />

                        </div>

                    </div>

                )}


                {/* =====================================================
                    EMPTY STATE
                ===================================================== */}

                {filteredRules.length === 0 ? (

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center"
                    >

                        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                            <ShieldCheck size={31} />

                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mt-5">

                            {rules.length === 0
                                ? "No Compliance Rules Yet"
                                : "No Matching Rules"}

                        </h3>

                        <p className="text-sm text-slate-500 mt-2">

                            {rules.length === 0
                                ? "Create the first compliance rule for this requirement."
                                : "Try changing your search criteria."}

                        </p>


                        {rules.length === 0 && (

                            <button
                                onClick={() =>
                                    setShowRuleForm(true)
                                }
                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                            >

                                <Plus size={18} />

                                Add First Rule

                            </button>

                        )}

                    </motion.div>

                ) : (

                    /* =====================================================
                       RULE CARDS
                    ===================================================== */

                    <div className="space-y-4">

                        <AnimatePresence>

                            {filteredRules.map(
                                (rule, index) => (

                                    <motion.div
                                        key={rule.id}
                                        initial={{
                                            opacity: 0,
                                            y: 15,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.98,
                                        }}
                                        transition={{
                                            delay:
                                                index * 0.04,
                                        }}
                                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                                    >

                                        {/* TOP */}

                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                            <div className="flex gap-4">

                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">

                                                    <ShieldCheck
                                                        size={23}
                                                    />

                                                </div>

                                                <div>

                                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">

                                                        {rule.ruleCode}

                                                    </p>

                                                    <h3 className="text-lg font-bold text-slate-800 mt-1">

                                                        {rule.ruleName}

                                                    </h3>

                                                </div>

                                            </div>


                                            <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">

                                                <CheckCircle2
                                                    size={14}
                                                />

                                                {rule.status ||
                                                    "ACTIVE"}

                                            </span>

                                        </div>


                                        {/* DESCRIPTION */}

                                        {rule.description && (

                                            <p className="text-sm text-slate-600 mt-5 leading-relaxed">

                                                {
                                                    rule.description
                                                }

                                            </p>

                                        )}


                                        {/* DETAILS */}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">

                                            <div>

                                                <p className="text-xs text-slate-400">

                                                    Rule Type

                                                </p>

                                                <p className="text-sm font-semibold text-slate-700 mt-1">

                                                    {rule.ruleType ||
                                                        "—"}

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-xs text-slate-400">

                                                    Frequency

                                                </p>

                                                <div className="flex items-center gap-1.5 mt-1">

                                                    <Clock3
                                                        size={15}
                                                        className="text-emerald-500"
                                                    />

                                                    <p className="text-sm font-semibold text-slate-700">

                                                        {rule.frequency ||
                                                            "—"}

                                                    </p>

                                                </div>

                                            </div>


                                            <div>

                                                <p className="text-xs text-slate-400">

                                                    Department

                                                </p>

                                                <p className="text-sm font-semibold text-slate-700 mt-1">

                                                    {
                                                        rule.applicableDepartment ||
                                                        "—"
                                                    }

                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-xs text-slate-400">

                                                    Evidence Required

                                                </p>

                                                <p className="text-sm font-semibold text-slate-700 mt-1">

                                                    {
                                                        rule.evidenceRequired ||
                                                        "—"
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        {/* CONTROL */}

                                        {rule.controlRequirement && (

                                            <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">

                                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">

                                                    Control Requirement

                                                </p>

                                                <p className="text-sm text-emerald-950 mt-1">

                                                    {
                                                        rule.controlRequirement
                                                    }

                                                </p>

                                            </div>

                                        )}


                                        {/* PROCESS */}

                                        {rule.applicableProcess && (

                                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                                                <Workflow
                                                    size={16}
                                                    className="text-emerald-500"
                                                />

                                                <span>
                                                    Process:
                                                </span>

                                                <span className="font-semibold text-slate-700">

                                                    {
                                                        rule.applicableProcess
                                                    }

                                                </span>

                                            </div>

                                        )}


                                        {/* DELETE */}

                                        <div className="flex justify-end mt-5 pt-4 border-t border-slate-100">

                                            <button
                                                onClick={() =>
                                                    handleDeleteRule(
                                                        rule.id
                                                    )
                                                }
                                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >

                                                <Trash2
                                                    size={16}
                                                />

                                                Delete Rule

                                            </button>

                                        </div>

                                    </motion.div>

                                )
                            )}

                        </AnimatePresence>

                    </div>

                )}

            </main>


            {/* =====================================================
                CREATE RULE MODAL
            ===================================================== */}

            <AnimatePresence>

                {showRuleForm && (

                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        >

                            {/* MODAL HEADER */}

                            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">

                                <div>

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">

                                            <Plus size={20} />

                                        </div>

                                        <div>

                                            <h3 className="text-xl font-bold text-slate-800">

                                                Create Compliance Rule

                                            </h3>

                                            <p className="text-sm text-slate-500 mt-0.5">

                                                Add a new rule under this requirement

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRuleForm(
                                            false
                                        )
                                    }
                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition"
                                >

                                    <X size={20} />

                                </button>

                            </div>


                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleCreateRule
                                }
                                className="p-6 space-y-5"
                            >

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {/* RULE CODE */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Rule Code *

                                        </label>

                                        <input
                                            name="ruleCode"
                                            placeholder="e.g. RULE-001"
                                            value={
                                                ruleForm.ruleCode
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        />

                                    </div>


                                    {/* RULE NAME */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Rule Name *

                                        </label>

                                        <input
                                            name="ruleName"
                                            placeholder="Enter rule name"
                                            value={
                                                ruleForm.ruleName
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        />

                                    </div>


                                    {/* RULE TYPE */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Rule Type

                                        </label>

                                        <input
                                            name="ruleType"
                                            placeholder="e.g. CONTROL"
                                            value={
                                                ruleForm.ruleType
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        />

                                    </div>


                                    {/* FREQUENCY */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Frequency

                                        </label>

                                        <select
                                            name="frequency"
                                            value={
                                                ruleForm.frequency
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        >

                                            <option value="">
                                                Select frequency
                                            </option>

                                            <option value="DAILY">
                                                Daily
                                            </option>

                                            <option value="WEEKLY">
                                                Weekly
                                            </option>

                                            <option value="MONTHLY">
                                                Monthly
                                            </option>

                                            <option value="QUARTERLY">
                                                Quarterly
                                            </option>

                                            <option value="HALF_YEARLY">
                                                Half Yearly
                                            </option>

                                            <option value="YEARLY">
                                                Yearly
                                            </option>

                                        </select>

                                    </div>


                                    {/* DEPARTMENT */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Applicable Department

                                        </label>

                                        <input
                                            name="applicableDepartment"
                                            placeholder="e.g. Finance"
                                            value={
                                                ruleForm.applicableDepartment
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        />

                                    </div>


                                    {/* PROCESS */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Applicable Process

                                        </label>

                                        <input
                                            name="applicableProcess"
                                            placeholder="e.g. Payment Processing"
                                            value={
                                                ruleForm.applicableProcess
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        />

                                    </div>


                                    {/* EVIDENCE */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Evidence Required

                                        </label>

                                        <input
                                            name="evidenceRequired"
                                            placeholder="e.g. Transaction Reports"
                                            value={
                                                ruleForm.evidenceRequired
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        />

                                    </div>


                                    {/* CONTROL */}

                                    <div>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">

                                            Control Requirement

                                        </label>

                                        <input
                                            name="controlRequirement"
                                            placeholder="Enter control requirement"
                                            value={
                                                ruleForm.controlRequirement
                                            }
                                            onChange={
                                                handleRuleChange
                                            }
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                                        />

                                    </div>

                                </div>


                                {/* DESCRIPTION */}

                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">

                                        Description

                                    </label>

                                    <textarea
                                        name="description"
                                        rows="4"
                                        placeholder="Describe the compliance rule..."
                                        value={
                                            ruleForm.description
                                        }
                                        onChange={
                                            handleRuleChange
                                        }
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
                                    />

                                </div>


                                {/* LINKED REQUIREMENT */}

                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">

                                            <ShieldCheck
                                                size={19}
                                            />

                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">

                                                Linked Regulatory Requirement

                                            </p>

                                            <p className="text-sm font-bold text-emerald-950 mt-1">

                                                {
                                                    requirement.requirementCode
                                                }

                                                {" — "}

                                                {
                                                    requirement.title
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* ACTIONS */}

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowRuleForm(
                                                false
                                            )
                                        }
                                        className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                                    >

                                        Cancel

                                    </button>


                                    <button
                                        type="submit"
                                        disabled={
                                            creating
                                        }
                                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition"
                                    >

                                        {creating ? (

                                            <>

                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />

                                                Creating...

                                            </>

                                        ) : (

                                            <>

                                                <Plus
                                                    size={17}
                                                />

                                                Create Rule

                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>

        </div>
    );
};

export default RegulatoryRequirementDetails;
