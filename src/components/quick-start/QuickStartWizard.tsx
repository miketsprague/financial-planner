"use client";

import { useState } from "react";
import type { Assumptions, QuickStartInput } from "@/types";
import type { LocaleStrings } from "@/locales/en-GB";
import type { IncomeConfig } from "@/lib/calculations";
import { QuickStartForm } from "./QuickStartForm";
import { ProjectionChart } from "./ProjectionChart";
import { useProjection } from "@/hooks/useProjection";

type Props = {
  strings: LocaleStrings;
  activePlanName: string;
  input: QuickStartInput | null;
  assumptions: Assumptions;
  incomeConfig?: IncomeConfig;
  onInputSubmit: (input: QuickStartInput) => void;
  onMakeMoreAccurate?: () => void;
};

export function QuickStartWizard({
  strings,
  input,
  assumptions,
  incomeConfig,
  onInputSubmit,
  onMakeMoreAccurate,
}: Props) {
  // isEditing starts as true for new/empty plans (input === null), false when the
  // plan already has data.  When switching plans the parent passes a new `key`
  // so this component is fully remounted and the initial value is correct.
  const [isEditing, setIsEditing] = useState(input === null);
  const qs = strings.quickStart;

  const dataPoints = useProjection(input, assumptions, incomeConfig);

  function handleSubmit(values: QuickStartInput) {
    onInputSubmit(values);
    setIsEditing(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {qs.title}
          </h2>
          {isEditing && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {qs.subtitle}
            </p>
          )}
        </div>
        {!isEditing && input !== null && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2"
          >
            {qs.editInputs}
          </button>
        )}
      </div>

      {isEditing ? (
        <QuickStartForm
          strings={strings}
          initialValues={input ?? undefined}
          onSubmit={handleSubmit}
        />
      ) : (
        input !== null &&
        dataPoints.length > 0 && (
          <div className="flex flex-col gap-6">
            <ProjectionChart
              dataPoints={dataPoints}
              retirementAge={input.retirementAge}
              statePensionAge={assumptions.statePensionAge}
              locale={assumptions.locale}
              strings={strings}
            />
            {onMakeMoreAccurate && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex items-center justify-between gap-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Want a more accurate projection? Add more detail about your
                  income, expenses and pension contributions.
                </p>
                <button
                  onClick={onMakeMoreAccurate}
                  className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {qs.makeMoreAccurate}
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
