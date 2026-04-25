"use client";

import { useEffect } from "react";
import { getLocaleStrings } from "@/locales";
import { UK_DEFAULTS } from "@/lib/defaults";
import { useAssumptions } from "@/hooks/useAssumptions";
import { usePlans } from "@/hooks/usePlans";
import { QuickStartWizard } from "@/components/quick-start/QuickStartWizard";
import { AssumptionsPanel } from "@/components/assumptions/AssumptionsPanel";
import { PlanManager } from "@/components/plans/PlanManager";
import type { QuickStartInput } from "@/types";

const strings = getLocaleStrings("en-GB");

export default function Home() {
  const { assumptions, updateAssumption, setAssumptions, resetToDefaults } =
    useAssumptions({ ...UK_DEFAULTS });

  const {
    plans,
    activePlan,
    activePlanId,
    createNewPlan,
    selectPlan,
    renamePlan,
    deletePlan,
    duplicateActivePlan,
    updatePlanData,
  } = usePlans();

  // Bootstrap first plan if none exist
  useEffect(() => {
    if (plans.length === 0) {
      createNewPlan(strings.plans.defaultName);
    }
  }, [plans.length, createNewPlan]);

  // Sync assumptions from active plan when switching plans
  useEffect(() => {
    if (activePlan) {
      setAssumptions(activePlan.assumptions);
    }
  }, [activePlanId, setAssumptions]); // eslint-disable-line react-hooks/exhaustive-deps -- activePlan is derived from activePlanId; setAssumptions is stable

  function handleInputSubmit(input: QuickStartInput) {
    if (!activePlan) return;
    const next = { ...assumptions, lifeExpectancy: input.lifeExpectancy };
    setAssumptions(next);
    updatePlanData(activePlan.id, { input, assumptions: next });
  }

  function handleAssumptionUpdate<K extends keyof typeof assumptions>(
    key: K,
    value: (typeof assumptions)[K],
  ) {
    updateAssumption(key, value);
    if (activePlan) {
      updatePlanData(activePlan.id, {
        assumptions: { ...assumptions, [key]: value },
      });
    }
  }

  function handleResetAssumptions() {
    resetToDefaults();
    if (activePlan) {
      updatePlanData(activePlan.id, { assumptions: { ...UK_DEFAULTS } });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {strings.appTitle}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {strings.appSubtitle}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main projection area */}
          <div className="flex flex-col gap-8">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <QuickStartWizard
                strings={strings}
                activePlanName={activePlan?.name ?? ""}
                input={activePlan?.input ?? null}
                assumptions={assumptions}
                onInputSubmit={handleInputSubmit}
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <PlanManager
                strings={strings}
                plans={plans}
                activePlanId={activePlanId}
                onSelect={(id) => {
                  selectPlan(id);
                }}
                onRename={renamePlan}
                onDuplicate={duplicateActivePlan}
                onDelete={deletePlan}
                onNew={() => createNewPlan(strings.plans.defaultName)}
              />
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <AssumptionsPanel
                strings={strings}
                assumptions={assumptions}
                onUpdate={handleAssumptionUpdate}
                onReset={handleResetAssumptions}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
