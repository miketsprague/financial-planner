"use client";

import { getLocaleStrings } from "@/locales";
import { usePlanState } from "@/hooks/usePlanState";
import { useProjection } from "@/hooks/useProjection";
import { computeAnnualSavings, computeNetWorth } from "@/lib/calculations";
import { computeInsights } from "@/lib/insights";
import {
  DashboardMetrics,
  getBalanceAtRetirement,
} from "@/components/dashboard/DashboardMetrics";
import { ProjectionChart } from "@/components/dashboard/ProjectionChart";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { CashFlowSection } from "@/components/cash-flow/CashFlowSection";
import { AccountsSection } from "@/components/accounts/AccountsSection";
import { GoalsSection } from "@/components/goals/GoalsSection";
import { BenefitsSection } from "@/components/benefits/BenefitsSection";
import { AssumptionsSection } from "@/components/assumptions/AssumptionsSection";
import { CrossBorderGuide } from "@/components/guide/CrossBorderGuide";
import { DataControls } from "@/components/data/DataControls";
import { Disclaimer } from "@/components/layout/Disclaimer";

const strings = getLocaleStrings("en-GB");

export default function Home() {
  const {
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
  } = usePlanState();

  const { projection, monteCarlo } = useProjection(plan);
  const insights = computeInsights(plan, monteCarlo);
  const netWorth = computeNetWorth(plan);
  const annualSavings = computeAnnualSavings(plan);
  const balanceAtRetirement = getBalanceAtRetirement(
    projection,
    plan.profile.retirementAge,
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        {strings.skipToContent}
      </a>

      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {strings.appTitle}
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {strings.appSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {strings.privacyBadge}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {strings.educationalBadge}
            </span>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8"
      >
        <DashboardMetrics
          strings={strings}
          currency={plan.profile.reportingCurrency}
          netWorth={netWorth}
          annualSavings={annualSavings}
          retirementAge={plan.profile.retirementAge}
          successProbability={monteCarlo.successProbability}
          balanceAtRetirement={balanceAtRetirement}
        />

        <ProjectionChart
          strings={strings}
          currency={plan.profile.reportingCurrency}
          projection={projection}
          monteCarlo={monteCarlo}
          currentAge={plan.profile.currentAge}
          retirementAge={plan.profile.retirementAge}
          inflationRate={plan.assumptions.inflationRate}
        />

        <InsightsPanel strings={strings} insights={insights} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProfileSection
            strings={strings}
            profile={plan.profile}
            onChange={(changes) =>
              updatePlan((prev) => ({
                ...prev,
                profile: { ...prev.profile, ...changes },
              }))
            }
          />
          <CashFlowSection
            strings={strings}
            cashFlow={plan.cashFlow}
            onChange={(changes) =>
              updatePlan((prev) => ({
                ...prev,
                cashFlow: { ...prev.cashFlow, ...changes },
              }))
            }
          />
        </div>

        <AccountsSection
          strings={strings}
          accounts={plan.accounts}
          onAdd={addAccount}
          onUpdate={updateAccount}
          onRemove={removeAccount}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GoalsSection
            strings={strings}
            goals={plan.goals}
            onAdd={addGoal}
            onUpdate={updateGoal}
            onRemove={removeGoal}
          />
          <BenefitsSection
            strings={strings}
            benefits={plan.benefits}
            onAdd={addBenefit}
            onUpdate={updateBenefit}
            onRemove={removeBenefit}
          />
        </div>

        <AssumptionsSection
          strings={strings}
          assumptions={plan.assumptions}
          onChange={(changes) =>
            updatePlan((prev) => ({
              ...prev,
              assumptions: { ...prev.assumptions, ...changes },
            }))
          }
        />

        <CrossBorderGuide strings={strings} profile={plan.profile} />

        <DataControls
          strings={strings}
          exportPlanJson={exportPlanJson}
          importPlanJson={importPlanJson}
          resetToExample={resetToExample}
        />
      </main>

      <Disclaimer strings={strings} />
    </div>
  );
}
