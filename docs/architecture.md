# Architecture

Financial Planner is a statically-exported Next.js application. All financial computation
happens client-side in the browser. There is no server, no database, and no account linking.

## Design Principles

1. **Spec-driven** — every feature starts as a spec in `specs/`. See `specs/README.md`.
2. **Pure logic layer** — all financial calculations in `src/lib/` are pure functions with
   no side effects. Extensively unit-tested.
3. **UK-first locale** — user-facing strings, currency, and dates go through `src/locales/`.
   No hardcoded `£` in components.
4. **Client-side only** — privacy-first; no data leaves the browser.
5. **Static export** — deployed to GitHub Pages. No runtime Node.js server.

## Folder Structure

```
src/
├── app/              # Next.js App Router — pages and layouts only
├── components/       # React UI components, grouped by feature domain
├── hooks/            # Custom React hooks (use<Name> convention)
├── lib/              # Pure business logic (no React, no DOM)
│   ├── calculations.ts   # Projection, withdrawal, and contribution calculations
│   ├── defaults.ts       # UK-default assumption values
│   ├── plans.ts          # Plan CRUD, serialisation, and migration helpers
│   └── monte-carlo.ts    # Monte Carlo simulation engine (planned)
├── locales/          # Locale strings and formatting (en-GB default, en-US variant)
└── types/
    └── index.ts      # Shared TypeScript types (Plan, Assumptions, etc.)
```

## Data Flow

```
User Input
    │
    ▼
React Component  ──►  Custom Hook (src/hooks/)
                            │
                            ▼
                      src/lib/ (pure functions)
                      ┌─────────────────────────────────┐
                      │ calculations.ts                  │
                      │   projectSavings()               │
                      │   computeAnnualWithdrawal()      │
                      │   computeAnnualContribution()    │
                      └──────────────┬──────────────────┘
                                     │
                            ProjectionDataPoint[]
                                     │
                             ◄───────┘
                      React State / Recharts
```

## Key Types

| Type | Location | Purpose |
|------|----------|---------|
| `Assumptions` | `src/types/index.ts` | All configurable planning parameters |
| `QuickStartInput` | `src/types/index.ts` | User-supplied values (age, income, savings) |
| `ProjectionDataPoint` | `src/types/index.ts` | Single year in a savings projection |
| `Plan` | `src/types/index.ts` | A saved plan (input + assumptions + metadata) |

## Persistence

Plans are persisted in `localStorage` as JSON via `serializePlans()` / `deserializePlans()`
in `src/lib/plans.ts`. On deserialisation, `UK_DEFAULTS` is spread before the stored
assumptions so that plans saved before a new assumption field was added receive the correct
default value automatically (forward-compatible migration pattern).

## Projection Model

`projectSavings(input, assumptions)` produces a year-by-year `ProjectionDataPoint[]` from
`currentAge` to `lifeExpectancy`.

- **Accumulation phase** (`age < retirementAge`): balance grows at `investmentReturn` and
  receives `annualContributionRate × annualIncome` each year.
- **Drawdown phase** (`age >= retirementAge`): balance is reduced by the inflation-adjusted
  annual withdrawal needed from the portfolio. Withdrawal =
  `max(0, inflatedIncome × incomeReplacementRatio − inflatedStatePension)`.
  State pension is only subtracted once `age >= statePensionAge`.

See `docs/glossary.md` for term definitions.
