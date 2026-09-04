import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
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
  Lock,
  CheckCircle2,
} from "lucide-react";
import { getAllRoles } from "../service/roleService";
import { getAllDepartments } from "../service/departmentService";
import { register } from "../service/AuthService";

/* ------------------------------------------------------------------ */
/*  STATIC CONFIG                                                      */
/* ------------------------------------------------------------------ */

// Maps the route segment (e.g. "internal-auditor") to the backend role
// code (e.g. "INTERNAL_AUDITOR"). Used ONLY to auto-select a role that
// was already loaded from the backend — this is not a source of truth
// for roles, just a lookup key.
const ROUTE_TO_ROLE_CODE = {
  "internal-auditor": "INTERNAL_AUDITOR",
  "audit-manager": "AUDIT_MANAGER",
  "chief-audit-executive": "CHIEF_AUDIT_EXECUTIVE",
  "risk-officer": "RISK_OFFICER",
  auditee: "AUDITEE",
  "compliance-officer": "COMPLIANCE_OFFICER",
  "system-administrator": "SYSTEM_ADMINISTRATOR",
};

const STEPS = [
  { id: 1, key: "userDetails", label: "User Details", icon: User },
  { id: 2, key: "role", label: "Role", icon: Shield },
  { id: 3, key: "department", label: "Department", icon: Building2 },
  { id: 4, key: "profile", label: "Profile", icon: IdCard },
  { id: 5, key: "review", label: "Review", icon: ClipboardList },
];

const DEFAULT_PASSWORD = "1234";

const EMPTY_FORM = {
  employeeId: "",
  email: "",
  role: null, // full role object from backend
  department: null, // full department object from backend
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

/* ------------------------------------------------------------------ */
/*  SMALL UI PRIMITIVES                                                */
/* ------------------------------------------------------------------ */

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-emerald-600 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400
        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
        transition-colors duration-150
        ${error ? "border-red-400" : "border-gray-200"} ${className}`}
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
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP TRACKER                                                       */
/* ------------------------------------------------------------------ */

function StepTracker({ currentStep, furthestStep }) {
  return (
    <>
      {/* Vertical tracker — desktop */}
      <div className="hidden md:flex flex-col w-52 shrink-0 pr-6 border-r border-gray-100 mr-8">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep || step.id < furthestStep;
          const isCurrent = step.id === currentStep;
          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center mr-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all duration-200
                  ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4.5 h-4.5" strokeWidth={2.5} />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[2.25rem] my-1 rounded-full transition-colors duration-200 ${
                      step.id < currentStep || step.id < furthestStep
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <div className="pt-1.5 pb-8">
                <p
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isCurrent
                      ? "text-emerald-700"
                      : isCompleted
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

      {/* Horizontal tracker — mobile */}
      <div className="flex md:hidden items-center mb-6 overflow-x-auto pb-1">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep || step.id < furthestStep;
          const isCurrent = step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors duration-200
                  ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={`text-[11px] mt-1 whitespace-nowrap ${
                    isCurrent ? "text-emerald-700 font-medium" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 mx-1 rounded-full shrink-0 ${
                    step.id < currentStep || step.id < furthestStep
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

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function CreateUser({
  onSuccess,
  onClose,
  role, // optional prop: e.g. "INTERNAL_AUDITOR" — locks the role directly
  title, // optional prop: header label, e.g. "Internal Auditor"
  password, // optional prop: overrides the default password
}) {
  const params = useParams();

  // Role can be locked two ways: a route param (/admin/users/internal-auditor)
  // or a direct prop (<CreateUser role="INTERNAL_AUDITOR" />). The prop wins
  // when both are present.
  const routeSegment = params.role || null;
  const lockedRoleCode =
    (role && role.toUpperCase()) ||
    (routeSegment ? ROUTE_TO_ROLE_CODE[routeSegment] : null) ||
    null;

  const defaultPassword = password || DEFAULT_PASSWORD;

  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ---------------------------- Load roles ---------------------------- */
  useEffect(() => {
    let active = true;
    setRolesLoading(true);
    setRolesError("");

    getAllRoles()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.content || [];
        setRoles(list);

        // Auto-select role if the role is locked (via prop or route)
        if (lockedRoleCode) {
          const matched = list.find(
            (r) => (r.name || r.code || "").toUpperCase() === lockedRoleCode
          );
          if (matched) {
            setForm((prev) => ({ ...prev, role: matched }));
          }
        }
      })
      .catch((err) => {
        if (!active) return;
        setRolesError(
          err?.response?.data?.message ||
            "Failed to load roles. Please try again."
        );
      })
      .finally(() => {
        if (active) setRolesLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedRoleCode]);

  /* ------------------------- Load departments -------------------------- */
  useEffect(() => {
    let active = true;
    setDepartmentsLoading(true);
    setDepartmentsError("");

    getAllDepartments()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.content || [];
        setDepartments(list);
      })
      .catch((err) => {
        if (!active) return;
        setDepartmentsError(
          err?.response?.data?.message ||
            "Failed to load departments. Please try again."
        );
      })
      .finally(() => {
        if (active) setDepartmentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Lock background scroll while the modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* ------------------------------------------------------------------ */
  /*  Field updates                                                       */
  /* ------------------------------------------------------------------ */

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateProfileField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /* ------------------------------------------------------------------ */
  /*  Per-step validation                                                 */
  /* ------------------------------------------------------------------ */

  const validateStep = (step) => {
    const next = {};

    if (step === 1) {
      if (!form.employeeId.trim()) next.employeeId = "Employee ID is required.";
      if (!form.email.trim()) {
        next.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        next.email = "Enter a valid email address.";
      }
    }

    if (step === 2) {
      if (!form.role) next.role = "Please select a role.";
    }

    if (step === 3) {
      if (!form.department) next.department = "Please select a department.";
    }

    if (step === 4) {
      if (!form.profile.firstName.trim())
        next.firstName = "First name is required.";
      if (!form.profile.lastName.trim())
        next.lastName = "Last name is required.";
      if (!form.profile.designation.trim())
        next.designation = "Designation is required.";
      if (!form.profile.phoneNumber.trim()) {
        next.phoneNumber = "Phone number is required.";
      } else if (!/^\d{10}$/.test(form.profile.phoneNumber.trim())) {
        next.phoneNumber = "Enter a valid 10-digit phone number.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isStepValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        form.employeeId.trim() &&
        form.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      );
    }
    if (currentStep === 2) return !!form.role;
    if (currentStep === 3) return !!form.department;
    if (currentStep === 4) {
      return (
        form.profile.firstName.trim() &&
        form.profile.lastName.trim() &&
        form.profile.designation.trim() &&
        /^\d{10}$/.test(form.profile.phoneNumber.trim())
      );
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, currentStep]);

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    const next = Math.min(currentStep + 1, STEPS.length);
    setCurrentStep(next);
    setFurthestStep((f) => Math.max(f, next));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const goToStep = (step) => {
    // Only allow jumping to steps already reached.
    if (step <= furthestStep) setCurrentStep(step);
  };

  /* ------------------------------------------------------------------ */
  /*  Submit                                                              */
  /* ------------------------------------------------------------------ */

  const buildPayload = () => ({
    employeeId: form.employeeId.trim(),
    email: form.email.trim(),
    password: defaultPassword,
    role: { id: form.role.id },
    department: { id: form.department.id },
    profile: {
      firstName: form.profile.firstName.trim(),
      lastName: form.profile.lastName.trim(),
      gender: form.profile.gender || null,
      dateOfBirth: form.profile.dateOfBirth || null,
      phoneNumber: form.profile.phoneNumber.trim(),
      designation: form.profile.designation.trim(),
      address: form.profile.address.trim(),
      city: form.profile.city.trim(),
      state: form.profile.state.trim(),
      country: form.profile.country.trim(),
    },
  });

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await register(buildPayload());
      setSuccessMessage("User created successfully.");
      // Give the success state a brief moment to render before closing.
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 900);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setSubmitError("Your session has expired. Please log in again.");
      } else if (status === 403) {
        setSubmitError("You do not have permission to create users.");
      } else {
        setSubmitError(
          err?.response?.data?.message ||
            "Failed to create user. Please review the details and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Step content renderers                                             */
  /* ------------------------------------------------------------------ */

  const renderStepOne = () => (
    <div>
      <SectionTitle
        title="User Details"
        subtitle="Basic account information for the new user."
      />
      <div className="space-y-5 max-w-md">
        <div>
          <FieldLabel required>Employee ID</FieldLabel>
          <TextInput
            placeholder="EMP001"
            value={form.employeeId}
            error={errors.employeeId}
            onChange={(e) => updateField("employeeId", e.target.value)}
          />
          <ErrorText>{errors.employeeId}</ErrorText>
        </div>

        <div>
          <FieldLabel required>Email</FieldLabel>
          <TextInput
            type="email"
            placeholder="user@company.com"
            value={form.email}
            error={errors.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
          <ErrorText>{errors.email}</ErrorText>
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              readOnly
              value={defaultPassword}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Default password: {defaultPassword}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStepTwo = () => {
    if (lockedRoleCode) {
      const roleObj = form.role;
      return (
        <div>
          <SectionTitle
            title="Role"
            subtitle="This user is being created for a specific role."
          />
          <div className="max-w-md">
            <FieldLabel>Role</FieldLabel>
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <span className="text-sm font-medium text-emerald-800">
                {roleObj?.name
                  ? formatRoleName(roleObj.name)
                  : formatRoleName(lockedRoleCode)}
              </span>
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            {!roleObj && (
              <p className="mt-2 text-xs text-slate-500">
                Loading role details…
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <SectionTitle
          title="Role"
          subtitle="Select the role this user will be assigned."
        />

        {rolesLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading roles…
          </div>
        )}

        {!rolesLoading && rolesError && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {rolesError}
          </div>
        )}

        {!rolesLoading && !rolesError && (
          <div className="grid sm:grid-cols-2 gap-3">
            {roles.map((r) => {
              const selected = form.role?.id === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => updateField("role", r)}
                  className={`text-left rounded-xl border px-4 py-3.5 transition-colors duration-150 ${
                    selected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatRoleName(r.name || r.code)}
                      </p>
                      {r.description && (
                        <p className="text-xs text-slate-500 mt-1">
                          {r.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-4.5 h-4.5 rounded-full border shrink-0 flex items-center justify-center mt-0.5 ${
                        selected
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <ErrorText>{errors.role}</ErrorText>
      </div>
    );
  };

  const renderStepThree = () => (
    <div>
      <SectionTitle
        title="Department"
        subtitle="Select the department this user belongs to."
      />

      {departmentsLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading departments…
        </div>
      )}

      {!departmentsLoading && departmentsError && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {departmentsError}
        </div>
      )}

      {!departmentsLoading && !departmentsError && (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            {departments
              .filter((d) => d.active === undefined || d.active)
              .map((dept) => {
                const selected = form.department?.id === dept.id;
                return (
                  <button
                    type="button"
                    key={dept.id}
                    onClick={() => updateField("department", dept)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors duration-150 ${
                      selected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-800">
                      {dept.name}
                    </span>
                    {selected && (
                      <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
          </div>
          <ErrorText>{errors.department}</ErrorText>

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

  const renderStepFour = () => {
    const p = form.profile;
    return (
      <div>
        <SectionTitle
          title="Profile Details"
          subtitle="Personal information for the user profile."
        />
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
          <div>
            <FieldLabel required>First Name</FieldLabel>
            <TextInput
              value={p.firstName}
              error={errors.firstName}
              onChange={(e) => updateProfileField("firstName", e.target.value)}
            />
            <ErrorText>{errors.firstName}</ErrorText>
          </div>

          <div>
            <FieldLabel required>Last Name</FieldLabel>
            <TextInput
              value={p.lastName}
              error={errors.lastName}
              onChange={(e) => updateProfileField("lastName", e.target.value)}
            />
            <ErrorText>{errors.lastName}</ErrorText>
          </div>

          <div>
            <FieldLabel>Gender</FieldLabel>
            <select
              value={p.gender}
              onChange={(e) => updateProfileField("gender", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <FieldLabel>Date of Birth</FieldLabel>
            <TextInput
              type="date"
              value={p.dateOfBirth}
              onChange={(e) => updateProfileField("dateOfBirth", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel required>Phone Number</FieldLabel>
            <TextInput
              placeholder="9876543210"
              value={p.phoneNumber}
              error={errors.phoneNumber}
              onChange={(e) =>
                updateProfileField(
                  "phoneNumber",
                  e.target.value.replace(/[^\d]/g, "").slice(0, 10)
                )
              }
            />
            <ErrorText>{errors.phoneNumber}</ErrorText>
          </div>

          <div>
            <FieldLabel required>Designation</FieldLabel>
            <TextInput
              placeholder="Internal Auditor"
              value={p.designation}
              error={errors.designation}
              onChange={(e) => updateProfileField("designation", e.target.value)}
            />
            <ErrorText>{errors.designation}</ErrorText>
          </div>

          <div className="sm:col-span-2">
            <FieldLabel>Address</FieldLabel>
            <TextInput
              value={p.address}
              onChange={(e) => updateProfileField("address", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>City</FieldLabel>
            <TextInput
              value={p.city}
              onChange={(e) => updateProfileField("city", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>State</FieldLabel>
            <TextInput
              value={p.state}
              onChange={(e) => updateProfileField("state", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Country</FieldLabel>
            <TextInput
              value={p.country}
              onChange={(e) => updateProfileField("country", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStepFive = () => {
    const p = form.profile;

    const ReviewSection = ({ title: sectionTitle, step, children }) => (
      <div className="rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
            {sectionTitle}
          </h4>
          <button
            type="button"
            onClick={() => goToStep(step)}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Edit
          </button>
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {children}
        </dl>
      </div>
    );

    const Row = ({ label, value }) => (
      <div className="flex justify-between sm:block">
        <dt className="text-slate-500">{label}</dt>
        <dd className="text-slate-800 font-medium sm:mt-0.5">
          {value || <span className="text-slate-400">—</span>}
        </dd>
      </div>
    );

    return (
      <div>
        <SectionTitle
          title="Review & Submit"
          subtitle="Confirm the details below before creating the user."
        />

        <div className="space-y-4">
          <ReviewSection title="User Details" step={1}>
            <Row label="Employee ID" value={form.employeeId} />
            <Row label="Email" value={form.email} />
            <Row label="Password" value={defaultPassword} />
          </ReviewSection>

          <ReviewSection title="Role" step={lockedRoleCode ? 1 : 2}>
            <Row
              label="Role"
              value={form.role ? formatRoleName(form.role.name) : ""}
            />
          </ReviewSection>

          <ReviewSection title="Department" step={3}>
            <Row label="Department" value={form.department?.name} />
          </ReviewSection>

          <ReviewSection title="Profile" step={4}>
            <Row label="First Name" value={p.firstName} />
            <Row label="Last Name" value={p.lastName} />
            <Row label="Gender" value={p.gender} />
            <Row label="Date of Birth" value={p.dateOfBirth} />
            <Row label="Phone" value={p.phoneNumber} />
            <Row label="Designation" value={p.designation} />
            <Row label="Address" value={p.address} />
            <Row label="City" value={p.city} />
            <Row label="State" value={p.state} />
            <Row label="Country" value={p.country} />
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

  const stepRenderers = {
    1: renderStepOne,
    2: renderStepTwo,
    3: renderStepThree,
    4: renderStepFour,
    5: renderStepFive,
  };

  /* ------------------------------------------------------------------ */
  /*  Success overlay                                                     */
  /* ------------------------------------------------------------------ */

  if (successMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm px-8 py-10 flex flex-col items-center text-center animate-[fadeIn_0.2s_ease-out]">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            {successMessage}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {title ? `${title} added successfully.` : "The user has been added."}
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Layout                                                              */
  /* ------------------------------------------------------------------ */

  return (
    // Fixed, full-screen overlay so the wizard renders as a centered
    // modal/drawer above the page, instead of inline in normal page flow.
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-0 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="bg-white sm:rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl min-h-screen sm:min-h-0 my-0 sm:my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {title ? `Create ${title}` : "Create User"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Add a new user to the Audit &amp; Risk Management System.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 flex flex-col md:flex-row max-h-[calc(100vh-180px)] sm:max-h-[65vh] overflow-y-auto">
          <StepTracker currentStep={currentStep} furthestStep={furthestStep} />

          <div className="flex-1 min-w-0">{stepRenderers[currentStep]()}</div>
        </div>

        {/* Footer */}
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
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}

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
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Creating…" : "Create User"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatRoleName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}