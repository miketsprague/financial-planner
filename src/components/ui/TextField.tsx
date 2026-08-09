"use client";

import { useId } from "react";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
};

export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
}: TextFieldProps) {
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
      <input
        id={id}
        type="text"
        className={[
          "min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          "dark:bg-zinc-800 dark:text-zinc-100",
          error ? "border-red-500" : "border-zinc-300 dark:border-zinc-700",
        ].join(" ")}
        value={value}
        placeholder={placeholder}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
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
