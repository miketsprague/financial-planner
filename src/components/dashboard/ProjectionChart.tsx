"use client";

import { useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LocaleStrings } from "@/locales/en-GB";
import type {
  Currency,
  MonteCarloResult,
  ProjectionPoint,
  ValueView,
} from "@/types";
import { formatCurrencyCompact } from "@/lib/formatting";
import { todaysMoneyValue } from "@/lib/calculations";
import { SectionCard } from "@/components/ui/SectionCard";

type ProjectionChartProps = {
  strings: LocaleStrings;
  currency: Currency;
  projection: ProjectionPoint[];
  monteCarlo: MonteCarloResult;
  currentAge: number;
  retirementAge: number;
  inflationRate: number;
};

type ChartRow = {
  age: number;
  deterministic: number;
  p10: number;
  p50: number;
  p90: number;
};

export function ProjectionChart({
  strings,
  currency,
  projection,
  monteCarlo,
  currentAge,
  retirementAge,
  inflationRate,
}: ProjectionChartProps) {
  const s = strings.chart;
  const [view, setView] = useState<ValueView>("nominal");

  const rows = useMemo<ChartRow[]>(() => {
    const percentileByAge = new Map(
      monteCarlo.percentiles.map((p) => [p.age, p]),
    );
    return projection.map((point) => {
      const years = point.age - currentAge;
      const toView = (value: number) =>
        view === "today"
          ? todaysMoneyValue(value, inflationRate, years)
          : value;
      const percentile = percentileByAge.get(point.age);
      return {
        age: point.age,
        deterministic: Math.round(toView(point.closingBalance)),
        p10: Math.round(toView(percentile?.p10 ?? point.closingBalance)),
        p50: Math.round(toView(percentile?.p50 ?? point.closingBalance)),
        p90: Math.round(toView(percentile?.p90 ?? point.closingBalance)),
      };
    });
  }, [projection, monteCarlo, view, currentAge, inflationRate]);

  if (projection.length === 0) return null;

  return (
    <SectionCard
      id="chart"
      title={s.title}
      actions={
        <div
          role="group"
          aria-label={s.viewLabel}
          className="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700"
        >
          <button
            type="button"
            aria-pressed={view === "nominal"}
            onClick={() => setView("nominal")}
            className={[
              "min-h-11 px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
              view === "nominal"
                ? "bg-blue-600 text-white"
                : "bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
            ].join(" ")}
          >
            {s.nominal}
          </button>
          <button
            type="button"
            aria-pressed={view === "today"}
            onClick={() => setView("today")}
            className={[
              "min-h-11 px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
              view === "today"
                ? "bg-blue-600 text-white"
                : "bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
            ].join(" ")}
          >
            {s.today}
          </button>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={rows}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="age"
            label={{
              value: s.ageLabel,
              position: "insideBottom",
              offset: -2,
              fontSize: 12,
            }}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrencyCompact(v, currency)}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <RechartsTooltip
            formatter={(value: unknown, name: unknown) => [
              formatCurrencyCompact(Number(value), currency),
              String(name),
            ]}
            labelFormatter={(label: unknown) => `${s.ageLabel} ${label}`}
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              fontSize: "0.75rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <ReferenceLine
            x={retirementAge}
            stroke="#ef4444"
            strokeDasharray="4 3"
            label={{
              value: s.retirementLine,
              position: "top",
              fontSize: 11,
              fill: "#ef4444",
            }}
          />
          <Area
            type="monotone"
            dataKey="p90"
            name={s.p90}
            stroke="none"
            fill="#93c5fd"
            fillOpacity={0.35}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="p10"
            name={s.p10}
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p50"
            name={s.p50}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="deterministic"
            name={s.deterministic}
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {s.summaryHeading}
        </summary>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {s.summaryIntro}
        </p>
        <div className="mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400">
                <th scope="col" className="py-1 pr-3">
                  {s.ageLabel}
                </th>
                <th scope="col" className="py-1 pr-3">
                  {s.deterministic}
                </th>
                <th scope="col" className="py-1 pr-3">
                  {s.p10}
                </th>
                <th scope="col" className="py-1 pr-3">
                  {s.p50}
                </th>
                <th scope="col" className="py-1 pr-3">
                  {s.p90}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.age} className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-1 pr-3">{row.age}</td>
                  <td className="py-1 pr-3">
                    {formatCurrencyCompact(row.deterministic, currency)}
                  </td>
                  <td className="py-1 pr-3">
                    {formatCurrencyCompact(row.p10, currency)}
                  </td>
                  <td className="py-1 pr-3">
                    {formatCurrencyCompact(row.p50, currency)}
                  </td>
                  <td className="py-1 pr-3">
                    {formatCurrencyCompact(row.p90, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </SectionCard>
  );
}
