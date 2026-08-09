# Financial Planner

A personal financial planning application built entirely through **agentic development workflows** using GitHub's native stack (Copilot Cloud Agent, Actions, Spec-Driven Development).

## What This Is

**Two things at once:**

1. **A useful US–UK cross-border planning tool** — one private plan covering UK and US accounts,
   income, spending, one-off goals, State Pension and Social Security, a deterministic year-by-year
   projection, and a seeded Monte Carlo simulation with success probability and percentile ranges.
2. **A showcase of cutting-edge agentic development** — adversarial multi-agent review, spec-driven
   development, project memory, and automated maintenance.

See [`specs/us-uk-personal-planner.spec.md`](specs/us-uk-personal-planner.spec.md) for the full
feature specification that this application implements.

## Who This Is For

A US citizen living in the UK (or anyone with accounts and benefits in both countries) who wants:

- All UK and US accounts, income, spending, and one-off goals in a single private plan.
- A baseline forecast plus a Monte Carlo range of uncertain outcomes.
- Educational, sourced reminders about FBAR/FATCA, PFIC, pension treaty treatment, Social Security
  totalisation, and the UK long-term-residence inheritance-tax milestone.
- Data that stays in the browser and is portable as a JSON file — no accounts, no server, no
  analytics.

This is educational software, not a tax return, regulated recommendation, or replacement for a
cross-border professional. See the in-app disclaimer, always visible in the page footer.

## Tech Stack

- **Framework:** Next.js (App Router, static export) + TypeScript (strict) + Tailwind CSS
- **Charts:** Recharts
- **Testing:** Vitest + React Testing Library + Playwright
- **Deployment:** GitHub Pages (static export)
- **CI/CD:** GitHub Actions
- **Agent:** GitHub Copilot Cloud Agent (CCA)

## Development

```bash
npm install
npm run dev            # Start dev server
npm run lint           # ESLint
npm run typecheck      # TypeScript check
npm run test           # Vitest (watch mode)
npm run test:run       # Vitest (single run)
npm run test:coverage  # Vitest with coverage report
npm run build          # Production build (static export to /out)
npm run format         # Prettier write
npm run format:check   # Prettier check
```

Before marking any task done, run:

```bash
npm run lint && npm run typecheck && npm run test:run
```

## Core Model

- **Profile, cash flow, accounts, goals, benefits, assumptions** — see
  `specs/us-uk-personal-planner.spec.md` for the full data model and business logic.
- **Pure calculation engine** — `src/lib/calculations.ts` (deterministic projection),
  `src/lib/monte-carlo.ts` (seeded Monte Carlo simulation), `src/lib/insights.ts` (deterministic
  plan observations). All financial logic is pure, side-effect-free, and unit-tested.
- **Local-only persistence** — the plan is saved to `localStorage` as a versioned envelope
  (`src/lib/plan-storage.ts`) and can be exported/imported as JSON. No plan data is ever
  transmitted and no analytics are loaded.
- **Locale layer** — all user-facing strings and number/currency formatting go through
  `src/locales/` and `src/lib/formatting.ts`. UK English interface copy is the default, while US
  product and filing names (401(k), IRA, Social Security, PFIC, FBAR) are always retained.

See [`docs/architecture.md`](docs/architecture.md) and [`docs/glossary.md`](docs/glossary.md) for
more detail.

## Agentic Patterns Demonstrated

| Pattern                     | How                                                              |
| --------------------------- | ---------------------------------------------------------------- |
| **Spec-Driven Development** | Features start as specs in `specs/`, agents implement from specs |
| **Cloud Agent (CCA)**       | Issues assigned to `@copilot` → autonomous PRs                   |
| **Adversarial Review**      | Critic + Security agents challenge implementer's code            |
| **Automated Maintenance**   | Scheduled workflows for docs, tests, deps, cleanup               |
| **Custom Agent Modes**      | Specialised personas in `.github/agents/`                        |

## License

MIT
