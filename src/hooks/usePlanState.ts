"use client";

import { useCallback, useEffect, useState } from "react";
import type { Account, Benefit, Goal, Plan } from "@/types";
import { createExamplePlan, generateId } from "@/lib/example-plan";
import {
  clearStoredPlan,
  loadStoredPlan,
  parsePlanEnvelope,
  saveStoredPlan,
  serializePlanEnvelope,
} from "@/lib/plan-storage";

export type UsePlanStateReturn = {
  plan: Plan;
  updatePlan: (updater: (prev: Plan) => Plan) => void;
  addAccount: () => void;
  updateAccount: (id: string, changes: Partial<Omit<Account, "id">>) => void;
  removeAccount: (id: string) => void;
  addGoal: () => void;
  updateGoal: (id: string, changes: Partial<Omit<Goal, "id">>) => void;
  removeGoal: (id: string) => void;
  addBenefit: () => void;
  updateBenefit: (id: string, changes: Partial<Omit<Benefit, "id">>) => void;
  removeBenefit: (id: string) => void;
  exportPlanJson: () => string;
  importPlanJson: (raw: string) => { ok: true } | { ok: false; error: string };
  resetToExample: () => void;
};

/**
 * Owns the single current plan, persisting every change to `localStorage`
 * as a versioned envelope (acceptance criterion 21). Falls back to the
 * example plan on first use or when no valid stored plan exists.
 */
export function usePlanState(): UsePlanStateReturn {
  const [plan, setPlan] = useState<Plan>(
    () => loadStoredPlan() ?? createExamplePlan(),
  );

  // Persist on every change, including the very first render, so that a
  // first-time visitor's browser has a saved plan immediately
  // (acceptance criterion 21).
  useEffect(() => {
    saveStoredPlan(plan);
  }, [plan]);

  const updatePlan = useCallback((updater: (prev: Plan) => Plan) => {
    setPlan((prev) => updater(prev));
  }, []);

  const addAccount = useCallback(() => {
    updatePlan((prev) => ({
      ...prev,
      accounts: [
        ...prev.accounts,
        {
          id: generateId("account"),
          name: "New account",
          type: "cash",
          currency: prev.profile.reportingCurrency,
          balance: 0,
          annualContribution: 0,
          expectedReturn: 0.03,
        },
      ],
    }));
  }, [updatePlan]);

  const updateAccount = useCallback(
    (id: string, changes: Partial<Omit<Account, "id">>) => {
      updatePlan((prev) => ({
        ...prev,
        accounts: prev.accounts.map((account) =>
          account.id === id ? { ...account, ...changes } : account,
        ),
      }));
    },
    [updatePlan],
  );

  const removeAccount = useCallback(
    (id: string) => {
      updatePlan((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((account) => account.id !== id),
      }));
    },
    [updatePlan],
  );

  const addGoal = useCallback(() => {
    updatePlan((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          id: generateId("goal"),
          name: "New goal",
          age: prev.profile.currentAge + 1,
          amount: 0,
          currency: prev.profile.reportingCurrency,
          kind: "expense",
        },
      ],
    }));
  }, [updatePlan]);

  const updateGoal = useCallback(
    (id: string, changes: Partial<Omit<Goal, "id">>) => {
      updatePlan((prev) => ({
        ...prev,
        goals: prev.goals.map((goal) =>
          goal.id === id ? { ...goal, ...changes } : goal,
        ),
      }));
    },
    [updatePlan],
  );

  const removeGoal = useCallback(
    (id: string) => {
      updatePlan((prev) => ({
        ...prev,
        goals: prev.goals.filter((goal) => goal.id !== id),
      }));
    },
    [updatePlan],
  );

  const addBenefit = useCallback(() => {
    updatePlan((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          id: generateId("benefit"),
          name: "New benefit",
          kind: "other",
          enabled: true,
          startAge: prev.profile.retirementAge,
          annualAmount: 0,
          currency: prev.profile.reportingCurrency,
          growthRate: 0.02,
        },
      ],
    }));
  }, [updatePlan]);

  const updateBenefit = useCallback(
    (id: string, changes: Partial<Omit<Benefit, "id">>) => {
      updatePlan((prev) => ({
        ...prev,
        benefits: prev.benefits.map((benefit) =>
          benefit.id === id ? { ...benefit, ...changes } : benefit,
        ),
      }));
    },
    [updatePlan],
  );

  const removeBenefit = useCallback(
    (id: string) => {
      updatePlan((prev) => ({
        ...prev,
        benefits: prev.benefits.filter((benefit) => benefit.id !== id),
      }));
    },
    [updatePlan],
  );

  const exportPlanJson = useCallback(() => serializePlanEnvelope(plan), [plan]);

  const importPlanJson = useCallback(
    (raw: string): { ok: true } | { ok: false; error: string } => {
      const result = parsePlanEnvelope(raw);
      if (!result.ok) return result;
      setPlan(result.plan);
      return { ok: true };
    },
    [],
  );

  const resetToExample = useCallback(() => {
    clearStoredPlan();
    setPlan(createExamplePlan());
  }, []);

  return {
    plan,
    updatePlan,
    addAccount,
    updateAccount,
    removeAccount,
    addGoal,
    updateGoal,
    removeGoal,
    addBenefit,
    updateBenefit,
    removeBenefit,
    exportPlanJson,
    importPlanJson,
    resetToExample,
  };
}
