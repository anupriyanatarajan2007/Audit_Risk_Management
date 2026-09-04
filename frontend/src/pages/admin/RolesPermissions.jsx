import React, { useEffect, useMemo, useState } from "react";

import {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
    assignPermission,
    removePermission,
} from "../../service/roleService";

import {
    getAllPermissions,
    createPermission,
    updatePermission,
    deletePermission,
} from "../../service/permissionService";

const RolesPermissions = () => {
    // =====================================================
    // STATE
    // =====================================================

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);

    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const [roleSearch, setRoleSearch] = useState("");
    const [permissionSearch, setPermissionSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("ALL");

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const [editingRole, setEditingRole] = useState(null);
    const [editingPermission, setEditingPermission] = useState(null);

    const [roleForm, setRoleForm] = useState({
        name: "",
        description: "",
        active: true,
    });

    const [permissionForm, setPermissionForm] = useState({
        name: "",
        module: "",
        action: "",
        description: "",
        active: true,
    });

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

    const loadRoles = async () => {
        try {
            setLoadingRoles(true);

            const data = await getAllRoles();

            setRoles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load roles:", error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const loadPermissions = async () => {
        try {
            setLoadingPermissions(true);

            const data = await getAllPermissions();

            setPermissions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load permissions:", error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    // =====================================================
    // SELECT ROLE
    // =====================================================

    const handleSelectRole = async (role) => {
        try {
            setSelectedRole(role);

            const data = await getRolePermissions(role.id);

            setRolePermissions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load role permissions:", error);
            setRolePermissions([]);
        }
    };

    // =====================================================
    // ROLE FORM
    // =====================================================

    const handleRoleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setRoleForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openCreateRole = () => {
        setEditingRole(null);

        setRoleForm({
            name: "",
            description: "",
            active: true,
        });

        setShowRoleModal(true);
    };

    const openEditRole = (role) => {
        setEditingRole(role);

        setRoleForm({
            name: role.name || "",
            description: role.description || "",
            active: role.active ?? true,
        });

        setShowRoleModal(true);
    };

    const handleSaveRole = async (e) => {
        e.preventDefault();

        if (!roleForm.name.trim()) {
            alert("Role name is required");
            return;
        }

        try {
            if (editingRole) {
                await updateRole(editingRole.id, roleForm);
            } else {
                await createRole(roleForm);
            }

            setShowRoleModal(false);

            await loadRoles();
        } catch (error) {
            console.error("Failed to save role:", error);

            alert(
                error.response?.data?.message ||
                "Failed to save role"
            );
        }
    };

    // =====================================================
    // DELETE ROLE
    // =====================================================

    const handleDeleteRole = async (role) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${role.name}"?`
        );

        if (!confirmed) return;

        try {
            await deleteRole(role.id);

            if (selectedRole?.id === role.id) {
                setSelectedRole(null);
                setRolePermissions([]);
            }

            await loadRoles();
        } catch (error) {
            console.error("Failed to delete role:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete role"
            );
        }
    };

    // =====================================================
    // PERMISSION FORM
    // =====================================================

    const handlePermissionChange = (e) => {
        const { name, value, type, checked } = e.target;

        setPermissionForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openCreatePermission = () => {
        setEditingPermission(null);

        setPermissionForm({
            name: "",
            module: "",
            action: "",
            description: "",
            active: true,
        });

        setShowPermissionModal(true);
    };

    const openEditPermission = (permission) => {
        setEditingPermission(permission);

        setPermissionForm({
            name: permission.name || "",
            module: permission.module || "",
            action: permission.action || "",
            description: permission.description || "",
            active: permission.active ?? true,
        });

        setShowPermissionModal(true);
    };

    const handleSavePermission = async (e) => {
        e.preventDefault();

        if (!permissionForm.name.trim()) {
            alert("Permission name is required");
            return;
        }

        if (!permissionForm.module.trim()) {
            alert("Module is required");
            return;
        }

        if (!permissionForm.action.trim()) {
            alert("Action is required");
            return;
        }

        try {
            if (editingPermission) {
                await updatePermission(
                    editingPermission.id,
                    permissionForm
                );
            } else {
                await createPermission(permissionForm);
            }

            setShowPermissionModal(false);

            await loadPermissions();

            if (selectedRole) {
                const data = await getRolePermissions(
                    selectedRole.id
                );

                setRolePermissions(
                    Array.isArray(data) ? data : []
                );
            }
        } catch (error) {
            console.error(
                "Failed to save permission:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save permission"
            );
        }
    };

    // =====================================================
    // DELETE PERMISSION
    // =====================================================

    const handleDeletePermission = async (permission) => {
        const confirmed = window.confirm(
            `Delete permission "${permission.name}"?`
        );

        if (!confirmed) return;

        try {
            await deletePermission(permission.id);

            await loadPermissions();

            if (selectedRole) {
                const data = await getRolePermissions(
                    selectedRole.id
                );

                setRolePermissions(
                    Array.isArray(data) ? data : []
                );
            }
        } catch (error) {
            console.error(
                "Failed to delete permission:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete permission"
            );
        }
    };

    // =====================================================
    // ASSIGN / REMOVE PERMISSION
    // =====================================================

    const hasPermission = (permissionId) => {
        return rolePermissions.some(
            (permission) => permission.id === permissionId
        );
    };

    const handlePermissionToggle = async (permission) => {
        if (!selectedRole) {
            alert("Select a role first");
            return;
        }

        try {
            if (hasPermission(permission.id)) {
                const updatedRole = await removePermission(
                    selectedRole.id,
                    permission.id
                );

                setRolePermissions(
                    updatedRole.permissions || []
                );
            } else {
                const updatedRole = await assignPermission(
                    selectedRole.id,
                    permission.id
                );

                setRolePermissions(
                    updatedRole.permissions || []
                );
            }
        } catch (error) {
            console.error(
                "Failed to update permission:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update permission"
            );
        }
    };

    // =====================================================
    // FILTER ROLES
    // =====================================================

    const filteredRoles = useMemo(() => {
        return roles.filter((role) =>
            role.name
                ?.toLowerCase()
                .includes(roleSearch.toLowerCase())
        );
    }, [roles, roleSearch]);

    // =====================================================
    // MODULES
    // =====================================================

    const modules = useMemo(() => {
        return [
            ...new Set(
                permissions
                    .map((permission) => permission.module)
                    .filter(Boolean)
            ),
        ];
    }, [permissions]);

    // =====================================================
    // FILTER PERMISSIONS
    // =====================================================

    const filteredPermissions = useMemo(() => {
        return permissions.filter((permission) => {
            const searchMatch =
                permission.name
                    ?.toLowerCase()
                    .includes(
                        permissionSearch.toLowerCase()
                    ) ||
                permission.description
                    ?.toLowerCase()
                    .includes(
                        permissionSearch.toLowerCase()
                    );

            const moduleMatch =
                moduleFilter === "ALL" ||
                permission.module === moduleFilter;

            return searchMatch && moduleMatch;
        });
    }, [
        permissions,
        permissionSearch,
        moduleFilter,
    ]);

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-white p-6 md:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Roles & Permissions
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage system roles and control
                        access permissions.
                    </p>
                </div>

            </div>


            {/* =================================================
                STATS
            ================================================= */}

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Roles
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {roles.length}
                    </h2>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Permissions
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {permissions.length}
                    </h2>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Active Roles
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-emerald-600">
                        {
                            roles.filter(
                                (role) => role.active
                            ).length
                        }
                    </h2>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Assigned Permissions
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-teal-600">
                        {rolePermissions.length}
                    </h2>
                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">


                {/* =================================================
                    ROLES
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

                    {/* Header */}

                    <div className="flex items-center justify-between border-b border-slate-200 p-5">

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Roles
                            </h2>

                            <p className="text-xs text-slate-500">
                                {roles.length} roles
                            </p>
                        </div>

                        <button
                            onClick={openCreateRole}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                        >
                            + Add Role
                        </button>

                    </div>


                    {/* Search */}

                    <div className="p-4">

                        <div className="relative">

                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={roleSearch}
                                onChange={(e) =>
                                    setRoleSearch(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                            />

                        </div>

                    </div>


                    {/* Role List */}

                    <div className="max-h-[600px] overflow-y-auto">

                        {loadingRoles ? (

                            <div className="p-10 text-center text-sm text-slate-500">
                                Loading roles...
                            </div>

                        ) : filteredRoles.length === 0 ? (

                            <div className="p-10 text-center text-sm text-slate-500">
                                No roles found.
                            </div>

                        ) : (

                            filteredRoles.map((role) => (

                                <div
                                    key={role.id}
                                    onClick={() =>
                                        handleSelectRole(
                                            role
                                        )
                                    }
                                    className={`group flex cursor-pointer items-center justify-between border-t border-slate-100 px-5 py-4 transition ${
                                        selectedRole?.id === role.id
                                            ? "border-l-4 border-l-teal-600 bg-teal-50"
                                            : "hover:bg-slate-50"
                                    }`}
                                >

                                    <div className="flex min-w-0 items-center gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
                                            {role.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0">

                                            <h3 className="truncate text-sm font-semibold text-slate-900">
                                                {role.name}
                                            </h3>

                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                {role.description ||
                                                    "No description"}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="ml-3 flex items-center gap-2">

                                        <span
                                            className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${
                                                role.active
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-600"
                                            }`}
                                        >
                                            {role.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>


                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditRole(role);
                                            }}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            ✏️
                                        </button>


                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteRole(
                                                    role
                                                );
                                            }}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                        >
                                            🗑️
                                        </button>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>


                {/* =================================================
                    PERMISSIONS
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">

                    {/* Header */}

                    <div className="border-b border-slate-200 p-5">

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Permissions
                                </h2>

                                <p className="text-xs text-slate-500">
                                    {selectedRole
                                        ? `Managing permissions for ${selectedRole.name}`
                                        : "Select a role to manage permissions"}
                                </p>

                            </div>


                            <button
                                onClick={
                                    openCreatePermission
                                }
                                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                            >
                                + Add Permission
                            </button>

                        </div>

                    </div>


                    {/* Filters */}

                    <div className="flex flex-col gap-3 p-4 md:flex-row">

                        <input
                            type="text"
                            placeholder="Search permissions..."
                            value={permissionSearch}
                            onChange={(e) =>
                                setPermissionSearch(
                                    e.target.value
                                )
                            }
                            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                        />


                        <select
                            value={moduleFilter}
                            onChange={(e) =>
                                setModuleFilter(
                                    e.target.value
                                )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        >

                            <option value="ALL">
                                All Modules
                            </option>

                            {modules.map((module) => (

                                <option
                                    key={module}
                                    value={module}
                                >
                                    {module}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* Permission List */}

                    <div className="max-h-[600px] overflow-y-auto">

                        {loadingPermissions ? (

                            <div className="p-10 text-center text-sm text-slate-500">
                                Loading permissions...
                            </div>

                        ) : filteredPermissions.length === 0 ? (

                            <div className="p-10 text-center text-sm text-slate-500">
                                No permissions found.
                            </div>

                        ) : (

                            filteredPermissions.map(
                                (permission) => {

                                    const assigned =
                                        hasPermission(
                                            permission.id
                                        );

                                    return (

                                        <div
                                            key={permission.id}
                                            className="flex items-start gap-3 border-t border-slate-100 px-5 py-4 hover:bg-slate-50"
                                        >

                                            {/* Checkbox */}

                                            <div className="pt-1">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        assigned
                                                    }
                                                    disabled={
                                                        !selectedRole ||
                                                        !permission.active
                                                    }
                                                    onChange={() =>
                                                        handlePermissionToggle(
                                                            permission
                                                        )
                                                    }
                                                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />

                                            </div>


                                            {/* Permission Info */}

                                            <div className="min-w-0 flex-1">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h3 className="text-sm font-semibold text-slate-900">
                                                        {
                                                            permission.name
                                                        }
                                                    </h3>


                                                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                                        {
                                                            permission.module
                                                        }
                                                    </span>


                                                    <span className="rounded-md bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-700">
                                                        {
                                                            permission.action
                                                        }
                                                    </span>

                                                </div>


                                                <p className="mt-1 text-xs text-slate-500">
                                                    {
                                                        permission.description
                                                    }
                                                </p>

                                            </div>


                                            {/* Actions */}

                                            <div className="flex items-center gap-1">

                                                <button
                                                    onClick={() =>
                                                        openEditPermission(
                                                            permission
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    ✏️
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        handleDeletePermission(
                                                            permission
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    🗑️
                                                </button>

                                            </div>

                                        </div>

                                    );
                                }
                            )

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                SELECTED ROLE SUMMARY
            ================================================= */}

            {selectedRole && (

                <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-5">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                                Selected Role
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                {selectedRole.name}
                            </h2>

                        </div>


                        <div className="rounded-xl bg-white px-5 py-3 shadow-sm">

                            <span className="text-xs text-slate-500">
                                Assigned Permissions
                            </span>

                            <p className="text-xl font-bold text-teal-600">
                                {rolePermissions.length}
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                ROLE MODAL
            ================================================= */}

            {showRoleModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingRole
                                        ? "Edit Role"
                                        : "Create Role"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Configure role details
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    setShowRoleModal(
                                        false
                                    )
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                ✕
                            </button>

                        </div>


                        <form
                            onSubmit={handleSaveRole}
                            className="space-y-5 p-6"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Role Name
                                </label>

                                <input
                                    name="name"
                                    value={roleForm.name}
                                    onChange={
                                        handleRoleChange
                                    }
                                    placeholder="e.g. AUDIT_MANAGER"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        roleForm.description
                                    }
                                    onChange={
                                        handleRoleChange
                                    }
                                    rows="3"
                                    placeholder="Enter role description..."
                                    className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>


                            <label className="flex cursor-pointer items-center gap-3">

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={
                                        roleForm.active
                                    }
                                    onChange={
                                        handleRoleChange
                                    }
                                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                                />

                                <span className="text-sm font-medium text-slate-700">
                                    Active Role
                                </span>

                            </label>


                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRoleModal(
                                            false
                                        )
                                    }
                                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                                >
                                    {editingRole
                                        ? "Update Role"
                                        : "Create Role"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                PERMISSION MODAL
            ================================================= */}

            {showPermissionModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingPermission
                                        ? "Edit Permission"
                                        : "Create Permission"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Configure permission details
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    setShowPermissionModal(
                                        false
                                    )
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                ✕
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSavePermission
                            }
                            className="space-y-5 p-6"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Permission Name
                                </label>

                                <input
                                    name="name"
                                    value={
                                        permissionForm.name
                                    }
                                    onChange={
                                        handlePermissionChange
                                    }
                                    placeholder="e.g. AUDIT_CREATE"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>


                            <div className="grid grid-cols-2 gap-4">

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Module
                                    </label>

                                    <input
                                        name="module"
                                        value={
                                            permissionForm.module
                                        }
                                        onChange={
                                            handlePermissionChange
                                        }
                                        placeholder="AUDIT"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                    />

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Action
                                    </label>

                                    <input
                                        name="action"
                                        value={
                                            permissionForm.action
                                        }
                                        onChange={
                                            handlePermissionChange
                                        }
                                        placeholder="CREATE"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                    />

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        permissionForm.description
                                    }
                                    onChange={
                                        handlePermissionChange
                                    }
                                    rows="3"
                                    placeholder="Enter permission description..."
                                    className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                />

                            </div>


                            <label className="flex cursor-pointer items-center gap-3">

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={
                                        permissionForm.active
                                    }
                                    onChange={
                                        handlePermissionChange
                                    }
                                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                                />

                                <span className="text-sm font-medium text-slate-700">
                                    Active Permission
                                </span>

                            </label>


                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPermissionModal(
                                            false
                                        )
                                    }
                                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                                >
                                    {editingPermission
                                        ? "Update Permission"
                                        : "Create Permission"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default RolesPermissions;