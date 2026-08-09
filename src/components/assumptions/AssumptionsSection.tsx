"use client";

import type { LocaleStrings } from "@/locales/en-GB";
import type { Assumptions } from "@/types";
import { NumberField } from "@/components/ui/NumberField";
import { PercentField } from "@/components/ui/PercentField";
import { SectionCard } from "@/components/ui/SectionCard";

type AssumptionsSectionProps = {
  strings: LocaleStrings;
  assumptions: Assumptions;
  onChange: (changes: Partial<Assumptions>) => void;
};

export function AssumptionsSection({
  strings,
  assumptions,
  onChange,
}: AssumptionsSectionProps) {
  const s = strings.assumptions;

  return (
    <SectionCard id="assumptions" title={s.title}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PercentField
          label={s.inflationRate}
          hint={s.inflationRateHint}
          value={assumptions.inflationRate}
          min={-50}
          max={100}
          onChange={(inflationRate) => onChange({ inflationRate })}
        />
        <PercentField
          label={s.returnVolatility}
          hint={s.returnVolatilityHint}
          value={assumptions.returnVolatility}
          min={0}
          max={60}
          onChange={(returnVolatility) => onChange({ returnVolatility })}
        />
        <NumberField
          label={s.gbpPerUsd}
          hint={s.gbpPerUsdHint}
          value={assumptions.gbpPerUsd}
          min={0.01}
          step={0.01}
          onChange={(gbpPerUsd) => onChange({ gbpPerUsd })}
        />
        <NumberField
          label={s.simulationRuns}
          hint={s.simulationRunsHint}
          value={assumptions.simulationRuns}
          min={500}
          max={5000}
          step={100}
          onChange={(simulationRuns) => onChange({ simulationRuns })}
        />
      </div>
    </SectionCard>
  );
}
