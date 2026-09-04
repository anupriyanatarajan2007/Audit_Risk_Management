import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Power, PowerOff, Plus, X } from "lucide-react";
import {
    createOrganization,
    getAllOrganizations,
    updateOrganization,
    deleteOrganization,
    activateOrganization,
    deactivateOrganization,
} from "../../service/organizationService";

import {
    createDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment,
} from "../../service/departmentService";

const OrganizationManagement = () => {

    // =====================================================
    // ORGANIZATION STATES
    // =====================================================

    const [organizations, setOrganizations] = useState([]);
    const [showOrganizationForm, setShowOrganizationForm] = useState(false);
    const [editingOrganization, setEditingOrganization] = useState(null);

    const [organizationForm, setOrganizationForm] = useState({
        organizationName: "",
        organizationCode: "",
        industry: "",
        address: "",
        contactEmail: "",
        contactPhone: "",
        active: true,
    });

    // =====================================================
    // DEPARTMENT STATES
    // =====================================================

    const [departments, setDepartments] = useState([]);
    const [showDepartmentForm, setShowDepartmentForm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);

    const [departmentForm, setDepartmentForm] = useState({
        name: "",
    });

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadOrganizations();
        loadDepartments();
    }, []);

    const loadOrganizations = async () => {
        try {
            const data = await getAllOrganizations();
            setOrganizations(data || []);
        } catch (error) {
            console.error("Failed to load organizations", error);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await getAllDepartments();
            setDepartments(data || []);
        } catch (error) {
            console.error("Failed to load departments", error);
        }
    };

    // =====================================================
    // ORGANIZATION INPUT
    // =====================================================

    const handleOrganizationChange = (e) => {
        const { name, value } = e.target;

        setOrganizationForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // CREATE / UPDATE ORGANIZATION
    // =====================================================

    const handleOrganizationSubmit = async (e) => {
        e.preventDefault();

        try {

            if (editingOrganization) {

                await updateOrganization(
                    editingOrganization.id,
                    organizationForm
                );

            } else {

                await createOrganization(organizationForm);

            }

            await loadOrganizations();

            resetOrganizationForm();

        } catch (error) {

            console.error("Organization save failed", error);

            alert(
                error.response?.data?.message ||
                "Failed to save organization"
            );
        }
    };

    // =====================================================
    // EDIT ORGANIZATION
    // =====================================================

    const handleEditOrganization = (organization) => {

        setEditingOrganization(organization);

        setOrganizationForm({
            organizationName: organization.organizationName || "",
            organizationCode: organization.organizationCode || "",
            industry: organization.industry || "",
            address: organization.address || "",
            contactEmail: organization.contactEmail || "",
            contactPhone: organization.contactPhone || "",
            active: organization.active ?? true,
        });

        setShowOrganizationForm(true);
    };

    // =====================================================
    // DELETE ORGANIZATION
    // =====================================================

    const handleDeleteOrganization = async (id) => {

        if (!window.confirm("Are you sure you want to delete this organization?")) {
            return;
        }

        try {

            await deleteOrganization(id);
            await loadOrganizations();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete organization"
            );
        }
    };

    // =====================================================
    // ACTIVATE / DEACTIVATE
    // =====================================================

    const handleToggleOrganization = async (organization) => {

        try {

            if (organization.active) {

                await deactivateOrganization(organization.id);

            } else {

                await activateOrganization(organization.id);

            }

            await loadOrganizations();

        } catch (error) {

            console.error(error);

            alert("Failed to update organization status");
        }
    };

    // =====================================================
    // RESET ORGANIZATION
    // =====================================================

    const resetOrganizationForm = () => {

        setOrganizationForm({
            organizationName: "",
            organizationCode: "",
            industry: "",
            address: "",
            contactEmail: "",
            contactPhone: "",
            active: true,
        });

        setEditingOrganization(null);
        setShowOrganizationForm(false);
    };

    // =====================================================
    // DEPARTMENT INPUT
    // =====================================================

    const handleDepartmentChange = (e) => {

        setDepartmentForm({
            name: e.target.value,
        });
    };

    // =====================================================
    // CREATE / UPDATE DEPARTMENT
    // =====================================================

    const handleDepartmentSubmit = async (e) => {

        e.preventDefault();

        if (!departmentForm.name.trim()) {
            alert("Department name is required");
            return;
        }

        try {

            if (editingDepartment) {

                await updateDepartment(
                    editingDepartment.id,
                    departmentForm
                );

            } else {

                await createDepartment(departmentForm);

            }

            await loadDepartments();

            resetDepartmentForm();

        } catch (error) {

            console.error("Department save failed", error);

            alert(
                error.response?.data?.message ||
                "Failed to save department"
            );
        }
    };

    // =====================================================
    // EDIT DEPARTMENT
    // =====================================================

    const handleEditDepartment = (department) => {

        setEditingDepartment(department);

        setDepartmentForm({
            name: department.name || "",
        });

        setShowDepartmentForm(true);
    };

    // =====================================================
    // DELETE DEPARTMENT
    // =====================================================

    const handleDeleteDepartment = async (id) => {

        if (!window.confirm("Are you sure you want to delete this department?")) {
            return;
        }

        try {

            await deleteDepartment(id);
            await loadDepartments();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete department"
            );
        }
    };

    // =====================================================
    // RESET DEPARTMENT
    // =====================================================

    const resetDepartmentForm = () => {

        setDepartmentForm({
            name: "",
        });

        setEditingDepartment(null);
        setShowDepartmentForm(false);
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="min-h-screen bg-white p-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center justify-between mb-8">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Organization Management
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage organizations and departments
                    </p>
                </div>

            </div>


            {/* =================================================
                ORGANIZATION SECTION
            ================================================= */}

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm">

                {/* HEADER */}

                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Organizations
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage your registered organizations
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            resetOrganizationForm();
                            setShowOrganizationForm(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Add Organization
                    </button>

                </div>


                {/* =================================================
                    ORGANIZATION LIST
                ================================================= */}

                <div>

                    {organizations.length === 0 ? (

                        <div className="p-10 text-center text-gray-500">
                            No organizations found.
                        </div>

                    ) : (

                        organizations.map((organization) => (

                            // "group" lets the left indicator line react to
                            // hover on this row only, via group-hover below.
                            <div
                                key={organization.id}
                                className="group relative flex items-center justify-between px-6 py-5 border-b border-gray-100 border-l-4 border-l-transparent hover:bg-gray-50 hover:border-l-emerald-500 transition-colors"
                            >

                                {/* ICON + DETAILS */}

                                <div className="flex items-center gap-4">

                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-700">
                                        {organization.organizationName
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </div>

                                    <div>

                                        <h3 className="font-semibold text-gray-900">
                                            {organization.organizationName}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            {organization.organizationCode}
                                            {" • "}
                                            {organization.industry}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {organization.contactEmail}
                                        </p>

                                    </div>

                                </div>


                                {/* RIGHT SIDE */}

                                <div className="flex items-center gap-3">

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            organization.active
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {organization.active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                    {/* ACTION ICON GROUP */}
                                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">

                                        <button
                                            onClick={() =>
                                                handleEditOrganization(organization)
                                            }
                                            className="p-2 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleToggleOrganization(
                                                    organization
                                                )
                                            }
                                            className={`p-2 rounded-md transition-colors ${
                                                organization.active
                                                    ? "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                                    : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                                            }`}
                                            title={
                                                organization.active
                                                    ? "Deactivate"
                                                    : "Activate"
                                            }
                                        >
                                            {organization.active ? (
                                                <PowerOff size={16} />
                                            ) : (
                                                <Power size={16} />
                                            )}
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDeleteOrganization(
                                                    organization.id
                                                )
                                            }
                                            className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>


            {/* =================================================
                ORGANIZATION FORM — POPUP
            ================================================= */}

            {showOrganizationForm && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) resetOrganizationForm();
                    }}
                >

                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">

                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                    {editingOrganization
                                        ? "Edit Organization"
                                        : "Add Organization"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {editingOrganization
                                        ? "Update the organization's details"
                                        : "Register a new organization"}
                                </p>
                            </div>

                            <button
                                onClick={resetOrganizationForm}
                                className="text-gray-400 hover:text-gray-700 rounded-lg p-1.5 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleOrganizationSubmit}
                            className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
                        >

                            {/* Organization Name */}

                            <Input
                                label="Organization Name"
                                name="organizationName"
                                value={organizationForm.organizationName}
                                onChange={handleOrganizationChange}
                                placeholder="Enter organization name"
                                required
                            />


                            {/* Organization Code */}

                            <Input
                                label="Organization Code"
                                name="organizationCode"
                                value={organizationForm.organizationCode}
                                onChange={handleOrganizationChange}
                                placeholder="ORG-001"
                                required
                            />


                            {/* Industry */}

                            <Input
                                label="Industry"
                                name="industry"
                                value={organizationForm.industry}
                                onChange={handleOrganizationChange}
                                placeholder="Banking / Finance"
                                required
                            />


                            {/* Contact Email */}

                            <Input
                                label="Contact Email"
                                name="contactEmail"
                                type="email"
                                value={organizationForm.contactEmail}
                                onChange={handleOrganizationChange}
                                placeholder="admin@example.com"
                                required
                            />


                            {/* Contact Phone */}

                            <Input
                                label="Contact Phone"
                                name="contactPhone"
                                value={organizationForm.contactPhone}
                                onChange={handleOrganizationChange}
                                placeholder="9876543210"
                                maxLength={10}
                                required
                            />


                            {/* Address */}

                            <div className="md:col-span-2">

                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={organizationForm.address}
                                    onChange={handleOrganizationChange}
                                    placeholder="Enter organization address"
                                    rows="3"
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">

                                <button
                                    type="button"
                                    onClick={resetOrganizationForm}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                                >
                                    {editingOrganization
                                        ? "Update Organization"
                                        : "Add Organization"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* =================================================
                DEPARTMENT SECTION
            ================================================= */}

            <div className="mt-8 border border-gray-200 rounded-xl bg-white shadow-sm">

                {/* HEADER */}

                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Departments
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage organization departments
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            resetDepartmentForm();
                            setShowDepartmentForm(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Add Department
                    </button>

                </div>


                {/* DEPARTMENT LIST */}

                <div>

                    {departments.length === 0 ? (

                        <div className="p-10 text-center text-gray-500">
                            No departments found.
                        </div>

                    ) : (

                        departments.map((department) => (

                            <div
                                key={department.id}
                                className="group relative flex items-center justify-between px-6 py-4 border-b border-gray-100 border-l-4 border-l-transparent hover:bg-gray-50 hover:border-l-emerald-500 transition-colors"
                            >

                                <div className="flex items-center gap-4">

                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                                        {department.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </div>

                                    <div>

                                        <h3 className="font-medium text-gray-900">
                                            {department.name}
                                        </h3>

                                        <p className="text-xs text-gray-400">
                                            Department
                                        </p>

                                    </div>

                                </div>


                                {/* ACTION ICON GROUP */}
                                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">

                                    <button
                                        onClick={() =>
                                            handleEditDepartment(department)
                                        }
                                        className="p-2 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDeleteDepartment(
                                                department.id
                                            )
                                        }
                                        className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>


            {/* =================================================
                DEPARTMENT FORM — POPUP
            ================================================= */}

            {showDepartmentForm && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) resetDepartmentForm();
                    }}
                >

                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">

                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">

                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                    {editingDepartment
                                        ? "Edit Department"
                                        : "Add Department"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {editingDepartment
                                        ? "Update the department name"
                                        : "Create a new department"}
                                </p>
                            </div>

                            <button
                                onClick={resetDepartmentForm}
                                className="text-gray-400 hover:text-gray-700 rounded-lg p-1.5 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            onSubmit={handleDepartmentSubmit}
                            className="p-6"
                        >

                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Department Name
                            </label>

                            <input
                                type="text"
                                value={departmentForm.name}
                                onChange={handleDepartmentChange}
                                placeholder="Enter department name"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">

                                <button
                                    type="button"
                                    onClick={resetDepartmentForm}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                                >
                                    {editingDepartment
                                        ? "Update"
                                        : "Add Department"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};


// =====================================================
// REUSABLE INPUT
// =====================================================

const Input = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    maxLength,
}) => {

    return (
        <div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

        </div>
    );
};

export default OrganizationManagement;