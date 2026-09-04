import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    ShieldCheck,
    FileText,
    CheckCircle2,
    XCircle,
    Clock3,
    Eye,
    Trash2,
    X,
    CalendarDays,
    Building2,
    Tag,
    Layers3,
    AlertTriangle,
    RefreshCw,
    ChevronDown,
    ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
    getAllRegulatoryRequirements,
    createRegulatoryRequirement,
    deleteRegulatoryRequirement,
} from "../../service/regulatoryRequirementService";


// ============================================================
// HELPERS
// ============================================================

const EMPTY_FORM = {
    requirementCode: "",
    title: "",
    description: "",
    regulatoryBody: "",
    category: "",
    applicableDepartment: "",
    applicableProcess: "",
    effectiveDate: "",
    expiryDate: "",
    status: "ACTIVE",
    complianceReference: "",
    remarks: "",
};


const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
        return "Not specified";
    }

    return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatText = (value) => {
    if (!value) return "—";

    return String(value)
        .toLowerCase()
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};


const normalizeRequirements = (response) => {
    let data = response?.data ?? response;

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            return [];
        }
    }

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.requirements)) return data.requirements;

    return [];
};


// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
    const active = status === "ACTIVE";

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                active
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
        >
            {active ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
                <XCircle className="w-3.5 h-3.5" />
            )}

            {active ? "Active" : "Inactive"}
        </span>
    );
};


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    icon: Icon,
    title,
    value,
    description,
    iconBg,
    iconColor,
    delay,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.45,
                delay,
            }}
            whileHover={{
                y: -5,
                transition: { duration: 0.2 },
            }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
                >
                    <Icon
                        className={`w-5 h-5 ${iconColor}`}
                    />
                </div>

                <ArrowUpRight className="w-4 h-4 text-slate-300" />
            </div>

            <div className="mt-4">
                <motion.div
                    key={value}
                    initial={{
                        opacity: 0,
                        scale: 0.8,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    className="text-2xl font-bold text-slate-800"
                >
                    {value}
                </motion.div>

                <p className="text-sm font-medium text-slate-600 mt-1">
                    {title}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};


// ============================================================
// INPUT COMPONENT
// ============================================================

const FormInput = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}) => {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {label}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
        </div>
    );
};


// ============================================================
// CREATE MODAL
// ============================================================

const CreateRequirementModal = ({
    form,
    setForm,
    onClose,
    onSubmit,
    submitting,
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
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
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            >

                {/* MODAL HEADER */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Create Regulatory Requirement
                            </h2>

                            <p className="text-xs text-slate-500 mt-0.5">
                                Add a new regulatory compliance requirement
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>


                {/* FORM */}
                <form
                    onSubmit={onSubmit}
                    className="p-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <FormInput
                            label="Requirement Code"
                            name="requirementCode"
                            value={form.requirementCode}
                            onChange={handleChange}
                            placeholder="e.g. REG-001"
                            required
                        />

                        <FormInput
                            label="Requirement Title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter requirement title"
                            required
                        />

                        <FormInput
                            label="Regulatory Body"
                            name="regulatoryBody"
                            value={form.regulatoryBody}
                            onChange={handleChange}
                            placeholder="e.g. RBI, SEBI, ISO"
                        />

                        <FormInput
                            label="Category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="e.g. Data Privacy"
                        />

                        <FormInput
                            label="Applicable Department"
                            name="applicableDepartment"
                            value={form.applicableDepartment}
                            onChange={handleChange}
                            placeholder="e.g. Information Technology"
                        />

                        <FormInput
                            label="Applicable Process"
                            name="applicableProcess"
                            value={form.applicableProcess}
                            onChange={handleChange}
                            placeholder="e.g. Access Management"
                        />

                        <FormInput
                            label="Effective Date"
                            name="effectiveDate"
                            value={form.effectiveDate}
                            onChange={handleChange}
                            type="date"
                        />

                        <FormInput
                            label="Expiry Date"
                            name="expiryDate"
                            value={form.expiryDate}
                            onChange={handleChange}
                            type="date"
                        />

                        <FormInput
                            label="Compliance Reference"
                            name="complianceReference"
                            value={form.complianceReference}
                            onChange={handleChange}
                            placeholder="Reference document / clause"
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe the regulatory requirement..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Remarks
                            </label>

                            <textarea
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Additional remarks..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            />
                        </div>
                    </div>


                    {/* BUTTONS */}
                    <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-60"
                        >
                            {submitting
                                ? "Creating..."
                                : "Create Requirement"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// ============================================================
// DELETE MODAL
// ============================================================

const DeleteModal = ({
    requirement,
    onCancel,
    onConfirm,
    deleting,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.95,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>

                <h3 className="text-lg font-bold text-slate-800">
                    Delete Requirement?
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-700">
                        {requirement?.title}
                    </span>
                    ? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-60"
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete Requirement"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const RegulatoryRequirements = () => {

    const navigate = useNavigate();

    const [requirements, setRequirements] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState(EMPTY_FORM);

    const [submitting, setSubmitting] = useState(false);

    const [deletingRequirement, setDeletingRequirement] =
        useState(null);

    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [error, setError] = useState("");


    // ========================================================
    // LOAD DATA
    // ========================================================

    const loadRequirements = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await getAllRegulatoryRequirements();

            setRequirements(
                normalizeRequirements(data)
            );

        } catch (error) {

            console.error(error);

            setError(
                error?.response?.data?.message ||
                "Unable to load regulatory requirements."
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadRequirements();
    }, []);


    // ========================================================
    // STATS
    // ========================================================

    const stats = useMemo(() => {

        const total = requirements.length;

        const active = requirements.filter(
            (r) => r.status === "ACTIVE"
        ).length;

        const inactive = requirements.filter(
            (r) => r.status !== "ACTIVE"
        ).length;

        const categories = new Set(
            requirements
                .map((r) => r.category)
                .filter(Boolean)
        ).size;

        const expiring = requirements.filter((r) => {

            if (!r.expiryDate) return false;

            const expiry =
                new Date(r.expiryDate).getTime();

            const now = Date.now();

            const thirtyDays =
                30 * 24 * 60 * 60 * 1000;

            return (
                expiry >= now &&
                expiry - now <= thirtyDays
            );

        }).length;

        return {
            total,
            active,
            inactive,
            categories,
            expiring,
        };

    }, [requirements]);


    // ========================================================
    // FILTER OPTIONS
    // ========================================================

    const categories = useMemo(() => {

        return [
            ...new Set(
                requirements
                    .map((r) => r.category)
                    .filter(Boolean)
            ),
        ].sort();

    }, [requirements]);


    // ========================================================
    // FILTERED DATA
    // ========================================================

    const filteredRequirements = useMemo(() => {

        const term = search
            .trim()
            .toLowerCase();

        return requirements.filter((r) => {

            const matchesSearch =
                !term ||
                r.title
                    ?.toLowerCase()
                    .includes(term) ||
                r.requirementCode
                    ?.toLowerCase()
                    .includes(term) ||
                r.regulatoryBody
                    ?.toLowerCase()
                    .includes(term) ||
                r.applicableDepartment
                    ?.toLowerCase()
                    .includes(term);

            const matchesStatus =
                statusFilter === "ALL" ||
                r.status === statusFilter;

            const matchesCategory =
                categoryFilter === "ALL" ||
                r.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );

        });

    }, [
        requirements,
        search,
        statusFilter,
        categoryFilter,
    ]);


    // ========================================================
    // CREATE
    // ========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSubmitting(true);

            await createRegulatoryRequirement(form);

            setShowForm(false);

            setForm(EMPTY_FORM);

            await loadRequirements();

        } catch (error) {

            alert(
                error?.response?.data?.message ||
                "Failed to create regulatory requirement"
            );

        } finally {

            setSubmitting(false);

        }
    };


    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete = async () => {

        if (!deletingRequirement) return;

        try {

            setDeleting(true);

            await deleteRegulatoryRequirement(
                deletingRequirement.id
            );

            setDeletingRequirement(null);

            await loadRequirements();

        } catch (error) {

            alert(
                error?.response?.data?.message ||
                "Failed to delete requirement"
            );

        } finally {

            setDeleting(false);

        }
    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

                <div className="animate-pulse">

                    <div className="h-8 w-72 bg-slate-200 rounded mb-2" />

                    <div className="h-4 w-96 bg-slate-200 rounded mb-8" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                        {Array.from({ length: 5 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="h-36 bg-white border border-slate-200 rounded-2xl"
                                />
                            )
                        )}

                    </div>

                    <div className="h-20 bg-white border border-slate-200 rounded-2xl mt-6" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                        {Array.from({ length: 4 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="h-72 bg-white border border-slate-200 rounded-2xl"
                                />
                            )
                        )}

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

            {/* ==================================================
                HEADER
            ================================================== */}

            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7"
            >

                <div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        Compliance Management
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        Regulatory Requirements
                    </h1>

                    <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                        Monitor regulatory obligations, compliance
                        references, applicable departments and
                        regulatory deadlines.
                    </p>

                </div>


                <div className="flex items-center gap-3">

                    <button
                        onClick={loadRequirements}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 flex items-center justify-center transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Requirement
                    </button>

                </div>

            </motion.div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5"
                >

                    <div className="flex items-center gap-3">

                        <AlertTriangle className="w-5 h-5 text-red-600" />

                        <span className="text-sm text-red-700">
                            {error}
                        </span>

                    </div>

                    <button
                        onClick={loadRequirements}
                        className="text-sm font-medium text-red-700 hover:underline"
                    >
                        Retry
                    </button>

                </motion.div>

            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-7">

                <StatCard
                    icon={FileText}
                    title="Total Requirements"
                    value={stats.total}
                    description="All registered requirements"
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    delay={0}
                />

                <StatCard
                    icon={CheckCircle2}
                    title="Active"
                    value={stats.active}
                    description="Currently applicable"
                    iconBg="bg-teal-50"
                    iconColor="text-teal-600"
                    delay={0.05}
                />

                <StatCard
                    icon={XCircle}
                    title="Inactive"
                    value={stats.inactive}
                    description="No longer active"
                    iconBg="bg-slate-100"
                    iconColor="text-slate-600"
                    delay={0.1}
                />

                <StatCard
                    icon={Layers3}
                    title="Categories"
                    value={stats.categories}
                    description="Compliance categories"
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-600"
                    delay={0.15}
                />

                <StatCard
                    icon={Clock3}
                    title="Expiring Soon"
                    value={stats.expiring}
                    description="Within next 30 days"
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    delay={0.2}
                />

            </div>


            {/* ==================================================
                SEARCH / FILTER BAR
            ================================================== */}

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6"
            >

                <div className="flex flex-col lg:flex-row gap-3">

                    <div className="relative flex-1">

                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search requirement, code, regulatory body..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                        />

                    </div>


                    <div className="relative">

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="appearance-none w-full lg:w-44 pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 outline-none focus:bg-white focus:border-emerald-500"
                        >
                            <option value="ALL">
                                All Status
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>
                        </select>

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    </div>


                    <div className="relative">

                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(e.target.value)
                            }
                            className="appearance-none w-full lg:w-48 pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 outline-none focus:bg-white focus:border-emerald-500"
                        >
                            <option value="ALL">
                                All Categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {formatText(category)}
                                </option>
                            ))}

                        </select>

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    </div>

                </div>

            </motion.div>


            {/* ==================================================
                RESULTS HEADER
            ================================================== */}

            <div className="flex items-center justify-between mb-4">

                <div>

                    <h2 className="text-base font-bold text-slate-800">
                        Regulatory Register
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                        Showing {filteredRequirements.length} of{" "}
                        {requirements.length} requirements
                    </p>

                </div>

            </div>


            {/* ==================================================
                REQUIREMENTS
            ================================================== */}

            {filteredRequirements.length === 0 ? (

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center"
                >

                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <FileText className="w-7 h-7 text-slate-400" />
                    </div>

                    <h3 className="font-semibold text-slate-700">
                        No requirements found
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                        Try changing your search or filters.
                    </p>

                </motion.div>

            ) : (

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    <AnimatePresence mode="popLayout">

                        {filteredRequirements.map(
                            (requirement, index) => (

                                <motion.div
                                    key={requirement.id}
                                    layout
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.95,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay:
                                            index * 0.04,
                                    }}
                                    whileHover={{
                                        y: -4,
                                    }}
                                    className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all overflow-hidden"
                                >

                                    {/* TOP BORDER */}

                                    <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />


                                    <div className="p-5">

                                        {/* CARD HEADER */}

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex items-start gap-3">

                                                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                                </div>

                                                <div>

                                                    <div className="flex items-center gap-2 flex-wrap">

                                                        <span className="text-xs font-semibold text-emerald-600">
                                                            {requirement.requirementCode ||
                                                                "REG-—"}
                                                        </span>

                                                        <StatusBadge
                                                            status={
                                                                requirement.status
                                                            }
                                                        />

                                                    </div>

                                                    <h3 className="text-base font-bold text-slate-800 mt-1">
                                                        {requirement.title ||
                                                            "Untitled Requirement"}
                                                    </h3>

                                                </div>

                                            </div>

                                        </div>


                                        {/* DESCRIPTION */}

                                        <p className="text-sm text-slate-500 mt-4 line-clamp-2 min-h-[40px]">
                                            {requirement.description ||
                                                "No description provided for this regulatory requirement."}
                                        </p>


                                        {/* DETAILS */}

                                        <div className="grid grid-cols-2 gap-3 mt-5">

                                            <div className="bg-slate-50 rounded-xl p-3">

                                                <div className="flex items-center gap-2 text-slate-400 mb-1">

                                                    <Building2 className="w-3.5 h-3.5" />

                                                    <span className="text-[11px] font-medium">
                                                        Regulatory Body
                                                    </span>

                                                </div>

                                                <p className="text-xs font-semibold text-slate-700 truncate">
                                                    {requirement.regulatoryBody ||
                                                        "Not specified"}
                                                </p>

                                            </div>


                                            <div className="bg-slate-50 rounded-xl p-3">

                                                <div className="flex items-center gap-2 text-slate-400 mb-1">

                                                    <Tag className="w-3.5 h-3.5" />

                                                    <span className="text-[11px] font-medium">
                                                        Category
                                                    </span>

                                                </div>

                                                <p className="text-xs font-semibold text-slate-700 truncate">
                                                    {formatText(
                                                        requirement.category
                                                    )}
                                                </p>

                                            </div>


                                            <div className="bg-slate-50 rounded-xl p-3">

                                                <div className="flex items-center gap-2 text-slate-400 mb-1">

                                                    <CalendarDays className="w-3.5 h-3.5" />

                                                    <span className="text-[11px] font-medium">
                                                        Effective Date
                                                    </span>

                                                </div>

                                                <p className="text-xs font-semibold text-slate-700">
                                                    {formatDate(
                                                        requirement.effectiveDate
                                                    )}
                                                </p>

                                            </div>


                                            <div className="bg-slate-50 rounded-xl p-3">

                                                <div className="flex items-center gap-2 text-slate-400 mb-1">

                                                    <Clock3 className="w-3.5 h-3.5" />

                                                    <span className="text-[11px] font-medium">
                                                        Expiry Date
                                                    </span>

                                                </div>

                                                <p className="text-xs font-semibold text-slate-700">
                                                    {formatDate(
                                                        requirement.expiryDate
                                                    )}
                                                </p>

                                            </div>

                                        </div>


                                        {/* DEPARTMENT */}

                                        <div className="flex items-center gap-2 mt-4">

                                            <span className="text-xs text-slate-400">
                                                Department:
                                            </span>

                                            <span className="text-xs font-semibold text-slate-600">
                                                {requirement.applicableDepartment ||
                                                    "All Departments"}
                                            </span>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">

                                            <span className="text-xs text-slate-400">
                                                Manage compliance rules
                                            </span>

                                            <div className="flex items-center gap-2">

                                                <motion.button
                                                    whileHover={{
                                                        scale: 1.04,
                                                    }}
                                                    whileTap={{
                                                        scale: 0.96,
                                                    }}
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/regulatory-requirements/${requirement.id}`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Manage Rules
                                                </motion.button>


                                                <motion.button
                                                    whileHover={{
                                                        scale: 1.05,
                                                    }}
                                                    whileTap={{
                                                        scale: 0.95,
                                                    }}
                                                    onClick={() =>
                                                        setDeletingRequirement(
                                                            requirement
                                                        )
                                                    }
                                                    className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 flex items-center justify-center transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>

                                            </div>

                                        </div>

                                    </div>

                                </motion.div>

                            )
                        )}

                    </AnimatePresence>

                </div>

            )}


            {/* ==================================================
                CREATE MODAL
            ================================================== */}

            <AnimatePresence>

                {showForm && (
                    <CreateRequirementModal
                        form={form}
                        setForm={setForm}
                        onClose={() =>
                            !submitting &&
                            setShowForm(false)
                        }
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                )}

            </AnimatePresence>


            {/* ==================================================
                DELETE MODAL
            ================================================== */}

            <AnimatePresence>

                {deletingRequirement && (
                    <DeleteModal
                        requirement={deletingRequirement}
                        onCancel={() =>
                            !deleting &&
                            setDeletingRequirement(null)
                        }
                        onConfirm={handleDelete}
                        deleting={deleting}
                    />
                )}

            </AnimatePresence>

        </div>
    );
};

export default RegulatoryRequirements;