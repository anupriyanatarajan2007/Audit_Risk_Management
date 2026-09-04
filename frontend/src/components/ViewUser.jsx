import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Building2,
  IdCard,
  ClipboardList,
  X,
  UserCheck,
  UserX,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "User Details", icon: User },
  { id: 2, label: "Role", icon: Shield },
  { id: 3, label: "Department", icon: Building2 },
  { id: 4, label: "Profile", icon: IdCard },
  { id: 5, label: "Review", icon: ClipboardList },
];

/* ============================================================
   SMALL UI COMPONENTS
============================================================ */

function FieldLabel({ children }) {
  return (
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
      {children}
    </p>
  );
}

function ViewValue({ children, className = "" }) {
  return (
    <div
      className={`w-full rounded-lg border border-gray-200
        bg-gray-50 px-3.5 py-2.5 text-sm
        text-slate-800 min-h-[42px]
        flex items-center ${className}`}
    >
      {children || (
        <span className="text-slate-400">—</span>
      )}
    </div>
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

function StepTracker({ currentStep }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-col w-52 shrink-0 pr-6 border-r border-gray-100 mr-8">
        {STEPS.map((step, index) => {
          const completed = step.id < currentStep;
          const current = step.id === currentStep;

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
                      completed || current
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {completed ? (
                    <span className="text-sm">✓</span>
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
                        completed
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
          const completed = step.id < currentStep;
          const current = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`flex items-center justify-center
                    w-8 h-8 rounded-full text-xs font-semibold
                    ${
                      completed || current
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {completed ? "✓" : step.id}
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
                      completed
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
   MAIN VIEW USER
============================================================ */

export default function ViewUser({
  open,
  user,
  onClose,
}) {
  const [currentStep, setCurrentStep] = useState(1);

  /* ============================================================
     RESET STEP WHEN OPENING
  ============================================================ */

  useEffect(() => {
    if (open && user) {
      setCurrentStep(1);
    }
  }, [open, user]);

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

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [open, onClose]);

  if (!open || !user) {
    return null;
  }

  /* ============================================================
     NORMALIZE USER
  ============================================================ */

  const selectedUser =
    user?.data ||
    user?.user ||
    user;

  const profile =
    selectedUser?.profile || {};

  /* ============================================================
     STEP 1 - USER DETAILS
  ============================================================ */

  const renderStepOne = () => (
    <div>
      <SectionTitle
        title="User Details"
        subtitle="View the user's account information."
      />

      <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">

        <div>
          <FieldLabel>
            Employee ID
          </FieldLabel>

          <ViewValue>
            {selectedUser?.employeeId}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            Email
          </FieldLabel>

          <ViewValue>
            {selectedUser?.email}
          </ViewValue>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>
            Account Status
          </FieldLabel>

          <div
            className={`flex items-center gap-3 rounded-xl
              border px-4 py-3
              ${
                selectedUser?.active ??
                selectedUser?.enabled
              }
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
              }`}
          >
            {(selectedUser?.active ??
              selectedUser?.enabled) ? (
              <>
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
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
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center">
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ============================================================
     STEP 2 - ROLE
  ============================================================ */

  const renderStepTwo = () => {
    const roleName =
      selectedUser?.role?.name ||
      selectedUser?.role?.code ||
      selectedUser?.role;

    return (
      <div>
        <SectionTitle
          title="Role"
          subtitle="View the role assigned to this user."
        />

        <div className="max-w-2xl">
          <div
            className="rounded-xl border
              border-emerald-200 bg-emerald-50
              px-5 py-5"
          >
            <div className="flex items-center gap-4">

              <div
                className="w-11 h-11 rounded-xl
                  bg-emerald-600 text-white
                  flex items-center justify-center"
              >
                <Shield className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Assigned Role
                </p>

                <p className="text-base font-semibold text-slate-800 mt-1">
                  {formatRoleName(roleName)}
                </p>

                {selectedUser?.role?.description && (
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedUser.role.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ============================================================
     STEP 3 - DEPARTMENT
  ============================================================ */

  const renderStepThree = () => {
    const departmentName =
      selectedUser?.department?.name ||
      selectedUser?.department?.code ||
      selectedUser?.department;

    return (
      <div>
        <SectionTitle
          title="Department"
          subtitle="View the department assigned to this user."
        />

        <div className="max-w-2xl">
          <div
            className="rounded-xl border
              border-emerald-200 bg-emerald-50
              px-5 py-5"
          >
            <div className="flex items-center gap-4">

              <div
                className="w-11 h-11 rounded-xl
                  bg-emerald-600 text-white
                  flex items-center justify-center"
              >
                <Building2 className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Assigned Department
                </p>

                <p className="text-base font-semibold text-slate-800 mt-1">
                  {formatRoleName(
                    departmentName
                  )}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ============================================================
     STEP 4 - PROFILE
  ============================================================ */

  const renderStepFour = () => (
    <div>
      <SectionTitle
        title="Profile Details"
        subtitle="View the user's personal information."
      />

      <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">

        <div>
          <FieldLabel>
            First Name
          </FieldLabel>

          <ViewValue>
            {profile?.firstName}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            Last Name
          </FieldLabel>

          <ViewValue>
            {profile?.lastName}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            Gender
          </FieldLabel>

          <ViewValue>
            {formatRoleName(profile?.gender)}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            Date of Birth
          </FieldLabel>

          <ViewValue>
            {profile?.dateOfBirth}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            Phone Number
          </FieldLabel>

          <ViewValue>
            {profile?.phoneNumber}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            Designation
          </FieldLabel>

          <ViewValue>
            {profile?.designation}
          </ViewValue>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>
            Address
          </FieldLabel>

          <ViewValue>
            {profile?.address}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            City
          </FieldLabel>

          <ViewValue>
            {profile?.city}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            State
          </FieldLabel>

          <ViewValue>
            {profile?.state}
          </ViewValue>
        </div>

        <div>
          <FieldLabel>
            Country
          </FieldLabel>

          <ViewValue>
            {profile?.country}
          </ViewValue>
        </div>
      </div>
    </div>
  );

  /* ============================================================
     STEP 5 - REVIEW
  ============================================================ */

  const renderStepFive = () => {
    const roleName =
      selectedUser?.role?.name ||
      selectedUser?.role?.code ||
      selectedUser?.role;

    const departmentName =
      selectedUser?.department?.name ||
      selectedUser?.department?.code ||
      selectedUser?.department;

    const isActive =
      selectedUser?.active ??
      selectedUser?.enabled;

    const ReviewSection = ({
      title,
      children,
    }) => (
      <div className="rounded-xl border border-gray-200 p-5">
        <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">
          {title}
        </h4>

        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          {children}
        </dl>
      </div>
    );

    const Row = ({
      label,
      value,
    }) => (
      <div>
        <dt className="text-xs text-slate-500">
          {label}
        </dt>

        <dd className="text-sm text-slate-800 font-medium mt-1">
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
          title="Review"
          subtitle="Complete user information."
        />

        <div className="space-y-4">

          <ReviewSection title="User Details">
            <Row
              label="Employee ID"
              value={selectedUser?.employeeId}
            />

            <Row
              label="Email"
              value={selectedUser?.email}
            />

            <Row
              label="Status"
              value={
                isActive
                  ? "Active"
                  : "Inactive"
              }
            />

            <Row
              label="Created At"
              value={selectedUser?.createdAt}
            />

            <Row
              label="Updated At"
              value={selectedUser?.updatedAt}
            />
          </ReviewSection>

          <ReviewSection title="Role & Department">
            <Row
              label="Role"
              value={formatRoleName(roleName)}
            />

            <Row
              label="Department"
              value={formatRoleName(
                departmentName
              )}
            />
          </ReviewSection>

          <ReviewSection title="Profile">
            <Row
              label="First Name"
              value={profile?.firstName}
            />

            <Row
              label="Last Name"
              value={profile?.lastName}
            />

            <Row
              label="Gender"
              value={formatRoleName(
                profile?.gender
              )}
            />

            <Row
              label="Date of Birth"
              value={profile?.dateOfBirth}
            />

            <Row
              label="Phone"
              value={profile?.phoneNumber}
            />

            <Row
              label="Designation"
              value={profile?.designation}
            />

            <Row
              label="Address"
              value={profile?.address}
            />

            <Row
              label="City"
              value={profile?.city}
            />

            <Row
              label="State"
              value={profile?.state}
            />

            <Row
              label="Country"
              value={profile?.country}
            />
          </ReviewSection>

        </div>
      </div>
    );
  };

  /* ============================================================
     STEP RENDERER
  ============================================================ */

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStepOne();

      case 2:
        return renderStepTwo();

      case 3:
        return renderStepThree();

      case 4:
        return renderStepFour();

      case 5:
        return renderStepFive();

      default:
        return renderStepOne();
    }
  };

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const goNext = () => {
    setCurrentStep((prev) =>
      Math.min(prev + 1, STEPS.length)
    );
  };

  const goBack = () => {
    setCurrentStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  /* ============================================================
     MAIN MODAL
  ============================================================ */

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center
        bg-slate-900/50 backdrop-blur-[2px]
        p-0 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="bg-white sm:rounded-2xl shadow-2xl
          border border-gray-100
          w-full max-w-4xl
          min-h-screen sm:min-h-0
          my-0 sm:my-8
          overflow-hidden"
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="flex items-center justify-between
            px-6 sm:px-8 py-5
            border-b border-gray-100 bg-white"
        >
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              View User
            </h2>

            <p className="text-sm text-slate-500 mt-0.5">
              View complete user information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400
              hover:text-slate-600
              rounded-lg p-1.5
              hover:bg-gray-50
              transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div
          className="px-6 sm:px-8 py-6
            flex flex-col md:flex-row
            max-h-[calc(100vh-180px)]
            sm:max-h-[65vh]
            overflow-y-auto"
        >

          <StepTracker
            currentStep={currentStep}
          />

          <div className="flex-1 min-w-0">
            {renderCurrentStep()}
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div
          className="flex items-center justify-between
            px-6 sm:px-8 py-4
            border-t border-gray-100
            bg-gray-50/60"
        >

          {/* BACK */}

          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5
                  rounded-lg px-4 py-2.5
                  text-sm font-medium
                  text-slate-600
                  hover:bg-gray-100
                  transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5
                text-sm font-medium
                text-slate-500
                hover:bg-gray-100
                transition-colors"
            >
              Close
            </button>

            {currentStep < STEPS.length && (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1.5
                  rounded-lg
                  bg-emerald-600
                  px-5 py-2.5
                  text-sm font-medium
                  text-white
                  hover:bg-emerald-700
                  transition-colors"
              >
                Next

                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================
            OPTIONAL STEP NAVIGATION
        ====================================================== */}

        <div className="hidden">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() =>
                goToStep(step.id)
              }
            >
              {step.label}
            </button>
          ))}
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

  return String(name)
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}
