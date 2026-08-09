"use client";

import { useState } from "react";
import type { LocaleStrings } from "@/locales/en-GB";
import type { Currency, Goal, GoalKind } from "@/types";
import { NumberField } from "@/components/ui/NumberField";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { SectionCard } from "@/components/ui/SectionCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type GoalsSectionProps = {
  strings: LocaleStrings;
  goals: Goal[];
  onAdd: () => void;
  onUpdate: (id: string, changes: Partial<Omit<Goal, "id">>) => void;
  onRemove: (id: string) => void;
};

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "GBP", label: "GBP (£)" },
  { value: "USD", label: "USD ($)" },
];

export function GoalsSection({
  strings,
  goals,
  onAdd,
  onUpdate,
  onRemove,
}: GoalsSectionProps) {
  const s = strings.goals;
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const kindOptions: { value: GoalKind; label: string }[] = [
    { value: "expense", label: s.kinds.expense },
    { value: "income", label: s.kinds.income },
  ];

  return (
    <SectionCard
      id="goals"
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
      {goals.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <TextField
                label={s.name}
                value={goal.name}
                onChange={(name) => onUpdate(goal.id, { name })}
              />
              <NumberField
                label={s.age}
                value={goal.age}
                min={0}
                max={130}
                onChange={(age) => onUpdate(goal.id, { age })}
              />
              <NumberField
                label={s.amount}
                value={goal.amount}
                min={0}
                step={100}
                onChange={(amount) => onUpdate(goal.id, { amount })}
              />
              <SelectField
                label={s.currency}
                value={goal.currency}
                options={CURRENCY_OPTIONS}
                onChange={(currency) => onUpdate(goal.id, { currency })}
              />
              <SelectField
                label={s.kind}
                value={goal.kind}
                options={kindOptions}
                onChange={(kind) => onUpdate(goal.id, { kind })}
              />
              <button
                type="button"
                onClick={() => setPendingRemoveId(goal.id)}
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
