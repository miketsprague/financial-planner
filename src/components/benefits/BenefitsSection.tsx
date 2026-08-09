"use client";

import { useState } from "react";
import type { LocaleStrings } from "@/locales/en-GB";
import type { Benefit, BenefitKind, Currency } from "@/types";
import { NumberField } from "@/components/ui/NumberField";
import { PercentField } from "@/components/ui/PercentField";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SectionCard } from "@/components/ui/SectionCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type BenefitsSectionProps = {
  strings: LocaleStrings;
  benefits: Benefit[];
  onAdd: () => void;
  onUpdate: (id: string, changes: Partial<Omit<Benefit, "id">>) => void;
  onRemove: (id: string) => void;
};

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "GBP", label: "GBP (£)" },
  { value: "USD", label: "USD ($)" },
];

const BENEFIT_KINDS: BenefitKind[] = [
  "uk-state-pension",
  "us-social-security",
  "other",
];

export function BenefitsSection({
  strings,
  benefits,
  onAdd,
  onUpdate,
  onRemove,
}: BenefitsSectionProps) {
  const s = strings.benefits;
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const kindOptions = BENEFIT_KINDS.map((kind) => ({
    value: kind,
    label: s.kinds[kind],
  }));

  return (
    <SectionCard
      id="benefits"
      title={s.title}
      actions={
        <button
          type="button"
          onClick={onAdd}
          className="min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
        >
          {s.add}
        </button>
      }
    >
      {benefits.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li
              key={benefit.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <TextField
                label={s.name}
                value={benefit.name}
                onChange={(name) => onUpdate(benefit.id, { name })}
              />
              <SelectField
                label={s.kind}
                value={benefit.kind}
                options={kindOptions}
                onChange={(kind) => onUpdate(benefit.id, { kind })}
              />
              <CheckboxField
                label={s.enabled}
                checked={benefit.enabled}
                onChange={(enabled) => onUpdate(benefit.id, { enabled })}
              />
              <NumberField
                label={s.startAge}
                value={benefit.startAge}
                min={0}
                max={130}
                onChange={(startAge) => onUpdate(benefit.id, { startAge })}
              />
              <NumberField
                label={s.annualAmount}
                value={benefit.annualAmount}
                min={0}
                step={100}
                onChange={(annualAmount) =>
                  onUpdate(benefit.id, { annualAmount })
                }
              />
              <SelectField
                label={s.currency}
                value={benefit.currency}
                options={CURRENCY_OPTIONS}
                onChange={(currency) => onUpdate(benefit.id, { currency })}
              />
              <PercentField
                label={s.growthRate}
                value={benefit.growthRate}
                onChange={(growthRate) => onUpdate(benefit.id, { growthRate })}
              />
              <button
                type="button"
                onClick={() => setPendingRemoveId(benefit.id)}
                className="min-h-11 self-start rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-red-800 dark:text-red-400"
              >
                {s.remove}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={pendingRemoveId !== null}
        title={s.remove}
        body={s.removeConfirm}
        confirmLabel={strings.data.confirm}
        cancelLabel={strings.data.cancel}
        onConfirm={() => {
          if (pendingRemoveId) onRemove(pendingRemoveId);
          setPendingRemoveId(null);
        }}
        onCancel={() => setPendingRemoveId(null)}
      />
    </SectionCard>
  );
}
