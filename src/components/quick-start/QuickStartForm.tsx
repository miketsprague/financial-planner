"use client";

import { useState } from "react";
import type { QuickStartInput } from "@/types";
import type { LocaleStrings } from "@/locales/en-GB";

type Props = {
  strings: LocaleStrings;
  initialValues?: Partial<QuickStartInput>;
  onSubmit: (input: QuickStartInput) => void;
};

type FormErrors = Partial<Record<keyof QuickStartInput, string>>;
type FormValues = Record<keyof QuickStartInput, string>;

const fieldKeys: (keyof QuickStartInput)[] = [
  "currentAge",
  "retirementAge",
  "lifeExpectancy",
  "currentSavings",
  "annualIncome",
];

function validateInput(
  values: QuickStartInput,
  errors: LocaleStrings["quickStart"]["errors"],
): FormErrors {
  const errs: FormErrors = {};

  if (values.currentAge < 18) errs.currentAge = errors.minAge;
  if (values.currentAge > 99) errs.currentAge = errors.maxAge;

  if (values.retirementAge <= values.currentAge)
    errs.retirementAge = errors.retirementAfterCurrent;
  if (values.retirementAge > 99) errs.retirementAge = errors.maxAge;

  if (values.lifeExpectancy <= values.retirementAge)
    errs.lifeExpectancy = errors.lifeExpectancyAfterRetirement;

  if (values.currentSavings < 0) errs.currentSavings = errors.minSavings;

  if (values.annualIncome <= 0) errs.annualIncome = errors.minIncome;

  return errs;
}

function getInitialFormValues(initialValues?: Partial<QuickStartInput>): FormValues {
  return {
    currentAge: String(initialValues?.currentAge ?? 30),
    retirementAge: String(initialValues?.retirementAge ?? 67),
    lifeExpectancy: String(initialValues?.lifeExpectancy ?? 90),
    currentSavings: String(initialValues?.currentSavings ?? 0),
    annualIncome: String(initialValues?.annualIncome ?? 40000),
  };
}

function parseFormValues(
  values: FormValues,
  errors: LocaleStrings["quickStart"]["errors"],
): { input: QuickStartInput | null; errors: FormErrors } {
  const requiredErrors: FormErrors = {};

  for (const key of fieldKeys) {
    const value = values[key].trim();
    if (value === "" || Number.isNaN(Number(value))) {
      requiredErrors[key] = errors.required;
    }
  }

  if (Object.keys(requiredErrors).length > 0) {
    return { input: null, errors: requiredErrors };
  }

  const input: QuickStartInput = {
    currentAge: Number(values.currentAge),
    retirementAge: Number(values.retirementAge),
    lifeExpectancy: Number(values.lifeExpectancy),
    currentSavings: Number(values.currentSavings),
    annualIncome: Number(values.annualIncome),
  };

  return { input, errors: validateInput(input, errors) };
}

export function QuickStartForm({ strings, initialValues, onSubmit }: Props) {
  const qs = strings.quickStart;

  const [values, setValues] = useState<FormValues>(() => getInitialFormValues(initialValues));

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof QuickStartInput, boolean>>>({});

  function handleChange(field: keyof QuickStartInput, raw: string) {
    const next = { ...values, [field]: raw };
    setValues(next);
    if (touched[field]) {
      setErrors(parseFormValues(next, qs.errors).errors);
    }
  }

  function handleBlur(field: keyof QuickStartInput) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(parseFormValues(values, qs.errors).errors);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      fieldKeys.map((k) => [k, true]),
    ) as Record<keyof QuickStartInput, boolean>;
    setTouched(allTouched);
    const { input, errors: errs } = parseFormValues(values, qs.errors);
    setErrors(errs);
    if (input === null || Object.keys(errs).length > 0) return;
    onSubmit(input);
  }

  const fields: Array<{
    key: keyof QuickStartInput;
    label: string;
    hint: string;
    prefix?: string;
    min: number;
    max: number;
    step?: number;
  }> = [
    {
      key: "currentAge",
      label: qs.currentAge,
      hint: qs.currentAgeHint,
      min: 18,
      max: 99,
    },
    {
      key: "retirementAge",
      label: qs.retirementAge,
      hint: qs.retirementAgeHint,
      min: 19,
      max: 99,
    },
    {
      key: "lifeExpectancy",
      label: qs.lifeExpectancy,
      hint: qs.lifeExpectancyHint,
      min: 50,
      max: 120,
    },
    {
      key: "currentSavings",
      label: qs.currentSavings,
      hint: qs.currentSavingsHint,
      prefix: qs.currencyPrefix,
      min: 0,
      max: 100_000_000,
      step: 1000,
    },
    {
      key: "annualIncome",
      label: qs.annualIncome,
      hint: qs.annualIncomeHint,
      prefix: qs.currencyPrefix,
      min: 1,
      max: 10_000_000,
      step: 500,
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={qs.title}
      className="flex flex-col gap-5"
      noValidate
    >
      {fields.map(({ key, label, hint, prefix, min, max, step }) => (
        <div key={key} className="flex flex-col gap-1">
          <label
            htmlFor={`qs-${key}`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {label}
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
          <div className="relative flex items-center">
            {prefix && (
              <span className="absolute left-3 text-zinc-500 select-none" aria-hidden="true">
                {prefix}
              </span>
            )}
            <input
              id={`qs-${key}`}
              type="number"
              name={key}
              min={min}
              max={max}
              step={step ?? 1}
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `qs-${key}-error` : undefined}
              className={[
                "w-full rounded-lg border px-3 py-2 text-sm",
                "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                prefix ? "pl-7" : "",
                errors[key]
                  ? "border-red-500"
                  : "border-zinc-300 dark:border-zinc-600",
              ].join(" ")}
            />
          </div>
          {errors[key] && (
            <p
              id={`qs-${key}-error`}
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {errors[key]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="mt-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        {qs.submit}
      </button>
    </form>
  );
}
