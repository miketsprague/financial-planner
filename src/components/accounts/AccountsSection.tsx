"use client";

import { useState } from "react";
import type { LocaleStrings } from "@/locales/en-GB";
import type { Account, AccountType, Currency } from "@/types";
import { NumberField } from "@/components/ui/NumberField";
import { PercentField } from "@/components/ui/PercentField";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { SectionCard } from "@/components/ui/SectionCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getAccountConsideration } from "@/lib/insights";

type AccountsSectionProps = {
  strings: LocaleStrings;
  accounts: Account[];
  onAdd: () => void;
  onUpdate: (id: string, changes: Partial<Omit<Account, "id">>) => void;
  onRemove: (id: string) => void;
};

const ACCOUNT_TYPES: AccountType[] = [
  "cash",
  "uk-workplace-pension",
  "uk-sipp",
  "uk-isa",
  "uk-taxable",
  "us-401k",
  "us-traditional-ira",
  "us-roth-ira",
  "us-taxable-brokerage",
  "property",
  "other",
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "GBP", label: "GBP (£)" },
  { value: "USD", label: "USD ($)" },
];

export function AccountsSection({
  strings,
  accounts,
  onAdd,
  onUpdate,
  onRemove,
}: AccountsSectionProps) {
  const s = strings.accounts;
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const typeOptions = ACCOUNT_TYPES.map((type) => ({
    value: type,
    label: s.types[type],
  }));

  return (
    <SectionCard
      id="accounts"
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
      {accounts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accounts.map((account) => {
            const consideration = getAccountConsideration(account);
            return (
              <li
                key={account.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <TextField
                  label={s.name}
                  value={account.name}
                  onChange={(name) => onUpdate(account.id, { name })}
                />
                <SelectField
                  label={s.type}
                  value={account.type}
                  options={typeOptions}
                  onChange={(type) => onUpdate(account.id, { type })}
                />
                <SelectField
                  label={s.currency}
                  value={account.currency}
                  options={CURRENCY_OPTIONS}
                  onChange={(currency) => onUpdate(account.id, { currency })}
                />
                <NumberField
                  label={s.balance}
                  value={account.balance}
                  min={0}
                  step={100}
                  onChange={(balance) => onUpdate(account.id, { balance })}
                />
                <NumberField
                  label={s.annualContribution}
                  value={account.annualContribution}
                  min={0}
                  step={100}
                  onChange={(annualContribution) =>
                    onUpdate(account.id, { annualContribution })
                  }
                />
                <PercentField
                  label={s.expectedReturn}
                  value={account.expectedReturn}
                  onChange={(expectedReturn) =>
                    onUpdate(account.id, { expectedReturn })
                  }
                />
                {consideration && (
                  <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <strong className="font-semibold">
                      {s.considerationLabel}:{" "}
                    </strong>
                    {consideration}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setPendingRemoveId(account.id)}
                  className="min-h-11 self-start rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-red-800 dark:text-red-400"
                >
                  {s.remove}
                </button>
              </li>
            );
          })}
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
