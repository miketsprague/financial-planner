"use client";

import type { Assumptions } from "@/types";
import type { LocaleStrings } from "@/locales/en-GB";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatPercentage } from "@/lib/formatting";

type Props = {
  strings: LocaleStrings;
  assumptions: Assumptions;
  onUpdate: <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => void;
  onReset: () => void;
};

type SliderField = {
  key: keyof Pick<
    Assumptions,
    "inflationRate" | "investmentReturn" | "incomeReplacementRatio"
  >;
  label: string;
  tooltip: string;
  min: number;
  max: number;
  step: number;
};

type NumberField = {
  key: keyof Pick<Assumptions, "lifeExpectancy">;
  label: string;
  tooltip: string;
  min: number;
  max: number;
  unit: string;
};

export function AssumptionsPanel({ strings, assumptions, onUpdate, onReset }: Props) {
  const a = strings.assumptions;

  const sliderFields: SliderField[] = [
    {
      key: "inflationRate",
      label: a.inflationRate,
      tooltip: a.inflationRateTooltip,
      min: 0,
      max: 0.15,
      step: 0.005,
    },
    {
      key: "investmentReturn",
      label: a.investmentReturn,
      tooltip: a.investmentReturnTooltip,
      min: 0,
      max: 0.2,
      step: 0.005,
    },
    {
      key: "incomeReplacementRatio",
      label: a.incomeReplacementRatio,
      tooltip: a.incomeReplacementRatioTooltip,
      min: 0.5,
      max: 0.8,
      step: 0.01,
    },
  ];

  const numberFields: NumberField[] = [
    {
      key: "lifeExpectancy",
      label: a.lifeExpectancy,
      tooltip: a.lifeExpectancyTooltip,
      min: 60,
      max: 120,
      unit: "yrs",
    },
  ];

  return (
    <section aria-label={a.title} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {a.title}
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2"
        >
          {a.resetToDefaults}
        </button>
      </div>

      {sliderFields.map(({ key, label, tooltip, min, max, step }) => (
        <div key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Tooltip content={tooltip}>
              <label
                htmlFor={`assumption-${key}`}
                className="flex cursor-help items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                {label}
                <span className="text-zinc-400 text-xs">ⓘ</span>
              </label>
            </Tooltip>
            <span className="text-sm font-mono text-zinc-700 dark:text-zinc-200 tabular-nums">
              {formatPercentage(assumptions[key] as number, assumptions.locale)}
            </span>
          </div>
          <input
            id={`assumption-${key}`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={assumptions[key] as number}
            onChange={(e) =>
              onUpdate(key, parseFloat(e.target.value) as Assumptions[typeof key])
            }
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{formatPercentage(min, assumptions.locale)}</span>
            <span>{formatPercentage(max, assumptions.locale)}</span>
          </div>
        </div>
      ))}

      {numberFields.map(({ key, label, tooltip, min, max, unit }) => (
        <div key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Tooltip content={tooltip}>
              <label
                htmlFor={`assumption-${key}`}
                className="flex cursor-help items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                {label}
                <span className="text-zinc-400 text-xs">ⓘ</span>
              </label>
            </Tooltip>
            <span className="text-sm font-mono text-zinc-700 dark:text-zinc-200 tabular-nums">
              {assumptions[key]} {unit}
            </span>
          </div>
          <input
            id={`assumption-${key}`}
            type="range"
            min={min}
            max={max}
            step={1}
            value={assumptions[key] as number}
            onChange={(e) =>
              onUpdate(key, parseInt(e.target.value, 10) as Assumptions[typeof key])
            }
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{min} yrs</span>
            <span>{max} yrs</span>
          </div>
        </div>
      ))}
    </section>
  );
}
