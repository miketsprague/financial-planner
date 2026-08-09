"use client";

import type { LocaleStrings } from "@/locales/en-GB";
import type { Currency, Profile } from "@/types";
import { NumberField } from "@/components/ui/NumberField";
import { SelectField } from "@/components/ui/SelectField";
import { SectionCard } from "@/components/ui/SectionCard";
import { isValidProjectionProfile } from "@/lib/calculations";

type ProfileSectionProps = {
  strings: LocaleStrings;
  profile: Profile;
  onChange: (changes: Partial<Profile>) => void;
};

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "GBP", label: "GBP (£)" },
  { value: "USD", label: "USD ($)" },
];

export function ProfileSection({
  strings,
  profile,
  onChange,
}: ProfileSectionProps) {
  const s = strings.profile;
  const isValid = isValidProjectionProfile(profile);

  return (
    <SectionCard id="profile" title={s.title}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={s.currentAge}
          hint={s.hints.currentAge}
          value={profile.currentAge}
          min={0}
          max={120}
          onChange={(currentAge) => onChange({ currentAge })}
        />
        <NumberField
          label={s.retirementAge}
          hint={s.hints.retirementAge}
          value={profile.retirementAge}
          min={0}
          max={120}
          onChange={(retirementAge) => onChange({ retirementAge })}
        />
        <NumberField
          label={s.planningAge}
          hint={s.hints.planningAge}
          value={profile.planningAge}
          min={0}
          max={130}
          onChange={(planningAge) => onChange({ planningAge })}
        />
        <NumberField
          label={s.yearsUKResident}
          hint={s.hints.yearsUKResident}
          value={profile.yearsUKResident}
          min={0}
          max={100}
          onChange={(yearsUKResident) => onChange({ yearsUKResident })}
        />
        <SelectField
          label={s.reportingCurrency}
          hint={s.hints.reportingCurrency}
          value={profile.reportingCurrency}
          options={CURRENCY_OPTIONS}
          onChange={(reportingCurrency) => onChange({ reportingCurrency })}
        />
      </div>
      {!isValid && (
        <p
          role="alert"
          className="mt-4 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {s.errors.order} {s.errors.span}
        </p>
      )}
    </SectionCard>
  );
}
