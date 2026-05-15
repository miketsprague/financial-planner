# Spec: Epic 2 — Income Streams & Cash Inflows (Detailed Income Mode)

**Status:** Draft (revised)
**Epic:** 2
**Issue:** #2
**Branch:** `copilot/model-income-streams-and-cash-inflows`
**Dependencies:** Epic 1 (Quick-Start Onboarding) — requires `QuickStartInput`, `Assumptions`, and `Plan` types

> **Important:** This spec supersedes the original Epic 2 spec. The original treated income streams as always-on additions to the simple Epic 1 projection. After review, that model produced silently-inconsistent results when both the simple and detailed inputs were configured (e.g. saving like you earn £100k while spending like you earn £40k). This revision reframes Epic 2 as a **distinct "detailed mode"** that progressively *replaces* — not augments — the Epic 1 simple model.

---

## Overview

Epic 1 introduced a low-friction simple projection: five inputs, one chart. Epic 1 AC #12 promises a "Make this more accurate" CTA below the chart but does not define what it does.

Epic 2 defines that CTA's behaviour: it transitions the active plan into **detailed income mode**, where employment incomes, the UK State Pension, and other income streams take over as the source of truth for income. In detailed mode the simple inputs are not used by the projection engine.

This is **progressive replacement**, not layering: at any moment a plan is in exactly one mode, and only the inputs for that mode drive the chart.

---

## Modes

| Mode | Source of income for projection | UI surface |
|---|---|---|
| **Simple** (default) | `QuickStartInput.annualIncome` + `Assumptions.annualStatePension` | QuickStart form + AssumptionsPanel |
| **Detailed** | `employmentIncomes[]` + `statePensionConfig` + `incomeStreams[]` | QuickStart form (partial) + AssumptionsPanel (partial) + IncomeStreamsPanel |

Mode is **per-plan** and persisted. Switching modes preserves the data in the other mode so the user can go back without losing work.

### 2.0 Mode flag

#### Acceptance Criteria

- **AC-2.0.1:** `Plan.mode: "simple" | "detailed"` is a required field. Default `"simple"`.
- **AC-2.0.2:** `deserializePlans` migrates legacy plans (saved before this field existed) to `mode: "simple"`.
- **AC-2.0.3:** Mode is persisted to `localStorage` alongside other Plan fields.
- **AC-2.0.4:** Switching modes never deletes the inputs of the other mode — both sets coexist in storage.

---

## 2.1 Mode Transitions

### Simple → Detailed (via "Make more accurate")

The CTA is visible **only after** the user has submitted the QuickStart form (i.e. `Plan.input !== null`) and the plan is in simple mode.

#### Acceptance Criteria

- **AC-2.1.1:** Clicking the CTA flips `Plan.mode` to `"detailed"` and persists immediately.
- **AC-2.1.2:** On the **first** transition for a plan (i.e. when `employmentIncomes`, `statePensionConfig`, and `incomeStreams` are still at their defaults: `[]`, `DEFAULT_STATE_PENSION_CONFIG`, `[]`), the plan's detailed-mode state is **seeded** from the simple inputs as described in §2.2.
- **AC-2.1.3:** On **subsequent** transitions (after the user has edited detailed-mode data, switched back to simple, and is now returning), seeding does NOT run. The user's previously-entered detailed data is restored.
- **AC-2.1.4:** "First transition" is detected by checking whether all three detailed-mode arrays/structs are still at defaults — not by a separate flag.

### Detailed → Simple

A "Use simple mode" affordance (link or button) is visible while in detailed mode.

#### Acceptance Criteria

- **AC-2.1.5:** Clicking flips `Plan.mode` to `"simple"` and persists immediately.
- **AC-2.1.6:** `employmentIncomes`, `statePensionConfig`, and `incomeStreams` are **not** mutated by this transition — the user can switch back without re-entering data.
- **AC-2.1.7:** In simple mode, the projection engine ignores the three detailed-mode fields entirely.

---

## 2.2 Seeding from Simple Inputs

When the first simple → detailed transition occurs, derive the initial detailed-mode state from the active plan's `QuickStartInput` and `Assumptions`.

### Employment income seed

A single job is created representing "what the user told us in simple mode":

| Field | Seed value |
|---|---|
| `id` | `generateId()` |
| `name` | localised string (e.g. `"Employment"`) |
| `annualGrossSalary` | `input.annualIncome` |
| `annualRaiseRate` | `0` |
| `startAge` | `input.currentAge` |
| `endAge` | `input.retirementAge` |
| `isPreTax` | `true` |
| `enabled` | `true` |

> Rationale for `annualRaiseRate: 0`: the simple model treats `annualIncome` as a flat nominal salary across the accumulation phase. Seeding with a 0% raise preserves the user's pre-transition projection numerically.

### State Pension seed

| Field | Seed value |
|---|---|
| `niQualifyingYears` | `clamp(round(assumptions.annualStatePension / FULL_STATE_PENSION_ANNUAL × 35), 0, 35)` |
| `deferralYears` | `0` |
| `enabled` | `true` |

Where `FULL_STATE_PENSION_ANNUAL = 11_502.40`. Defaults match the UK default (≈£11,502/yr → 35 years).

### Income streams seed

| Field | Seed value |
|---|---|
| `incomeStreams` | `[]` (empty) |

#### Acceptance Criteria

- **AC-2.2.1:** Seeding mutates the plan's detailed-mode fields atomically — either all three fields are seeded or none are.
- **AC-2.2.2:** Seeding **never modifies** `input.annualIncome` or `assumptions.annualStatePension`. Simple-mode inputs remain available for a subsequent switch back.
- **AC-2.2.3:** `niQualifyingYears` is clamped to `[0, 35]`. (Negative input is impossible from the simple model since `annualStatePension >= 0`.)
- **AC-2.2.4:** If `assumptions.annualStatePension` is `0`, the seed sets `niQualifyingYears: 0` and the resulting computed pension is `0`. The toggle remains `enabled: true` — the user can adjust upward.

---

## 2.3 Employment Income (Detailed Mode Only)

### Fields

| Field | Type | Default | Constraints |
|---|---|---|---|
| `id` | `string` | generated | — |
| `name` | `string` | `"Job"` | non-empty |
| `annualGrossSalary` | `number` | `30000` | ≥ 0 |
| `annualRaiseRate` | `number` (fraction) | `0.03` | ≥ 0 |
| `startAge` | `number` | `currentAge` | ≥ 16 |
| `endAge` | `number` | `retirementAge` | > `startAge` |
| `isPreTax` | `boolean` | `true` | — |
| `enabled` | `boolean` | `true` | — |

### Acceptance Criteria

- **AC-2.3.1:** Multiple employment incomes can be added to a plan.
- **AC-2.3.2:** Each job may be enabled/disabled without deletion (scenario testing).
- **AC-2.3.3:** Annual raise rate compounds per year from `startAge`: `salaryAt(age) = startingSalary × (1 + raiseRate)^(age − startAge)`.
- **AC-2.3.4:** Contribution from a job at age = `salaryAt(age) × annualContributionRate` (where `annualContributionRate` comes from `Assumptions`).
- **AC-2.3.5:** A job outside `[startAge, endAge]` (inclusive) contributes 0.
- **AC-2.3.6:** Disabled jobs contribute 0.

> **Note:** There is no fallback to `input.annualIncome` in detailed mode. If no enabled employment income is active at a given accumulation age, the contribution from employment for that year is 0. (Income streams may still contribute — see §2.5.)

---

## 2.4 UK State Pension (Detailed Mode Only)

### Constants (2025/26)

| Constant | Value |
|---|---|
| Full new State Pension (weekly) | £221.20 |
| Full new State Pension (annual) | £11,502.40 (221.20 × 52) |
| Full qualifying NI years | 35 |
| Minimum qualifying NI years | 10 |
| Deferral increase per year | 5.8% |
| Default State Pension age | `Assumptions.statePensionAge` (UK default 67) |

### Fields

| Field | Type | Default | Constraints |
|---|---|---|---|
| `niQualifyingYears` | `number` | `35` | 0–40+ |
| `deferralYears` | `number` | `0` | 0–5 |
| `enabled` | `boolean` | `true` | — |

### Acceptance Criteria

- **AC-2.4.1:** Returns 0 for fewer than 10 qualifying NI years.
- **AC-2.4.2:** Returns proportional amount for 10–34 years: `(niYears / 35) × FULL_ANNUAL`.
- **AC-2.4.3:** Returns full State Pension (£11,502.40/yr) for ≥ 35 qualifying years (capped at 35).
- **AC-2.4.4:** Deferral multiplier `1 + (deferralYears × 0.058)` applied to base pension.
- **AC-2.4.5:** Effective State Pension age = `Assumptions.statePensionAge + statePensionConfig.deferralYears`. Before that age, projection receives no pension.
- **AC-2.4.6:** When `statePensionConfig.enabled === false` in detailed mode, the projection treats State Pension as **0** at every age. (No fallback to `Assumptions.annualStatePension`. The simple-mode value is irrelevant in detailed mode.)
- **AC-2.4.7:** Invalid inputs (NaN, Infinity, negative) return 0.

---

## 2.5 Other Income Streams (Detailed Mode Only)

### Preset Types

`"private-pension" | "rental" | "side-business" | "annuity" | "part-time" | "other"`

### Fields

| Field | Type | Default | Constraints |
|---|---|---|---|
| `id` | `string` | generated | — |
| `name` | `string` | `"Income"` | non-empty |
| `type` | `IncomeStreamType` | `"other"` | — |
| `annualAmount` | `number` | `5000` | ≥ 0 |
| `startAge` | `number` | `retirementAge` | — |
| `endAge` | `number \| null` | `null` | `null` = no end |
| `growthRate` | `number` (fraction) | `0.02` | any |
| `enabled` | `boolean` | `true` | — |

### Acceptance Criteria

- **AC-2.5.1:** Nominal income at age = `annualAmount × (1 + growthRate)^(age − startAge)`.
- **AC-2.5.2:** Stream with `endAge = null` continues indefinitely.
- **AC-2.5.3:** Stream with `endAge` set contributes 0 strictly after that age (inclusive of `endAge`).
- **AC-2.5.4:** Disabled streams contribute 0.
- **AC-2.5.5:** Multiple streams are summed per age.
- **AC-2.5.6:** Age before `startAge` returns 0.
- **AC-2.5.7:** During **accumulation** (`age < retirementAge`): stream income contributes `streamIncomeAtAge × annualContributionRate` to portfolio (mirrors how a fraction of salary is saved; the remainder is implicitly spent).
- **AC-2.5.8:** During **drawdown** (`age >= retirementAge`): stream income offsets the portfolio withdrawal need (added to the State Pension offset in `computeAnnualWithdrawal`).
- **AC-2.5.9:** Pre-retirement and post-retirement behaviour are symmetric in this sense: in both cases the user keeps the full stream amount; only the *projection portfolio* accounting differs (savings vs. withdrawal offset).

---

## 2.6 Projection Engine — Detailed Mode

### Inputs

`projectSavings(input, assumptions, incomeConfig?)`

`incomeConfig` is only consulted when `plan.mode === "detailed"`. (The caller — currently `useProjection` — is responsible for passing `undefined` when the plan is in simple mode. See §2.8.)

### Accumulation Phase (`age < retirementAge`)

```
contributionFromEmployment = Σ computeEmploymentContributionsAtAge(...)  // active enabled jobs
contributionFromStreams    = computeIncomeStreamsAtAge(...) × annualContributionRate
contribution               = contributionFromEmployment + contributionFromStreams
balance                    = prevBalance × (1 + investmentReturn) + contribution
```

#### Acceptance Criteria

- **AC-2.6.1:** When no enabled employment income is active at a given accumulation age, `contributionFromEmployment = 0`. There is no fallback to `input.annualIncome`.
- **AC-2.6.2:** Streams contribute proportionally to `annualContributionRate` during accumulation (per AC-2.5.7).
- **AC-2.6.3:** When `incomeConfig` is `undefined` (simple mode), the projection engine behaves exactly per Epic 1 — `input.annualIncome × annualContributionRate` is the only contribution.

### Drawdown Phase (`age >= retirementAge`)

Replacement target is derived from a **pre-retirement income basis** rooted in employment incomes:

```
preRetirementBasis = computePreRetirementBasis(employmentIncomes, retirementAge, inflationRate)
effectiveIncome    = preRetirementBasis × (1 + inflationRate)^(age − (retirementAge − 1))
pension            = effectiveStatePension × (1 + inflationRate)^(age − currentAge)    if hasStatePension else 0
streamOffset       = computeIncomeStreamsAtAge(incomeStreams, age)                      // already includes growthRate
withdrawal         = computeAnnualWithdrawal(effectiveIncome, pension + streamOffset, incomeReplacementRatio)
balance            = max(0, prevBalance × (1 + investmentReturn) − withdrawal)
```

`computePreRetirementBasis(employmentIncomes, retirementAge, inflationRate)`:
1. Compute `b₁ = Σ computeEmploymentSalaryAtAge(salary, raise, jobStartAge, retirementAge − 1)` for each enabled job where `(retirementAge − 1)` is in `[jobStartAge, jobEndAge]`.
2. If `b₁ > 0`, return `b₁`.
3. Otherwise compute `b₂` by summing each enabled job's salary at its own `endAge`, inflation-adjusted forward from `endAge` to `retirementAge − 1`: `b₂ = Σ computeEmploymentSalaryAtAge(salary, raise, startAge, endAge) × (1 + inflationRate)^(retirementAge − 1 − endAge)` for each enabled job.
4. Return `b₂` (which may be 0 if there are no enabled jobs at all).

#### Acceptance Criteria

- **AC-2.6.4:** `effectiveIncome` inflates from `retirementAge − 1` (the basis reference age) — not from `currentAge`. Inflation is **not** applied twice: the basis itself already reflects each job's compounded raises up to retirement.
- **AC-2.6.5:** When at least one enabled job is active at `retirementAge − 1`, the basis is the sum of those jobs' salaries at that age (§2.6 step 1).
- **AC-2.6.6:** When no enabled job is active at `retirementAge − 1` but at least one enabled job exists, the basis falls back to the sum of each enabled job's last-year salary, inflated forward to `retirementAge − 1` (§2.6 step 3).
- **AC-2.6.7:** When no enabled employment incomes exist, `preRetirementBasis = 0`. `computeAnnualWithdrawal(0, ...)` returns 0 (existing behaviour). The portfolio is not drawn down. The user is implicitly funded by State Pension + income streams only — which is a valid mental model.
- **AC-2.6.8:** State Pension and stream offsets reduce the withdrawal from portfolio but never make it negative (existing `Math.max(0, ...)` behaviour).
- **AC-2.6.9:** Effective State Pension age = `assumptions.statePensionAge + statePensionConfig.deferralYears`. Pension is 0 before this age. When `statePensionConfig.enabled === false`, pension is 0 at every age (per AC-2.4.6).

### Simple Mode

#### Acceptance Criteria

- **AC-2.6.10:** When `plan.mode === "simple"` (or equivalently when `incomeConfig` is not passed), Epic 1's projection behaviour is unchanged: contributions = `annualIncome × annualContributionRate`; drawdown target = `annualIncome × (1 + inflationRate)^(age − currentAge) × incomeReplacementRatio`; pension = `annualStatePension × inflation`.

---

## 2.7 Data Persistence

#### Acceptance Criteria

- **AC-2.7.1:** `Plan` type gains: `mode: "simple" | "detailed"`, `employmentIncomes: EmploymentIncome[]`, `statePensionConfig: StatePensionConfig`, `incomeStreams: IncomeStream[]`.
- **AC-2.7.2:** `createPlan` initialises `mode: "simple"`, empty arrays for employment/streams, and `DEFAULT_STATE_PENSION_CONFIG` for state pension.
- **AC-2.7.3:** `deserializePlans` migrates plans saved before each of these fields existed:
  - missing `mode` → `"simple"`
  - missing `employmentIncomes` → `[]`
  - missing `statePensionConfig` → `DEFAULT_STATE_PENSION_CONFIG`
  - missing `incomeStreams` → `[]`
- **AC-2.7.4:** `duplicatePlan` copies all four detailed-mode fields and the mode flag.

---

## 2.8 UI / UX

### Component Tree (detailed mode active)

```
src/app/page.tsx
├── Header
├── QuickStartWizard
│   ├── QuickStartForm        (mode-aware: see 2.8.x)
│   └── ProjectionChart       (drives projection from incomeConfig in detailed mode)
├── PlanManager               (sidebar)
├── AssumptionsPanel          (sidebar; mode-aware)
└── IncomeStreamsPanel        (sidebar; detailed mode only)
```

### Acceptance Criteria

- **AC-2.8.1:** `IncomeStreamsPanel` is rendered **only when** `activePlan.mode === "detailed"`.
- **AC-2.8.2:** In detailed mode, the QuickStart form hides or disables the `annualIncome` field; the field is no longer the source of truth for projections. Display, if shown, must indicate it is unused (e.g. read-only summary "Derived from employment incomes" or hidden entirely).
- **AC-2.8.3:** In detailed mode, the AssumptionsPanel either hides `annualStatePension` or labels it "Used in simple mode only". `statePensionAge`, `annualContributionRate`, `incomeReplacementRatio`, `inflationRate`, `investmentReturn`, `lifeExpectancy` remain editable in both modes — they're applied identically.
- **AC-2.8.4:** A "Make this more accurate" CTA is shown below the chart **only** when `mode === "simple"` and `input !== null` (Epic 1 AC #12). Clicking it triggers §2.1 + §2.2.
- **AC-2.8.5:** A "Use simple mode" affordance is shown within the IncomeStreamsPanel (or near it) when `mode === "detailed"`. Clicking it triggers §2.1 (Detailed → Simple).
- **AC-2.8.6:** Mode transitions update the projection chart in the same render cycle (no flicker, no stale data).
- **AC-2.8.7:** Switching plans does not change the mode flag — each plan retains its own mode.

### Locale

- **AC-2.8.8:** All user-facing strings for mode transitions, employment income, state pension, and income streams live in `src/locales/en-GB/index.ts` and are accessed via `getLocaleStrings()`. No hardcoded `£` or English strings in components.

---

## Data Model

```typescript
type PlanMode = "simple" | "detailed";

type EmploymentIncome = {
  id: string;
  name: string;
  annualGrossSalary: number;
  annualRaiseRate: number;
  startAge: number;
  endAge: number;
  isPreTax: boolean;
  enabled: boolean;
};

type StatePensionConfig = {
  niQualifyingYears: number;
  deferralYears: number;
  enabled: boolean;
};

type IncomeStream = {
  id: string;
  name: string;
  type: IncomeStreamType;
  annualAmount: number;
  startAge: number;
  endAge: number | null;
  growthRate: number;
  enabled: boolean;
};

type Plan = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mode: PlanMode;                       // NEW
  input: QuickStartInput | null;
  assumptions: Assumptions;
  employmentIncomes: EmploymentIncome[];
  statePensionConfig: StatePensionConfig;
  incomeStreams: IncomeStream[];
};

type IncomeConfig = {                   // passed to projectSavings in detailed mode
  employmentIncomes: EmploymentIncome[];
  statePensionConfig: StatePensionConfig;
  incomeStreams: IncomeStream[];
};
```

---

## Business Logic

### Pure helpers (`src/lib/income.ts`)
- `computeStatePensionAnnual(niYears, deferralYears) → number` — unchanged from current implementation.
- `computeEmploymentSalaryAtAge(salary, raise, startAge, targetAge) → number` — unchanged.
- `computeEmploymentContributionsAtAge(employmentIncomes, age, contributionRate) → number` — unchanged.
- `computeIncomeStreamsAtAge(streams, age) → number` — unchanged. Note: returns the nominal stream income at the given age. The caller decides whether to multiply by `contributionRate` (accumulation, AC-2.5.7) or use as a withdrawal offset (drawdown, AC-2.5.8).

### New helper (`src/lib/income.ts`)
- `computePreRetirementBasis(employmentIncomes, retirementAge, inflationRate) → number` — implements §2.6 steps 1–4. Returns the nominal annual income at age `retirementAge − 1` used as the basis for the income-replacement target.

### Projection (`src/lib/calculations.ts`)
- `projectSavings(input, assumptions, incomeConfig?) → ProjectionDataPoint[]` — updated to honour AC-2.6.x. When `incomeConfig` is `undefined`, simple-mode behaviour is preserved (AC-2.6.3, AC-2.6.10).

### Seeding (`src/lib/plans.ts`)
- `seedDetailedModeFromSimple(plan) → Plan` — pure function that takes a plan with default detailed-mode fields and returns a new plan with §2.2 seed values applied. Idempotent only when called against an already-seeded plan? No — by AC-2.1.4 this should NOT be called when the plan has user-edited detailed-mode data, so callers must check first. The helper itself is unconditional.

---

## Edge Cases

| Input | Expected |
|---|---|
| `computeStatePensionAnnual(NaN)` | 0 |
| `computeStatePensionAnnual(35, -1)` | 0 |
| `computeStatePensionAnnual(9)` | 0 |
| `computeStatePensionAnnual(40)` | Full pension (capped) |
| `computeEmploymentSalaryAtAge(50000, 0.03, 30, 25)` | 0 (target before start) |
| `computeIncomeStreamsAtAge([], 65)` | 0 |
| Stream with `growthRate = 0` | Flat `annualAmount` at every active age |
| Detailed mode with no enabled employment incomes | `preRetirementBasis = 0` → withdrawal = `max(0, 0 − pension − streams)` = 0; portfolio not drawn down |
| Detailed mode with all jobs ending before `retirementAge − 1` | Falls back to last-job-salary inflated forward (AC-2.6.6) |
| Detailed mode with `statePensionConfig.enabled = false` | Pension treated as 0 at every age — does NOT fall back to `Assumptions.annualStatePension` |
| Simple mode with non-default `employmentIncomes` array | Ignored — projection uses only `input.annualIncome` (AC-2.1.7) |
| Mode transition while a draft input edit is in progress | The transition commits any draft per existing input semantics (out of scope; treat as ordinary state update) |
| Re-transitioning Simple → Detailed after the user had used detailed mode | No re-seeding (AC-2.1.3) — preserves user data |

---

## Non-Functional Requirements

- **Performance:** Mode transitions and detailed-mode recomputation must complete within a single render frame at typical plan sizes (≤ 5 jobs, ≤ 5 income streams).
- **Privacy:** All detailed-mode data lives client-side in `localStorage`. No server calls.
- **Locale:** All UI strings for new modes/sections via `src/locales/`. `£` is never hardcoded.
- **Accessibility:** Mode-toggle CTAs use `<button>` semantics; their state (active mode) is exposed via `aria-pressed` or equivalent. Form fields hidden in a given mode are removed from the DOM (not visually hidden) to avoid screen-reader confusion.
- **Static export:** No SSR features.

---

## Out of Scope

- Auto-syncing the simple `annualIncome` with the sum of employment incomes (one-time seed only, per AC-2.2.2).
- Per-job `annualContributionRate` overrides (the rate stays global, in `Assumptions`).
- Modelling tax (income tax, NI, dividends) — separate epic.
- Multi-currency or non-GBP locale defaults for State Pension constants — locked to UK 2025/26.
- A "preview the impact of switching modes" diff view — switching is direct.
- Migrating *plans that have user-edited detailed-mode data but were created before the mode flag existed*. Such plans cannot exist in practice (the field is introduced together with the flag).

---

## Migration / Implementation Notes

The branch `copilot/model-income-streams-and-cash-inflows` (PR #58) already implements:

1. ✅ Types: `EmploymentIncome`, `StatePensionConfig`, `IncomeStream`, `IncomeStreamType`
2. ✅ Pure helpers: `computeStatePensionAnnual`, `computeEmploymentSalaryAtAge`, `computeEmploymentContributionsAtAge`, `computeIncomeStreamsAtAge`
3. ✅ `IncomeStreamsPanel` component
4. ✅ Persistence migration for the three array/struct fields
5. ✅ `incomeConfig` plumbed through `projectSavings`

However, the current branch does **not** match this revised spec in the following respects:

| Behaviour | Current branch | This spec |
|---|---|---|
| `Plan.mode` flag | ❌ missing | ✅ required (§2.0) |
| IncomeStreamsPanel always rendered | ❌ yes | ✅ detailed mode only (AC-2.8.1) |
| `annualIncome` field hidden in detailed mode | ❌ no | ✅ required (AC-2.8.2) |
| Replacement target uses employment incomes | ❌ uses simple `annualIncome` only | ✅ uses employment basis (§2.6) |
| Pre-retirement income streams contribute | ❌ silently dropped | ✅ `× contributionRate` (AC-2.5.7) |
| `statePensionConfig.enabled = false` → pension is 0 in detailed mode | ❌ falls back to `annualStatePension` | ✅ truly 0 (AC-2.4.6) |
| "Make More Accurate" CTA wired to seed detailed mode | ❌ CTA never rendered | ✅ required (AC-2.8.4) |
| "Use simple mode" affordance | ❌ missing | ✅ required (AC-2.8.5) |

These gaps should be closed in the same PR (or a clearly-linked follow-up PR) before this spec is marked **Implemented**.

