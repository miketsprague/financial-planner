# Epic 1 — Quick-Start Profile & Onboarding

**Status:** Implemented  
**Issue:** #29  
**Branch:** `copilot/epic-1-quick-start-profile-onboarding`

---

## Background

New users need to see a useful retirement projection within two minutes, using the fewest possible inputs. The goal is a low-friction entry point ("show me something now") with progressive disclosure for users who want more accuracy later.

Competitor reference:
- **Empower** — starts with age + income + savings and shows a projection immediately.
- **ProjectionLab** — requires more upfront input but rewards with richer output.

This spec targets the Empower-style low-friction start, while building the architecture that will eventually support ProjectionLab-level depth.

---

## User Stories

### 1.1 Quick-Start Setup
> As a user, I want to enter my age, retirement age, life expectancy, current savings, and annual income so I can immediately see a basic retirement projection.

### 1.2 Plan Naming & Saving
> As a user, I want to save my plan with a name so I can return to it later or create multiple plans.

### 1.3 Assumptions Panel
> As a user, I want to adjust global assumptions (inflation rate, expected return, life expectancy) so projections match my worldview.

---

## Acceptance Criteria

### 1.1 Quick-Start Form

1. The form collects exactly five inputs: **current age**, **target retirement age**, **life expectancy** (default 90), **current savings/pension pot** (£), and **annual gross income** (£).
2. All inputs are numeric. Currency inputs display a `£` prefix sourced from the locale layer — never hardcoded.
3. Validation rules (inline errors, shown on blur or submit):
   - `currentAge` must be 18–99.
   - `retirementAge` must be greater than `currentAge` and ≤ 99.
   - `lifeExpectancy` must be greater than `retirementAge`.
   - `currentSavings` must be ≥ 0.
   - `annualIncome` must be > 0.
4. Submitting a valid form transitions the view from the form to a projection chart.
5. An "Edit Inputs" link returns the user to the form pre-filled with their previous values.
6. The complete journey (open page → submit form → see chart) takes under 2 minutes.

### 1.2 Projection Chart

7. The chart is a Recharts `AreaChart` showing portfolio balance (Y-axis, compact currency) vs age (X-axis).
8. A vertical reference line marks the **retirement age** (red).
9. A separate vertical reference line marks the **state pension age** when it differs from retirement age (purple).
10. A status banner above the chart indicates whether funding is sufficient (balance > 0 at `lifeExpectancy`) or at risk.
11. Hovering a data point shows age and formatted balance in a tooltip.
12. A "Make this more accurate" CTA is displayed below the chart.

### 1.3 UK Default Assumptions

13. Default values (applied on first load and after "Reset to defaults"):
    - Investment return: **5%** real (post-inflation)
    - Inflation rate: **2.5%** (Bank of England CPI target)
    - Life expectancy: **90**
    - State pension age: **67**
    - Annual state pension: **£11,502** (2024/25 full new State Pension)
    - Annual contribution rate: **10%** of gross income
14. Defaults are declared in `src/lib/defaults.ts` as a single named constant — not scattered across components.

### 1.4 Projection Engine

15. `projectSavings(input, assumptions)` returns a `ProjectionDataPoint[]` with one entry per year from `currentAge` to `max(retirementAge, lifeExpectancy)`.
16. Each `ProjectionDataPoint` has `age`, `balance`, `isRetired`, and `hasStatePension` fields.
17. **Accumulation phase** (`age < retirementAge`): `balance = prevBalance × (1 + investmentReturn) + annualContribution`.
18. **Drawdown phase** (`age >= retirementAge`): `balance = prevBalance × (1 + investmentReturn) − withdrawal`, floored at 0.
19. Annual withdrawal = `max(0, annualIncome × 2/3 − statePension)` where `statePension` is `annualStatePension` when `age >= statePensionAge`, else 0.
20. Balance never goes below 0.
21. Returns an empty array when `retirementAge <= currentAge` or other invalid inputs.

### 1.5 Plan Management

22. Each plan persists in **browser localStorage** — no backend, no account required.
23. A plan stores: `id`, `name`, `createdAt`, `updatedAt` (ISO 8601), `input` (nullable), and `assumptions`.
24. Users can **create** a new plan (defaults to "My Plan"), **rename** (inline edit, confirmed with Enter, cancelled with Escape), **duplicate** the active plan, and **delete** with a two-step confirmation.
25. The duplicate button is only active for the currently selected plan.
26. Auto-save: every mutation (input submit, assumption change, rename, etc.) immediately persists to localStorage.
27. The active plan ID is also persisted, so the same plan is restored on page reload.
28. Switching plans updates the Assumptions Panel to reflect the selected plan's assumptions.

### 1.6 Assumptions Panel

29. Three adjustable assumptions via range sliders: **inflation rate** (0–15%), **investment return** (0–20%), **life expectancy** (60–120 yrs).
30. Each slider displays: label, current value (formatted), tooltip `ⓘ` icon with an explanatory tooltip, and min/max range labels.
31. Changing any assumption immediately updates the projection chart.
32. "Reset to defaults" restores all three to their UK default values and persists the reset to the active plan.

### 1.7 Locale / Formatting

33. All user-facing strings come from `src/locales/en-GB/index.ts` via `getLocaleStrings()`.
34. Currency formatting uses `Intl.NumberFormat` — no hardcoded `£` symbols in components or business logic.
35. The locale architecture supports adding `en-US` as a future variant without code branches.

### 1.8 Accessibility

36. The Quick-Start form has an `aria-label` matching the section title.
37. Invalid fields set `aria-invalid="true"` and `aria-describedby` pointing to their error message.
38. Error messages use `role="alert"` for screen reader announcements.
39. Tooltips are keyboard-accessible (focus/blur triggers).

---

## Data Model

```typescript
type Locale = "en-GB" | "en-US";

type QuickStartInput = {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  annualIncome: number;
};

type Assumptions = {
  inflationRate: number;       // e.g. 0.025
  investmentReturn: number;    // e.g. 0.05
  lifeExpectancy: number;      // age, e.g. 90
  statePensionAge: number;     // e.g. 67
  annualStatePension: number;  // £11,502
  annualContributionRate: number; // e.g. 0.10
  locale: Locale;
};

type ProjectionDataPoint = {
  age: number;
  balance: number;
  isRetired: boolean;
  hasStatePension: boolean;
};

type Plan = {
  id: string;
  name: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
  input: QuickStartInput | null;
  assumptions: Assumptions;
};
```

---

## Business Logic

### `computeAnnualContribution(annualIncome, contributionRate) → number`
- Returns `annualIncome × contributionRate`.
- Returns 0 for non-positive or non-finite `annualIncome`.
- Returns 0 for negative `contributionRate`.

### `computeAnnualWithdrawal(annualIncome, statePension) → number`
- Returns `max(0, annualIncome × 2/3 − max(0, statePension))`.
- Returns 0 for non-positive or non-finite `annualIncome`.

### `projectSavings(input, assumptions) → ProjectionDataPoint[]`
- See Acceptance Criteria §15–21 for the full contract.

### `getBalanceAtRetirement(input, assumptions) → number`
- Returns the balance from `projectSavings` at `input.retirementAge`, or 0 if not found.

### `isFundingSufficient(input, assumptions) → boolean`
- Returns `true` if the last `ProjectionDataPoint` has `balance > 0`.

### Formatting utilities (`src/lib/formatting.ts`)
- `formatCurrency(value, locale, currency)` — full integer currency via `Intl`.
- `formatCurrencyCompact(value, locale, currency)` — compact notation (e.g. £1.2M).
- `formatPercentage(value, locale, decimalPlaces)` — e.g. 0.025 → "2.5%".
- `formatNumber(value, locale, maximumFractionDigits)` — plain number formatting.

---

## UI / UX

### Component Tree

```
src/app/page.tsx  ("use client")
├── Header
├── QuickStartWizard
│   ├── QuickStartForm         (form view)
│   └── ProjectionChart        (chart view, shown after submit)
├── PlanManager                (sidebar)
└── AssumptionsPanel           (sidebar)
```

### Layout

Two-column on `lg` screens: main projection area left, sidebar (PlanManager + AssumptionsPanel) right. Single-column stacked on smaller screens.

### Interactions

1. On first load: form is shown; the assumptions panel and plan manager show default state.
2. User fills form and clicks "Show My Projection" → chart renders.
3. Clicking "Edit Inputs" returns to pre-filled form.
4. Dragging an assumption slider → chart re-renders immediately (controlled via React state, no debounce needed at this scale).
5. Plan create/rename/duplicate/delete → localStorage updated; active plan shown in the form/chart.

---

## Non-Functional Requirements

- **Performance:** Chart must re-render within one frame of a slider change (no async work needed — all calculations are synchronous).
- **Privacy:** No data leaves the browser. No analytics, no tracking, no server calls.
- **Locale:** All strings, currency symbols, and number formats through `src/locales/`. UK (en-GB) is the default.
- **Accessibility:** WCAG 2.1 AA for interactive controls (form labels, error messages, slider labels, keyboard-accessible tooltips).
- **Static export:** No server-side APIs. Compatible with `output: "export"` in `next.config.ts`.

---

## Out of Scope

The following are explicitly **not** part of this spec:

- Monte Carlo simulation (Epic 2)
- Detailed income streams (salary, ISA, SIPP breakdown) — covered in a later epic
- Per-category expense inflation
- US locale implementation (architecture is in place; strings are `en-GB` only for now)
- Export / print / share functionality
- Mobile-native PWA features
