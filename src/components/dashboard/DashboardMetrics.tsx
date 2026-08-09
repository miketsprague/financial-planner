import type { LocaleStrings } from "@/locales/en-GB";
import type { Currency, ProjectionPoint } from "@/types";
import { formatCurrencyCompact } from "@/lib/formatting";
import { SectionCard } from "@/components/ui/SectionCard";

type DashboardMetricsProps = {
  strings: LocaleStrings;
  currency: Currency;
  netWorth: number;
  annualSavings: number;
  retirementAge: number;
  successProbability: number;
  balanceAtRetirement: number | null;
};

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning" | "positive";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span
        className={[
          "text-2xl font-semibold",
          tone === "warning"
            ? "text-amber-700 dark:text-amber-400"
            : "text-zinc-900 dark:text-zinc-100",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

export function DashboardMetrics({
  strings,
  currency,
  netWorth,
  annualSavings,
  retirementAge,
  successProbability,
  balanceAtRetirement,
}: DashboardMetricsProps) {
  const s = strings.dashboard;
  const successPercent = `${Math.round(successProbability * 100)}%`;

  return (
    <SectionCard id="dashboard" title={s.title}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric
          label={s.netWorth}
          value={formatCurrencyCompact(netWorth, currency)}
        />
        <Metric
          label={s.annualSavings}
          value={formatCurrencyCompact(annualSavings, currency)}
          tone={annualSavings < 0 ? "warning" : undefined}
        />
        <Metric label={s.retirementTargetAge} value={String(retirementAge)} />
        <Metric
          label={s.successProbability}
          value={successPercent}
          tone={successProbability < 0.7 ? "warning" : undefined}
        />
        <Metric
          label={s.balanceAtRetirement}
          value={
            balanceAtRetirement !== null
              ? formatCurrencyCompact(balanceAtRetirement, currency)
              : "—"
          }
        />
      </div>
    </SectionCard>
  );
}

export function getBalanceAtRetirement(
  projection: ProjectionPoint[],
  retirementAge: number,
): number | null {
  const point = projection.find((p) => p.age === retirementAge);
  return point ? point.closingBalance : null;
}
