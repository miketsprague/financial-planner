"use client";

import { NumberField } from "./NumberField";

type PercentFieldProps = {
  label: string;
  /** Underlying fraction, e.g. 0.025 for 2.5%. */
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
  decimalPlaces?: number;
};

/**
 * A percentage input that displays and edits a whole-number-ish percentage
 * while storing the underlying value as a fraction (e.g. displays "2.5" for
 * a stored value of 0.025).
 */
export function PercentField({
  label,
  value,
  onChange,
  hint,
  error,
  min = -100,
  max = 100,
  decimalPlaces = 2,
}: PercentFieldProps) {
  const step =
    decimalPlaces > 0
      ? Number((1 / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces))
      : 1;
  return (
    <NumberField
      label={label}
      value={Number((value * 100).toFixed(decimalPlaces))}
      onChange={(next) => onChange(next / 100)}
      hint={hint}
      error={error}
      min={min}
      max={max}
      step={step}
      suffix="%"
    />
  );
}
