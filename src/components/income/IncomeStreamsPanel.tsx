"use client";

import type { LocaleStrings } from "@/locales/en-GB";
import type {
  EmploymentIncome,
  IncomeStream,
  IncomeStreamType,
  Locale,
  StatePensionConfig,
} from "@/types";
import { computeStatePensionAnnual } from "@/lib/income";
import { generateId } from "@/lib/id";
import { formatCurrency, formatPercentage } from "@/lib/formatting";

type Props = {
  strings: LocaleStrings;
  currentAge: number;
  retirementAge: number;
  employmentIncomes: EmploymentIncome[];
  statePensionConfig: StatePensionConfig;
  incomeStreams: IncomeStream[];
  statePensionAge: number;
  locale: Locale;
  onEmploymentChange: (items: EmploymentIncome[]) => void;
  onStatePensionChange: (config: StatePensionConfig) => void;
  onIncomeStreamsChange: (streams: IncomeStream[]) => void;
};

const STREAM_TYPES: IncomeStreamType[] = [
  "private-pension",
  "rental",
  "side-business",
  "annuity",
  "part-time",
  "other",
];

const INPUT_CLASS =
  "w-full text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500 py-0.5";

const LABEL_CLASS = "text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5";

function toggleClass(active: boolean): string {
  return `text-xs px-1.5 py-0.5 rounded transition-colors ${
    active
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
  }`;
}

export function IncomeStreamsPanel({
  strings,
  currentAge,
  retirementAge,
  employmentIncomes,
  statePensionConfig,
  incomeStreams,
  statePensionAge,
  locale,
  onEmploymentChange,
  onStatePensionChange,
  onIncomeStreamsChange,
}: Props) {
  const s = strings.incomeStreams;

  const computedPensionAnnual = computeStatePensionAnnual(
    statePensionConfig.niQualifyingYears,
    statePensionConfig.deferralYears,
  );
  const computedPensionWeekly =
    (computedPensionAnnual / 52);
  const effectivePensionAge = statePensionAge + statePensionConfig.deferralYears;

  // ── Employment handlers ───────────────────────────────────────────────────
  function addEmployment() {
    const newJob: EmploymentIncome = {
      id: generateId(),
      name: "Job",
      annualGrossSalary: 30_000,
      annualRaiseRate: 0.03,
      startAge: currentAge,
      endAge: retirementAge,
      isPreTax: true,
      enabled: true,
    };
    onEmploymentChange([...employmentIncomes, newJob]);
  }

  function updateEmployment(id: string, changes: Partial<EmploymentIncome>) {
    onEmploymentChange(
      employmentIncomes.map((j) => (j.id === id ? { ...j, ...changes } : j)),
    );
  }

  function removeEmployment(id: string) {
    onEmploymentChange(employmentIncomes.filter((j) => j.id !== id));
  }

  // ── Income stream handlers ────────────────────────────────────────────────
  function addIncomeStream() {
    const newStream: IncomeStream = {
      id: generateId(),
      name: "Income",
      type: "other",
      annualAmount: 5_000,
      startAge: retirementAge,
      endAge: null,
      growthRate: 0.02,
      enabled: true,
    };
    onIncomeStreamsChange([...incomeStreams, newStream]);
  }

  function updateIncomeStream(id: string, changes: Partial<IncomeStream>) {
    onIncomeStreamsChange(
      incomeStreams.map((st) => (st.id === id ? { ...st, ...changes } : st)),
    );
  }

  function removeIncomeStream(id: string) {
    onIncomeStreamsChange(incomeStreams.filter((st) => st.id !== id));
  }

  return (
    <section aria-label={s.title} className="flex flex-col gap-5">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {s.title}
      </h3>

      {/* ── Employment Income ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {s.employment}
        </h4>

        {employmentIncomes.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{s.noEmployment}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {employmentIncomes.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 flex flex-col gap-2"
              >
                {/* Name + controls */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={job.name}
                    onChange={(e) => updateEmployment(job.id, { name: e.target.value })}
                    aria-label={s.streamName}
                    className="flex-1 text-sm font-medium bg-transparent text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500 min-w-0 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => updateEmployment(job.id, { enabled: !job.enabled })}
                    className={toggleClass(job.enabled)}
                  >
                    {job.enabled ? s.toggleOn : s.toggleOff}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEmployment(job.id)}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {s.remove}
                  </button>
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {/* Salary — full width */}
                  <div className="col-span-2">
                    <label className={LABEL_CLASS}>{s.salary}</label>
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {s.currencyPrefix}
                      </span>
                      <input
                        type="number"
                        value={job.annualGrossSalary}
                        min={0}
                        step={1_000}
                        onChange={(e) =>
                          updateEmployment(job.id, {
                            annualGrossSalary: Math.max(
                              0,
                              parseFloat(e.target.value) || 0,
                            ),
                          })
                        }
                        className={INPUT_CLASS}
                        aria-label={s.salary}
                      />
                    </div>
                  </div>

                  {/* Raise rate */}
                  <div>
                    <label className={LABEL_CLASS}>{s.raiseRate} %</label>
                    <input
                      type="number"
                      value={(job.annualRaiseRate * 100).toFixed(1)}
                      min={0}
                      max={20}
                      step={0.1}
                      onChange={(e) =>
                        updateEmployment(job.id, {
                          annualRaiseRate:
                            (parseFloat(e.target.value) || 0) / 100,
                        })
                      }
                      className={INPUT_CLASS}
                      aria-label={s.raiseRate}
                    />
                  </div>

                  {/* Start age */}
                  <div>
                    <label className={LABEL_CLASS}>{s.startAge}</label>
                    <input
                      type="number"
                      value={job.startAge}
                      min={16}
                      max={99}
                      onChange={(e) =>
                        updateEmployment(job.id, {
                          startAge:
                            parseInt(e.target.value, 10) || currentAge,
                        })
                      }
                      className={INPUT_CLASS}
                      aria-label={s.startAge}
                    />
                  </div>

                  {/* End age */}
                  <div>
                    <label className={LABEL_CLASS}>{s.endAge}</label>
                    <input
                      type="number"
                      value={job.endAge}
                      min={16}
                      max={99}
                      onChange={(e) =>
                        updateEmployment(job.id, {
                          endAge:
                            parseInt(e.target.value, 10) || retirementAge,
                        })
                      }
                      className={INPUT_CLASS}
                      aria-label={s.endAge}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addEmployment}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline self-start"
        >
          + {s.addEmployment}
        </button>
      </div>

      {/* ── State Pension ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {s.statePension}
          </h4>
          <button
            type="button"
            onClick={() =>
              onStatePensionChange({
                ...statePensionConfig,
                enabled: !statePensionConfig.enabled,
              })
            }
            className={toggleClass(statePensionConfig.enabled)}
          >
            {statePensionConfig.enabled ? s.toggleOn : s.toggleOff}
          </button>
        </div>

        {/* NI qualifying years slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="ni-qualifying-years"
              className="text-xs text-zinc-600 dark:text-zinc-400"
            >
              {s.niYears}
            </label>
            <span className="text-xs font-mono text-zinc-700 dark:text-zinc-200 tabular-nums">
              {statePensionConfig.niQualifyingYears} yrs
            </span>
          </div>
          <input
            id="ni-qualifying-years"
            type="range"
            min={0}
            max={40}
            step={1}
            value={statePensionConfig.niQualifyingYears}
            onChange={(e) =>
              onStatePensionChange({
                ...statePensionConfig,
                niQualifyingYears: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{s.niYearsHint}</p>
        </div>

        {/* Deferral years */}
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="deferral-years"
            className="text-xs text-zinc-600 dark:text-zinc-400 flex-1"
          >
            {s.deferralYears}
          </label>
          <input
            id="deferral-years"
            type="number"
            min={0}
            max={5}
            step={1}
            value={statePensionConfig.deferralYears}
            onChange={(e) =>
              onStatePensionChange({
                ...statePensionConfig,
                deferralYears: Math.max(
                  0,
                  parseInt(e.target.value, 10) || 0,
                ),
              })
            }
            className="w-16 text-sm text-right bg-transparent text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500"
            aria-label={s.deferralYears}
          />
        </div>

        {/* Computed pension display */}
        <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
          <div className="flex justify-between">
            <span>{s.computedPension}</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatCurrency(computedPensionAnnual, locale)}{s.yearlyAmount}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Weekly</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatCurrency(computedPensionWeekly, locale)}{s.weeklyAmount}
            </span>
          </div>
          {statePensionConfig.deferralYears > 0 && (
            <div className="flex justify-between text-zinc-500 dark:text-zinc-500">
              <span>Starts at age</span>
              <span>{effectivePensionAge}</span>
            </div>
          )}
          {statePensionConfig.niQualifyingYears <
            10 && (
            <p className="text-amber-600 dark:text-amber-400 mt-0.5">
              Below 10 qualifying years — no entitlement
            </p>
          )}
        </div>
      </div>

      {/* ── Other Income Streams ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {s.otherIncome}
        </h4>

        {incomeStreams.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{s.noStreams}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {incomeStreams.map((stream) => (
              <div
                key={stream.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 flex flex-col gap-2"
              >
                {/* Name + type + controls */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={stream.name}
                    onChange={(e) =>
                      updateIncomeStream(stream.id, { name: e.target.value })
                    }
                    aria-label={s.streamName}
                    className="flex-1 text-sm font-medium bg-transparent text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500 min-w-0 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateIncomeStream(stream.id, {
                        enabled: !stream.enabled,
                      })
                    }
                    className={toggleClass(stream.enabled)}
                  >
                    {stream.enabled ? s.toggleOn : s.toggleOff}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeIncomeStream(stream.id)}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {s.remove}
                  </button>
                </div>

                {/* Type selector */}
                <div>
                  <label className={LABEL_CLASS}>{s.streamType}</label>
                  <select
                    value={stream.type}
                    onChange={(e) =>
                      updateIncomeStream(stream.id, {
                        type: e.target.value as IncomeStreamType,
                      })
                    }
                    className="w-full text-sm bg-transparent text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500 py-0.5"
                    aria-label={s.streamType}
                  >
                    {STREAM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {s.types[t]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {/* Annual amount — full width */}
                  <div className="col-span-2">
                    <label className={LABEL_CLASS}>{s.streamAmount}</label>
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {s.currencyPrefix}
                      </span>
                      <input
                        type="number"
                        value={stream.annualAmount}
                        min={0}
                        step={500}
                        onChange={(e) =>
                          updateIncomeStream(stream.id, {
                            annualAmount: Math.max(
                              0,
                              parseFloat(e.target.value) || 0,
                            ),
                          })
                        }
                        className={INPUT_CLASS}
                        aria-label={s.streamAmount}
                      />
                    </div>
                  </div>

                  {/* Growth rate */}
                  <div>
                    <label className={LABEL_CLASS}>
                      {s.streamGrowthRate} %
                    </label>
                    <input
                      type="number"
                      value={(stream.growthRate * 100).toFixed(1)}
                      min={0}
                      max={20}
                      step={0.1}
                      onChange={(e) =>
                        updateIncomeStream(stream.id, {
                          growthRate:
                            (parseFloat(e.target.value) || 0) / 100,
                        })
                      }
                      className={INPUT_CLASS}
                      aria-label={s.streamGrowthRate}
                    />
                  </div>

                  {/* Start age */}
                  <div>
                    <label className={LABEL_CLASS}>{s.streamStartAge}</label>
                    <input
                      type="number"
                      value={stream.startAge}
                      min={16}
                      max={99}
                      onChange={(e) =>
                        updateIncomeStream(stream.id, {
                          startAge:
                            parseInt(e.target.value, 10) || retirementAge,
                        })
                      }
                      className={INPUT_CLASS}
                      aria-label={s.streamStartAge}
                    />
                  </div>

                  {/* End age */}
                  <div className="col-span-2">
                    <label className={LABEL_CLASS}>{s.streamEndAge}</label>
                    <input
                      type="number"
                      value={stream.endAge ?? ""}
                      min={16}
                      max={120}
                      placeholder="No end"
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        updateIncomeStream(stream.id, {
                          endAge: val === "" ? null : parseInt(val, 10) || null,
                        });
                      }}
                      className={INPUT_CLASS}
                      aria-label={s.streamEndAge}
                    />
                  </div>
                </div>

                {/* Computed value hint */}
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatCurrency(stream.annualAmount, locale)}{s.yearlyAmount}
                  {stream.growthRate > 0 &&
                    ` · grows at ${formatPercentage(stream.growthRate, locale)}`}
                  {` · from age ${stream.startAge}`}
                  {stream.endAge !== null && ` to ${stream.endAge}`}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addIncomeStream}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline self-start"
        >
          + {s.addIncomeStream}
        </button>
      </div>
    </section>
  );
}
