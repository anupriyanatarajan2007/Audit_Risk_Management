import { createContext, useContext, useState, useCallback } from "react";

const RiskCreationContext = createContext(null);

const initialData = {
  // Step 1 — Basic Info
  riskId: "",
  findingId: "",
  title: "",
  description: "",
  department: "",
  businessUnit: "",
  processName: "",
  // Step 2 — Assessment
  category: "",
  likelihood: "",
  impact: "",
  existingControls: "",
  riskScore: 0,
  riskLevel: "",
  // Step 3 — Mitigation
  controlOwner: "",
  mitigationPlan: "",
  targetClosureDate: "",
  assignedUserId: "",
  remarks: "",
};

export function RiskCreationProvider({ children }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);

  const updateData = useCallback((patch) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const openWizard = useCallback(() => {
    setData(initialData);
    setStep(1);
    setIsOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsOpen(false);
    setData(initialData);
    setStep(1);
  }, []);

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, 3)), []);
  const goPrevious = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  return (
    <RiskCreationContext.Provider
      value={{ step, data, isOpen, updateData, openWizard, closeWizard, goNext, goPrevious }}
    >
      {children}
    </RiskCreationContext.Provider>
  );
}

export function useRiskCreation() {
  const ctx = useContext(RiskCreationContext);
  if (!ctx) throw new Error("useRiskCreation must be used inside RiskCreationProvider");
  return ctx;
}