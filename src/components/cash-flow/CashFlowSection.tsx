"use client";

import type { LocaleStrings } from "@/locales/en-GB";
import type { CashFlow, Currency, MonetaryAmount } from "@/types";
import { NumberField } from "@/components/ui/NumberField";
import { SelectField } from "@/components/ui/SelectField";
import { SectionCard } from "@/components/ui/SectionCard";

type CashFlowSectionProps = {
  strings: LocaleStrings;
  cashFlow: CashFlow;
  onChange: (changes: Partial<CashFlow>) => void;
};

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "GBP", label: "GBP (£)" },
  { value: "USD", label: "USD ($)" },
];

function MonetaryAmountFields({
  label,
  hint,
  value,
  onChange,
  strings,
}: {
  label: string;
  hint?: string;
  value: MonetaryAmount;
  onChange: (value: MonetaryAmount) => void;
  strings: LocaleStrings;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
      <NumberField
        label={label}
        hint={hint}
        value={value.amount}
        min={0}
        step={100}
        onChange={(amount) => onChange({ ...value, amount })}
      />
      <SelectField
        label={strings.cashFlow.currency}
        value={value.currency}
        options={CURRENCY_OPTIONS}
        onChange={(currency) => onChange({ ...value, currency })}
      />
    </div>
  );
}

export function CashFlowSection({
  strings,
  cashFlow,
  onChange,
}: CashFlowSectionProps) {
  const s = strings.cashFlow;

  return (
    <SectionCard id="cash-flow" title={s.title}>
      <div className="flex flex-col gap-4">
        <MonetaryAmountFields
          label={s.takeHomeIncome}
          hint={s.takeHomeIncomeHint}
          value={cashFlow.takeHomeIncome}
          onChange={(takeHomeIncome) => onChange({ takeHomeIncome })}
          strings={strings}
        />
        <MonetaryAmountFields
          label={s.currentSpending}
          hint={s.currentSpendingHint}
          value={cashFlow.currentSpending}
          onChange={(currentSpending) => onChange({ currentSpending })}
          strings={strings}
        />
        <MonetaryAmountFields
          label={s.retirementSpending}
          hint={s.retirementSpendingHint}
          value={cashFlow.retirementSpending}
          onChange={(retirementSpending) => onChange({ retirementSpending })}
          strings={strings}
        />
      </div>
    </SectionCard>
  );
}
