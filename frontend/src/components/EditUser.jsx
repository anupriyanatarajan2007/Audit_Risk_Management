import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Building2,
  IdCard,
  ClipboardList,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  UserCheck,
  UserX,
} from "lucide-react";

import axios from "axios";
import { getAllRoles } from "../service/roleService";
import { getAllDepartments } from "../service/departmentService";

const STEPS = [
  { id: 1, label: "User Details", icon: User },
  { id: 2, label: "Role", icon: Shield },
  { id: 3, label: "Department", icon: Building2 },
  { id: 4, label: "Profile", icon: IdCard },
  { id: 5, label: "Review", icon: ClipboardList },
];

const EMPTY_FORM = {
  employeeId: "",
  email: "",
  active: true,

  role: null,
  department: null,

  profile: {
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    designation: "",
    address: "",
    city: "",
    state: "",
    country: "",
  },
};

/* ============================================================
   SMALL UI COMPONENTS
============================================================ */

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && (
        <span className="text-emerald-600 ml-0.5">*</span>
      )}
    </label>
  );
}

function TextInput({
  error,
  className = "",
  ...props
}) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm
        text-slate-800 placeholder:text-slate-400
        focus:outline-none focus:ring-2
        focus:ring-emerald-500/40
        focus:border-emerald-500
        transition-colors duration-150
        ${
          error
            ? "border-red-400"
            : "border-gray-200"
        }
        ${className}`}
    />
  );
}

function ErrorText({ children }) {
  if (!children) return null;

  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {children}
    </p>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-slate-800">
        {title}
      </h3>

      {subtitle && (
        <p className="text-sm text-slate-500 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   STEP TRACKER
============================================================ */

function StepTracker({
  currentStep,
  furthestStep,
}) {
  return (
    <>
      {/* Desktop */}

      <div className="hidden md:flex flex-col w-52 shrink-0 pr-6 border-r border-gray-100 mr-8">
        {STEPS.map((step, index) => {
          const completed =
            step.id < currentStep ||
            step.id < furthestStep;

          const current =
            step.id === currentStep;

          return (
            <div
              key={step.id}
              className="flex items-start"
            >
              <div className="flex flex-col items-center mr-3">
                <div
                  className={`flex items-center justify-center
                    w-9 h-9 rounded-full shrink-0
                    transition-all duration-200
                    ${
                      completed
                        ? "bg-emerald-600 text-white"
                        : current
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {completed ? (
                    <Check
                      className="w-4 h-4"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {step.id}
                    </span>
                  )}
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[2.25rem] my-1 rounded-full
                      ${
                        step.id < currentStep ||
                        step.id < furthestStep
                          ? "bg-emerald-500"
                          : "bg-gray-200"
                      }`}
                  />
                )}
              </div>

              <div className="pt-1.5 pb-8">
                <p
                  className={`text-sm font-medium
                    ${
                      current
                        ? "text-emerald-700"
                        : completed
                        ? "text-slate-700"
                        : "text-gray-400"
                    }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile */}

      <div className="flex md:hidden items-center mb-6 overflow-x-auto pb-1">
        {STEPS.map((step, index) => {
          const completed =
            step.id < currentStep ||
            step.id < furthestStep;

          const current =
            step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`flex items-center justify-center
                    w-8 h-8 rounded-full text-xs font-semibold
                    ${
                      completed
                        ? "bg-emerald-600 text-white"
                        : current
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>

                <span
                  className={`text-[11px] mt-1 whitespace-nowrap
                    ${
                      current
                        ? "text-emerald-700 font-medium"
                        : "text-gray-400"
                    }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 mx-1 rounded-full shrink-0
                    ${
                      step.id < currentStep ||
                      step.id < furthestStep
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================
   MAIN EDIT USER
============================================================ */

export default function EditUser({
  open,
  user,
  onClose,
  loadUsers,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);

  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [rolesLoading, setRolesLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] =
    useState(false);

  const [rolesError, setRolesError] = useState("");
  const [departmentsError, setDepartmentsError] =
    useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  /* ============================================================
     LOAD USER
  ============================================================ */

  useEffect(() => {
    if (!open || !user) return;

    /*
     * Supports responses like:
     *
     * {
     *   id: 1,
     *   employeeId: "EMP001",
     *   email: "abc@gmail.com",
     *   active: true,
     *   role: {
     *      id: 1,
     *      name: "INTERNAL_AUDITOR"
     *   },
     *   department: {
     *      id: 1,
     *      name: "INTERNAL_AUDIT"
     *   },
     *   profile: {...}
     * }
     */

    const selectedUser =
      user?.data ||
      user?.user ||
      user;

    const profile =
      selectedUser?.profile || {};

    console.log(
      "EDIT USER RESPONSE:",
      selectedUser
    );

    setForm({
      employeeId:
        selectedUser?.employeeId || "",

      email:
        selectedUser?.email || "",

      /*
       * Supports:
       * active: true
       * status: "ACTIVE"
       */
      active:
        selectedUser?.active !== undefined
          ? selectedUser.active
          : selectedUser?.status === "ACTIVE"
          ? true
          : true,

      role:
        selectedUser?.role || null,

      department:
        selectedUser?.department || null,

      profile: {
        firstName:
          profile?.firstName || "",

        lastName:
          profile?.lastName || "",

        gender:
          profile?.gender || "",

        dateOfBirth:
          profile?.dateOfBirth || "",

        phoneNumber:
          profile?.phoneNumber
            ? String(profile.phoneNumber)
            : "",

        designation:
          profile?.designation || "",

        address:
          profile?.address || "",

        city:
          profile?.city || "",

        state:
          profile?.state || "",

        country:
          profile?.country || "",
      },
    });

    setCurrentStep(1);
    setFurthestStep(1);
    setErrors({});
    setSubmitError("");
    setSuccessMessage("");
  }, [open, user]);

  /* ============================================================
     LOAD ROLES
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    let active = true;

    setRolesLoading(true);
    setRolesError("");

    getAllRoles()
      .then((data) => {
        if (!active) return;

        const list = Array.isArray(data)
          ? data
          : data?.content || [];

        setRoles(list);

        /*
         * If selected user's role came as only
         * { id, name }, replace it with the
         * complete role object from backend.
         */

        setForm((prev) => {
          if (!prev.role?.id) return prev;

          const matched = list.find(
            (r) => r.id === prev.role.id
          );

          return {
            ...prev,
            role: matched || prev.role,
          };
        });
      })
      .catch((err) => {
        if (!active) return;

        setRolesError(
          err?.response?.data?.message ||
            "Failed to load roles."
        );
      })
      .finally(() => {
        if (active) {
          setRolesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open]);

  /* ============================================================
     LOAD DEPARTMENTS
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    let active = true;

    setDepartmentsLoading(true);
    setDepartmentsError("");

    getAllDepartments()
      .then((data) => {
        if (!active) return;

        const list = Array.isArray(data)
          ? data
          : data?.content || [];

        setDepartments(list);

        setForm((prev) => {
          if (!prev.department?.id) {
            return prev;
          }

          const matched = list.find(
            (d) => d.id === prev.department.id
          );

          return {
            ...prev,
            department:
              matched || prev.department,
          };
        });
      })
      .catch((err) => {
        if (!active) return;

        setDepartmentsError(
          err?.response?.data?.message ||
            "Failed to load departments."
        );
      })
      .finally(() => {
        if (active) {
          setDepartmentsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open]);

  /* ============================================================
     LOCK BODY SCROLL
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    const original =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        original;
    };
  }, [open]);

  /* ============================================================
     ESCAPE
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, [open, onClose]);

  /* ============================================================
     UPDATE FIELDS
  ============================================================ */

  const updateField = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const updateProfileField = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateStep = (step) => {
    const next = {};

    if (step === 1) {
      if (!form.employeeId.trim()) {
        next.employeeId =
          "Employee ID is required.";
      }

      if (!form.email.trim()) {
        next.email =
          "Email is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim()
        )
      ) {
        next.email =
          "Enter a valid email address.";
      }
    }

    if (step === 2) {
      if (!form.role) {
        next.role =
          "Please select a role.";
      }
    }

    if (step === 3) {
      if (!form.department) {
        next.department =
          "Please select a department.";
      }
    }

    if (step === 4) {
      if (!form.profile.firstName.trim()) {
        next.firstName =
          "First name is required.";
      }

      if (!form.profile.lastName.trim()) {
        next.lastName =
          "Last name is required.";
      }

      if (!form.profile.designation.trim()) {
        next.designation =
          "Designation is required.";
      }

      if (!form.profile.phoneNumber.trim()) {
        next.phoneNumber =
          "Phone number is required.";
      } else if (
        !/^\d{10}$/.test(
          form.profile.phoneNumber.trim()
        )
      ) {
        next.phoneNumber =
          "Enter a valid 10-digit phone number.";
      }
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  /* ============================================================
     STEP VALIDATION FOR NEXT BUTTON
  ============================================================ */

  const isStepValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        form.employeeId.trim() &&
        form.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim()
        )
      );
    }

    if (currentStep === 2) {
      return !!form.role;
    }

    if (currentStep === 3) {
      return !!form.department;
    }

    if (currentStep === 4) {
      return (
        form.profile.firstName.trim() &&
        form.profile.lastName.trim() &&
        form.profile.designation.trim() &&
        /^\d{10}$/.test(
          form.profile.phoneNumber.trim()
        )
      );
    }

    return true;
  }, [form, currentStep]);

  /* ============================================================
     NEXT
  ============================================================ */

  const goNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const next = Math.min(
      currentStep + 1,
      STEPS.length
    );

    setCurrentStep(next);

    setFurthestStep((prev) =>
      Math.max(prev, next)
    );
  };

  /* ============================================================
     BACK
  ============================================================ */

  const goBack = () => {
    setCurrentStep((prev) =>
      Math.max(1, prev - 1)
    );
  };

  /* ============================================================
     JUMP TO STEP
  ============================================================ */

  const goToStep = (step) => {
    if (step <= furthestStep) {
      setCurrentStep(step);
    }
  };

  /* ============================================================
     BUILD UPDATE PAYLOAD
  ============================================================ */

  const buildPayload = () => {
    return {
      employeeId:
        form.employeeId.trim(),

      email:
        form.email.trim(),

      /*
       * IMPORTANT:
       * This is what allows Active -> Inactive
       * and Inactive -> Active.
       */
      active: form.active,

      role: form.role
        ? {
            id: form.role.id,
          }
        : null,

      department: form.department
        ? {
            id: form.department.id,
          }
        : null,

      profile: {
        firstName:
          form.profile.firstName.trim(),

        lastName:
          form.profile.lastName.trim(),

        gender:
          form.profile.gender || null,

        dateOfBirth:
          form.profile.dateOfBirth || null,

        phoneNumber:
          form.profile.phoneNumber.trim(),

        designation:
          form.profile.designation.trim(),

        address:
          form.profile.address.trim(),

        city:
          form.profile.city.trim(),

        state:
          form.profile.state.trim(),

        country:
          form.profile.country.trim(),
      },
    };
  };

  /* ============================================================
     SUBMIT UPDATE
  ============================================================ */

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);

    try {
      const token =
        localStorage.getItem("token");

      const userId =
        user?.id ||
        user?.data?.id ||
        user?.user?.id;

      if (!userId) {
        throw new Error(
          "User ID not found."
        );
      }

      const payload =
        buildPayload();

      console.log(
        "UPDATE USER ID:",
        userId
      );

      console.log(
        "UPDATE USER PAYLOAD:",
        payload
      );

      await axios.put(
        `http://localhost:8080/users/${userId}`,
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      setSuccessMessage(
        "User updated successfully."
      );

      await loadUsers?.();

      setTimeout(() => {
        onClose?.();
      }, 900);
    } catch (err) {
      console.error(
        "UPDATE USER ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err?.response?.status
      );

      console.error(
        "RESPONSE:",
        err?.response?.data
      );

      const status =
        err?.response?.status;

      if (status === 401) {
        setSubmitError(
          "Your session has expired. Please log in again."
        );
      } else if (status === 403) {
        setSubmitError(
          "You do not have permission to update users."
        );
      } else {
        setSubmitError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to update user."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     STEP 1 - USER DETAILS
  ============================================================ */

  const renderStepOne = () => (
    <div>
      <SectionTitle
        title="User Details"
        subtitle="Update the user's account information."
      />

      <div className="space-y-5 max-w-md">

        {/* Employee ID */}

        <div>
          <FieldLabel required>
            Employee ID
          </FieldLabel>

          <TextInput
            placeholder="EMP001"
            value={form.employeeId}
            error={errors.employeeId}
            onChange={(e) =>
              updateField(
                "employeeId",
                e.target.value
              )
            }
          />

          <ErrorText>
            {errors.employeeId}
          </ErrorText>
        </div>

        {/* Email */}

        <div>
          <FieldLabel required>
            Email
          </FieldLabel>

          <TextInput
            type="email"
            placeholder="user@company.com"
            value={form.email}
            error={errors.email}
            onChange={(e) =>
              updateField(
                "email",
                e.target.value
              )
            }
          />

          <ErrorText>
            {errors.email}
          </ErrorText>
        </div>

        {/* ACTIVE / INACTIVE */}

        <div>
          <FieldLabel>
            Account Status
          </FieldLabel>

          <div className="grid grid-cols-2 gap-3">

            {/* ACTIVE */}

            <button
              type="button"
              onClick={() =>
                updateField(
                  "active",
                  true
                )
              }
              className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all
                ${
                  form.active
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center
                  ${
                    form.active
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Active
                </p>

                <p className="text-xs text-slate-500">
                  User can login
                </p>
              </div>

              {form.active && (
                <Check className="w-4 h-4 text-emerald-600 ml-auto" />
              )}
            </button>

            {/* INACTIVE */}

            <button
              type="button"
              onClick={() =>
                updateField(
                  "active",
                  false
                )
              }
              className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all
                ${
                  !form.active
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center
                  ${
                    !form.active
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
              >
                <UserX className="w-5 h-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Inactive
                </p>

                <p className="text-xs text-slate-500">
                  Login disabled
                </p>
              </div>

              {!form.active && (
                <Check className="w-4 h-4 text-red-500 ml-auto" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ============================================================
     STEP 2 - ROLE
  ============================================================ */

  const renderStepTwo = () => (
    <div>
      <SectionTitle
        title="Role"
        subtitle="Update the role assigned to this user."
      />

      {rolesLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading roles...
        </div>
      )}

      {!rolesLoading && rolesError && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4" />
          {rolesError}
        </div>
      )}

      {!rolesLoading &&
        !rolesError && (
          <div className="grid sm:grid-cols-2 gap-3">

            {roles.map((r) => {
              const selected =
                form.role?.id === r.id;

              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() =>
                    updateField(
                      "role",
                      r
                    )
                  }
                  className={`text-left rounded-xl border px-4 py-4 transition-all
                    ${
                      selected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatRoleName(
                          r.name ||
                            r.code
                        )}
                      </p>

                      {r.description && (
                        <p className="text-xs text-slate-500 mt-1">
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                        ${
                          selected
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-gray-300"
                        }`}
                    >
                      {selected && (
                        <Check
                          className="w-3 h-3 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      <ErrorText>
        {errors.role}
      </ErrorText>
    </div>
  );

  /* ============================================================
     STEP 3 - DEPARTMENT
  ============================================================ */

  const renderStepThree = () => (
    <div>
      <SectionTitle
        title="Department"
        subtitle="Update the department assigned to this user."
      />

      {departmentsLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading departments...
        </div>
      )}

      {!departmentsLoading &&
        departmentsError && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4" />
            {departmentsError}
          </div>
        )}

      {!departmentsLoading &&
        !departmentsError && (
          <>
            <div className="grid sm:grid-cols-2 gap-3">

              {departments
                .filter(
                  (d) =>
                    d.active ===
                      undefined ||
                    d.active
                )
                .map((dept) => {
                  const selected =
                    form.department?.id ===
                    dept.id;

                  return (
                    <button
                      type="button"
                      key={dept.id}
                      onClick={() =>
                        updateField(
                          "department",
                          dept
                        )
                      }
                      className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left transition-all
                        ${
                          selected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                        }`}
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {dept.name}
                      </span>

                      {selected && (
                        <Check
                          className="w-4 h-4 text-emerald-600"
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
            </div>

            <ErrorText>
              {errors.department}
            </ErrorText>

            {form.department && (
              <p className="mt-4 text-sm text-slate-600">
                Selected Department:{" "}
                <span className="font-semibold text-slate-800">
                  {form.department.name}
                </span>
              </p>
            )}
          </>
        )}
    </div>
  );

  /* ============================================================
     STEP 4 - PROFILE
  ============================================================ */

  const renderStepFour = () => {
    const p = form.profile;

    return (
      <div>
        <SectionTitle
          title="Profile Details"
          subtitle="Update personal information."
        />

        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">

          {/* First Name */}

          <div>
            <FieldLabel required>
              First Name
            </FieldLabel>

            <TextInput
              value={p.firstName}
              error={errors.firstName}
              onChange={(e) =>
                updateProfileField(
                  "firstName",
                  e.target.value
                )
              }
            />

            <ErrorText>
              {errors.firstName}
            </ErrorText>
          </div>

          {/* Last Name */}

          <div>
            <FieldLabel required>
              Last Name
            </FieldLabel>

            <TextInput
              value={p.lastName}
              error={errors.lastName}
              onChange={(e) =>
                updateProfileField(
                  "lastName",
                  e.target.value
                )
              }
            />

            <ErrorText>
              {errors.lastName}
            </ErrorText>
          </div>

          {/* Gender */}

          <div>
            <FieldLabel>
              Gender
            </FieldLabel>

            <select
              value={p.gender}
              onChange={(e) =>
                updateProfileField(
                  "gender",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            >
              <option value="">
                Select gender
              </option>

              <option value="MALE">
                Male
              </option>

              <option value="FEMALE">
                Female
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          {/* DOB */}

          <div>
            <FieldLabel>
              Date of Birth
            </FieldLabel>

            <TextInput
              type="date"
              value={p.dateOfBirth}
              onChange={(e) =>
                updateProfileField(
                  "dateOfBirth",
                  e.target.value
                )
              }
            />
          </div>

          {/* Phone */}

          <div>
            <FieldLabel required>
              Phone Number
            </FieldLabel>

            <TextInput
              placeholder="9876543210"
              value={p.phoneNumber}
              error={errors.phoneNumber}
              onChange={(e) =>
                updateProfileField(
                  "phoneNumber",
                  e.target.value
                    .replace(/[^\d]/g, "")
                    .slice(0, 10)
                )
              }
            />

            <ErrorText>
              {errors.phoneNumber}
            </ErrorText>
          </div>

          {/* Designation */}

          <div>
            <FieldLabel required>
              Designation
            </FieldLabel>

            <TextInput
              placeholder="Internal Auditor"
              value={p.designation}
              error={errors.designation}
              onChange={(e) =>
                updateProfileField(
                  "designation",
                  e.target.value
                )
              }
            />

            <ErrorText>
              {errors.designation}
            </ErrorText>
          </div>

          {/* Address */}

          <div className="sm:col-span-2">
            <FieldLabel>
              Address
            </FieldLabel>

            <TextInput
              value={p.address}
              onChange={(e) =>
                updateProfileField(
                  "address",
                  e.target.value
                )
              }
            />
          </div>

          {/* City */}

          <div>
            <FieldLabel>
              City
            </FieldLabel>

            <TextInput
              value={p.city}
              onChange={(e) =>
                updateProfileField(
                  "city",
                  e.target.value
                )
              }
            />
          </div>

          {/* State */}

          <div>
            <FieldLabel>
              State
            </FieldLabel>

            <TextInput
              value={p.state}
              onChange={(e) =>
                updateProfileField(
                  "state",
                  e.target.value
                )
              }
            />
          </div>

          {/* Country */}

          <div>
            <FieldLabel>
              Country
            </FieldLabel>

            <TextInput
              value={p.country}
              onChange={(e) =>
                updateProfileField(
                  "country",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      </div>
    );
  };

  /* ============================================================
     STEP 5 - REVIEW
  ============================================================ */

  const renderStepFive = () => {
    const p = form.profile;

    const ReviewSection = ({
      title,
      step,
      children,
    }) => (
      <div className="rounded-xl border border-gray-200 p-5">

        <div className="flex items-center justify-between mb-3">

          <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
            {title}
          </h4>

          <button
            type="button"
            onClick={() =>
              goToStep(step)
            }
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Edit
          </button>
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {children}
        </dl>
      </div>
    );

    const Row = ({
      label,
      value,
    }) => (
      <div>
        <dt className="text-slate-500">
          {label}
        </dt>

        <dd className="text-slate-800 font-medium mt-0.5">
          {value || (
            <span className="text-slate-400">
              —
            </span>
          )}
        </dd>
      </div>
    );

    return (
      <div>
        <SectionTitle
          title="Review & Update"
          subtitle="Confirm the changes before updating the user."
        />

        <div className="space-y-4">

          {/* USER */}

          <ReviewSection
            title="User Details"
            step={1}
          >
            <Row
              label="Employee ID"
              value={form.employeeId}
            />

            <Row
              label="Email"
              value={form.email}
            />

            <Row
              label="Status"
              value={
                form.active
                  ? "Active"
                  : "Inactive"
              }
            />
          </ReviewSection>

          {/* ROLE */}

          <ReviewSection
            title="Role"
            step={2}
          >
            <Row
              label="Role"
              value={
                form.role
                  ? formatRoleName(
                      form.role.name ||
                        form.role.code
                    )
                  : ""
              }
            />
          </ReviewSection>

          {/* DEPARTMENT */}

          <ReviewSection
            title="Department"
            step={3}
          >
            <Row
              label="Department"
              value={
                form.department?.name
              }
            />
          </ReviewSection>

          {/* PROFILE */}

          <ReviewSection
            title="Profile"
            step={4}
          >
            <Row
              label="First Name"
              value={p.firstName}
            />

            <Row
              label="Last Name"
              value={p.lastName}
            />

            <Row
              label="Gender"
              value={p.gender}
            />

            <Row
              label="Date of Birth"
              value={p.dateOfBirth}
            />

            <Row
              label="Phone"
              value={p.phoneNumber}
            />

            <Row
              label="Designation"
              value={p.designation}
            />

            <Row
              label="Address"
              value={p.address}
            />

            <Row
              label="City"
              value={p.city}
            />

            <Row
              label="State"
              value={p.state}
            />

            <Row
              label="Country"
              value={p.country}
            />
          </ReviewSection>
        </div>

        {submitError && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        )}
      </div>
    );
  };

  /* ============================================================
     STEP RENDERERS
  ============================================================ */

  const stepRenderers = {
    1: renderStepOne,
    2: renderStepTwo,
    3: renderStepThree,
    4: renderStepFour,
    5: renderStepFive,
  };

  /* ============================================================
     CLOSED
  ============================================================ */

  if (!open || !user) {
    return null;
  }

  /* ============================================================
     SUCCESS
  ============================================================ */

  if (successMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm px-8 py-10 flex flex-col items-center text-center">

          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle2
              className="w-8 h-8 text-emerald-600"
              strokeWidth={2}
            />
          </div>

          <h3 className="text-lg font-semibold text-slate-800">
            {successMessage}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            The user details have been updated.
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN MODAL
  ============================================================ */

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-0 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          onClose?.();
        }
      }}
    >

      <div className="bg-white sm:rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl min-h-screen sm:min-h-0 my-0 sm:my-8 overflow-hidden">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white">

          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Edit User
            </h2>

            <p className="text-sm text-slate-500 mt-0.5">
              Update user information in the Audit & Risk Management System.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="px-6 sm:px-8 py-6 flex flex-col md:flex-row max-h-[calc(100vh-180px)] sm:max-h-[65vh] overflow-y-auto">

          <StepTracker
            currentStep={currentStep}
            furthestStep={furthestStep}
          />

          <div className="flex-1 min-w-0">
            {stepRenderers[currentStep]()}
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50/60">

          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!isStepValid}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next

                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}

                {submitting
                  ? "Updating..."
                  : "Update User"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatRoleName(name) {
  if (!name) return "";

  return name
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}
