"use client";

import { useId } from "react";

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
};

/**
 * A labelled numeric input with an optional hint, error text, visible focus
 * styles, and a comfortable touch target (spec: "Editing sections use native
 * labelled controls, visible focus styles, error text, and comfortable touch
 * targets").
 */
export function NumberField({
  label,
  value,
  onChange,
  hint,
  error,
  min,
  max,
  step = 1,
  suffix,
  prefix,
}: NumberFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="pointer-events-none absolute left-3 text-sm text-zinc-500"
            aria-hidden
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          className={[
            "min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
            "dark:bg-zinc-800 dark:text-zinc-100",
            error ? "border-red-500" : "border-zinc-300 dark:border-zinc-700",
            prefix ? "pl-7" : "",
            suffix ? "pr-9" : "",
          ].join(" ")}
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            const next = event.target.valueAsNumber;
            onChange(Number.isFinite(next) ? next : 0);
          }}
        />
        {suffix && (
          <span
            className="pointer-events-none absolute right-3 text-sm text-zinc-500"
            aria-hidden
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="text-xs font-medium text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
