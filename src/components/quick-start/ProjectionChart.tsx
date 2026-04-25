"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionDataPoint } from "@/types";
import type { LocaleStrings } from "@/locales/en-GB";
import { formatCurrencyCompact } from "@/lib/formatting";
import type { Locale } from "@/types";

type Props = {
  dataPoints: ProjectionDataPoint[];
  retirementAge: number;
  statePensionAge: number;
  locale: Locale;
  strings: LocaleStrings;
};

export function ProjectionChart({
  dataPoints,
  retirementAge,
  statePensionAge,
  locale,
  strings,
}: Props) {
  const chartStrings = strings.chart;

  if (dataPoints.length === 0) return null;

  const lastPoint = dataPoints[dataPoints.length - 1];
  const isSufficient = lastPoint.balance > 0;

  const chartData = dataPoints.map((p) => ({
    age: p.age,
    balance: Math.round(p.balance),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div
        className={[
          "rounded-lg px-4 py-2 text-sm font-medium",
          isSufficient
            ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            : "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        ].join(" ")}
      >
        {isSufficient
          ? `${chartStrings.fundingSufficient} age ${lastPoint.age}.`
          : `${chartStrings.fundingInsufficient} age ${lastPoint.age}.`}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="age"
            label={{
              value: chartStrings.ageLabel,
              position: "insideBottom",
              offset: -2,
              fontSize: 12,
            }}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrencyCompact(v, locale)}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip
            formatter={(value: unknown) => [
              formatCurrencyCompact(Number(value), locale),
              chartStrings.balance,
            ]}
            labelFormatter={(label: unknown) =>
              `${chartStrings.ageLabel} ${label}`
            }
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              fontSize: "0.75rem",
            }}
          />
          <ReferenceLine
            x={retirementAge}
            stroke="#ef4444"
            strokeDasharray="4 3"
            label={{
              value: chartStrings.retirementLine,
              position: "top",
              fontSize: 11,
              fill: "#ef4444",
            }}
          />
          {statePensionAge !== retirementAge && (
            <ReferenceLine
              x={statePensionAge}
              stroke="#8b5cf6"
              strokeDasharray="4 3"
              label={{
                value: chartStrings.statePensionLine,
                position: "top",
                fontSize: 11,
                fill: "#8b5cf6",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
