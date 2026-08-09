# Architecture

Financial Planner is a statically-exported Next.js application. All financial computation
happens client-side in the browser. There is no server, no database, and no account linking.

This document describes the US–UK personal planner model implemented from
`specs/us-uk-personal-planner.spec.md`, which supersedes the earlier quick-start projection engine
(see `docs/project.memory.md` for the migration history).

## Design Principles

1. **Spec-driven** — every feature starts as a spec in `specs/`. See `specs/README.md`.
2. **Pure logic layer** — all financial calculations in `src/lib/` are pure functions with
   no side effects. Extensively unit-tested.
3. **UK-first locale** — user-facing strings, currency, and dates go through `src/locales/`.
   No hardcoded `£`/`$` in components — always via `src/lib/formatting.ts`.
4. **Client-side only** — privacy-first; no data leaves the browser.
5. **Static export** — deployed to GitHub Pages. No runtime Node.js server.

## Folder Structure

```
src/
├── app/              # Next.js App Router — pages and layouts only
├── components/       # React UI components, grouped by feature domain
│   ├── dashboard/        # Metrics, projection chart, insights panel
│   ├── profile/          # Profile section (ages, currency)
│   ├── cash-flow/        # Income/spending section
│   ├── accounts/         # Account CRUD cards
│   ├── goals/            # One-off future goal CRUD cards
│   ├── benefits/          # State Pension / Social Security CRUD cards
│   ├── assumptions/       # Inflation, volatility, FX rate, simulation runs
│   ├── guide/             # Cross-border guide (sourced, dated content)
│   ├── data/              # Export / import / reset controls
│   ├── layout/            # Disclaimer footer
│   └── ui/                # Reusable form fields, SectionCard, ConfirmDialog
├── hooks/            # Custom React hooks (use<Name> convention)
│   ├── usePlanState.ts   # Owns the current Plan; persists on every change
│   └── useProjection.ts  # Memoised deterministic + Monte Carlo projection
├── lib/              # Pure business logic (no React, no DOM)
│   ├── currency.ts       # Amount/rate normalisation, GBP<->USD conversion
│   ├── calculations.ts   # Deterministic year-by-year projection engine
│   ├── monte-carlo.ts    # Seeded Monte Carlo simulation engine
│   ├── insights.ts       # Deterministic plan observations
│   ├── example-plan.ts   # The example plan shown on first use
│   ├── plan-storage.ts   # Versioned envelope: validate, save/load, import/export
│   └── formatting.ts     # Locale-aware Intl.NumberFormat/DateTimeFormat helpers
├── locales/          # Locale strings (en-GB default; en-US falls back to en-GB copy)
└── types/
    └── index.ts      # Shared TypeScript types (Plan, Account, Goal, Benefit, ...)
```

## Data Flow

```
User Input
    │
    ▼
React Component  ──►  usePlanState() (src/hooks/usePlanState.ts)
                            │
                            ▼
                      Plan (src/types/index.ts)
                            │
                 ┌──────────┴───────────┐
                 ▼                      ▼
        useProjection()          src/lib/plan-storage.ts
                 │                (localStorage, versioned envelope)
                 ▼
   ┌─────────────────────────────┐
   │ src/lib/calculations.ts      │
   │   projectPlan()              │──► ProjectionPoint[]
   │ src/lib/monte-carlo.ts       │
   │   runMonteCarloSimulation()  │──► MonteCarloResult
   │ src/lib/insights.ts          │
   │   computeInsights()          │──► Insight[]
   └─────────────────────────────┘
                 │
                 ▼
     Dashboard metrics, chart, insights (React state / Recharts)
```

## Key Types

| Type               | Location             | Purpose                                                                                      |
| ------------------ | -------------------- | -------------------------------------------------------------------------------------------- |
| `Plan`             | `src/types/index.ts` | The complete user-editable plan (profile, cash flow, accounts, goals, benefits, assumptions) |
| `Profile`          | `src/types/index.ts` | Ages, UK residence years, reporting currency                                                 |
| `CashFlow`         | `src/types/index.ts` | Take-home income, current spending, retirement spending                                      |
| `Account`          | `src/types/index.ts` | Name, wrapper type, currency, balance, contribution, return                                  |
| `Goal`             | `src/types/index.ts` | One-off future expense/income at a given age                                                 |
| `Benefit`          | `src/types/index.ts` | UK State Pension / US Social Security / other benefit                                        |
| `Assumptions`      | `src/types/index.ts` | Inflation, return volatility, GBP-per-USD rate, simulation runs                              |
| `ProjectionPoint`  | `src/types/index.ts` | One year of the deterministic projection                                                     |
| `MonteCarloResult` | `src/types/index.ts` | Success probability, percentiles by age, seed, run count                                     |
| `PlanEnvelope`     | `src/types/index.ts` | Versioned `localStorage`/export envelope (`schemaVersion`, `updatedAt`, `plan`)              |

## Persistence

The current plan is persisted in `localStorage` under the dedicated key
`financial-planner:us-uk-plan:v1` as a versioned `PlanEnvelope` (`{ schemaVersion, updatedAt, plan }`)
via `saveStoredPlan()` / `loadStoredPlan()` in `src/lib/plan-storage.ts`. Every field of an imported
or loaded envelope is structurally validated by `isValidPlan()` / `isValidPlanEnvelope()` before use;
invalid or unsupported data is rejected and never partially applied.

The rebuild intentionally uses a **new** `localStorage` key, distinct from the legacy
`financial-planner:plans` array used by the superseded quick-start engine. Legacy data is left
untouched on disk but is never read by the new model — see `docs/project.memory.md`.

Users can export the current plan as a JSON file and import a previously exported file. Imports
are validated the same way as loads from `localStorage`; an invalid file is rejected with an error
message and the current plan is left unchanged.

## Projection Model

`projectPlan(plan)` (`src/lib/calculations.ts`) produces one `ProjectionPoint` per age from
`profile.currentAge` through `profile.planningAge`. For an invalid profile (non-integer/non-finite
ages, ages out of order, or a span over 100 years) it returns an empty array rather than throwing
or producing `NaN`.

Each year, in order:

1. Record opening balances and apply each account's nominal expected return.
2. Compute take-home income (pre-retirement only, flat nominal), inflation-indexed spending
   (current or retirement spending depending on phase), benefit income (grown from its own start
   age and growth rate), and one-off goal flows at that age.
3. If the resulting net cash flow is non-negative, credit planned contributions up to that
   surplus (scaled down proportionally if their total would exceed it) and sweep any remaining
   surplus into the first cash account, or spread it proportionally by balance when there is no
   cash account.
4. If the net cash flow is negative, fund the deficit by withdrawing proportionally from every
   account with a positive balance. Any amount that cannot be funded is recorded as `shortfall`,
   and balances are clamped to zero rather than going negative.

`allocateCashFlow()` implements steps 3–4 as an isolated, independently-tested pure function.

## Monte Carlo Simulation

`runMonteCarloSimulation(plan, seed?)` (`src/lib/monte-carlo.ts`) runs `assumptions.simulationRuns`
paths (bounded 500–5,000) using a deterministic seeded pseudo-random generator (mulberry32 +
Box–Muller). Each path applies one normally-distributed return shock per age — the same shock
applied to every account that year — scaled by `assumptions.returnVolatility` and floored so no
account's effective return goes below -100%. A path succeeds only if every annual closing balance
is greater than zero. Percentiles use the nearest-rank method and always satisfy
`p10 <= p50 <= p90`. With zero volatility every path exactly equals the deterministic projection.
Results include the seed and run count so they are explainable and repeatable in tests.

## Real vs Nominal Values

Stored inputs and all projection arithmetic are nominal. `todaysMoneyValue()` divides a projected
balance by cumulative inflation from the current age purely for display — the dashboard chart's
nominal/today's-money toggle changes presentation only and never re-runs the projection.

## Insights

`computeInsights(plan, monteCarloResult)` (`src/lib/insights.ts`) returns deterministic, factual
observations — not recommendations — covering low success probability, negative current cash
flow, contributions above available surplus, concentrated cash, early pension/retirement-account
access, missing benefit estimates, and cross-border wrapper considerations.
`getAccountConsideration(account)` returns a neutral, per-account PFIC or pension-treaty note for
ISA/UK-taxable and pension account types; the application never decides whether a holding is a
PFIC.

See `docs/glossary.md` for term definitions.
