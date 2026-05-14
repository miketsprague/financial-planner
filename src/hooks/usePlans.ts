"use client";

import { useCallback } from "react";
import type {
  Assumptions,
  EmploymentIncome,
  IncomeStream,
  Plan,
  QuickStartInput,
  StatePensionConfig,
} from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import {
  createPlan,
  deserializePlans,
  duplicatePlan,
  serializePlans,
  updatePlan,
} from "@/lib/plans";

const STORAGE_KEY = "financial-planner:plans";
const ACTIVE_KEY = "financial-planner:activePlanId";

export type UpdatePlanDataChanges = {
  input?: QuickStartInput | null;
  assumptions?: Assumptions;
  employmentIncomes?: EmploymentIncome[];
  statePensionConfig?: StatePensionConfig;
  incomeStreams?: IncomeStream[];
};

export type UsePlansReturn = {
  plans: Plan[];
  activePlanId: string | null;
  activePlan: Plan | null;
  createNewPlan: (name?: string) => Plan;
  selectPlan: (id: string) => void;
  renamePlan: (id: string, name: string) => void;
  deletePlan: (id: string) => void;
  duplicateActivePlan: () => void;
  updatePlanData: (id: string, changes: UpdatePlanDataChanges) => void;
};

function parsePlans(raw: string): Plan[] {
  return deserializePlans(raw);
}

export function usePlans(): UsePlansReturn {
  const [plansRaw, setPlansRaw] = useLocalStorage<string>(STORAGE_KEY, "[]");
  const [activePlanId, setActivePlanId] = useLocalStorage<string | null>(
    ACTIVE_KEY,
    null,
  );

  const plans = parsePlans(plansRaw);

  const savePlans = useCallback(
    (next: Plan[]) => {
      setPlansRaw(serializePlans(next));
    },
    [setPlansRaw],
  );

  const activePlan = plans.find((p) => p.id === activePlanId) ?? plans[0] ?? null;

  const createNewPlan = useCallback(
    (name = "My Plan"): Plan => {
      const plan = createPlan(name);
      savePlans([...plans, plan]);
      setActivePlanId(plan.id);
      return plan;
    },
    [plans, savePlans, setActivePlanId],
  );

  const selectPlan = useCallback(
    (id: string) => {
      setActivePlanId(id);
    },
    [setActivePlanId],
  );

  const renamePlan = useCallback(
    (id: string, name: string) => {
      savePlans(
        plans.map((p) => (p.id === id ? updatePlan(p, { name }) : p)),
      );
    },
    [plans, savePlans],
  );

  const deletePlan = useCallback(
    (id: string) => {
      const next = plans.filter((p) => p.id !== id);
      savePlans(next);
      if (activePlanId === id) {
        setActivePlanId(next[0]?.id ?? null);
      }
    },
    [plans, savePlans, activePlanId, setActivePlanId],
  );

  const duplicateActivePlan = useCallback(() => {
    if (!activePlan) return;
    const copy = duplicatePlan(activePlan, `${activePlan.name} (copy)`);
    savePlans([...plans, copy]);
    setActivePlanId(copy.id);
  }, [activePlan, plans, savePlans, setActivePlanId]);

  const updatePlanData = useCallback(
    (id: string, changes: UpdatePlanDataChanges) => {
      savePlans(
        plans.map((p) => (p.id === id ? updatePlan(p, changes) : p)),
      );
    },
    [plans, savePlans],
  );

  return {
    plans,
    activePlanId: activePlan?.id ?? null,
    activePlan,
    createNewPlan,
    selectPlan,
    renamePlan,
    deletePlan,
    duplicateActivePlan,
    updatePlanData,
  };
}
