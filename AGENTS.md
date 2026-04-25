# AGENTS.md — Financial Planner

Root-level instructions for all AI coding agents (GitHub Copilot, Claude Code, OpenAI Codex, etc.) working in this repository.

Read this file first. Then read `.github/copilot-instructions.md` for detailed coding standards.

---

## Project Overview

**Financial Planner** is a UK-first personal financial planning web application that also serves as a showcase for agentic development workflows.

- **What it does:** Compound interest projection, inflation adjustment, Monte Carlo simulation, scenario comparison — all client-side, privacy-first.
- **Who it's for:** UK users (GBP, ISAs, SIPPs, state pension) with locale architecture for future US support.
- **How it's built:** Exclusively through agentic workflows — spec-driven development, multi-agent adversarial review, automated maintenance.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Testing | Vitest + React Testing Library + Playwright |
| CI/CD | GitHub Actions |
| Deployment | GitHub Pages |

---

## Commands

Run these from the repository root after `npm install`:

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build (static export to /out)
npm run lint         # ESLint
npm run typecheck    # TypeScript type check (no emit)
npm run test         # Vitest in watch mode
npm run test:run     # Vitest single run (use in CI)
npm run test:coverage # Vitest with coverage report
npm run format       # Prettier write
npm run format:check # Prettier check (use in CI)
```

**Before marking any task done, run:**
```bash
npm run lint && npm run typecheck && npm run test:run
```

---

## Repository Structure

```
financial-planner/
├── .github/
│   ├── copilot-instructions.md   # Detailed coding standards — READ THIS
│   ├── workflows/                # CI, deploy, maintenance workflows
│   ├── agents/                   # Specialised agent personas
│   │   ├── implement.agent.md
│   │   ├── critic.agent.md
│   │   ├── security.agent.md
│   │   ├── docs.agent.md
│   │   └── tdd.agent.md
│   ├── prompts/                  # Reusable prompt templates
│   └── ISSUE_TEMPLATE/           # GitHub issue templates
├── docs/
│   ├── architecture.md           # System design and component relationships
│   ├── tech-stack.md             # Framework choices and rationale
│   ├── glossary.md               # Domain terminology
│   ├── project.context.md        # Current goals and active work
│   ├── project.memory.md         # Past decisions and lessons learned
│   └── decisions/                # Architecture Decision Records (ADRs)
├── specs/                        # Feature specifications (source of truth)
│   └── README.md
├── src/
│   ├── app/                      # Next.js App Router pages and layouts
│   ├── components/               # React components (grouped by feature)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Pure business logic (no React/DOM)
│   │   ├── calculations.ts       # Compound interest, projections, inflation
│   │   ├── monte-carlo.ts        # Monte Carlo simulation engine
│   │   └── scenarios.ts          # Scenario comparison logic
│   ├── locales/                  # Locale layer (en-GB default, en-US variant)
│   └── types/                    # Shared TypeScript types
│       └── index.ts
├── e2e/                          # Playwright end-to-end tests
├── AGENTS.md                     # This file
├── PLAN.md                       # Project roadmap
└── README.md                     # Public-facing readme
```

---

## Architecture Summary

### Design Principles
1. **Spec-driven** — every feature starts as a spec in `specs/`. Agents implement from specs, not from vague instructions.
2. **Pure logic layer** — all financial calculations in `src/lib/` are pure functions with no side effects. Extensively tested.
3. **UK-first locale** — user-facing strings, currency, and dates go through `src/locales/`. No hardcoded "£" in components.
4. **Client-side only** — no server, no database, no account linking. Privacy-first.
5. **Static export** — deployed to GitHub Pages. No runtime Node.js server.

### Data Flow
```
User Input → React Component → Custom Hook → src/lib/ (pure calculation) → State → Recharts
```

### Multi-Agent Workflow
```
Issue → Planner Agent (spec) → Implementer Agent (code + tests) → Critic + Security Agents (review) → Human approval → Merge
```

---

## Specialised Agent Roles

| Agent | File | Role |
|-------|------|------|
| Implementer | `.github/agents/implement.agent.md` | Reads specs, writes code + tests |
| Critic | `.github/agents/critic.agent.md` | Adversarial reviewer — read-only |
| Security Auditor | `.github/agents/security.agent.md` | OWASP/vulnerability review — read-only |
| Docs Writer | `.github/agents/docs.agent.md` | Updates docs after code changes |
| TDD Enforcer | `.github/agents/tdd.agent.md` | Failing test first, then implementation |

When working in a specific mode, load the corresponding agent file for specialised instructions.

---

## Key Conventions

- **No `any` in TypeScript** — use `unknown` and narrow with type guards.
- **No hardcoded locale strings** — use the locale layer.
- **No business logic in components** — keep it in `src/lib/`.
- **Tests are mandatory** — new logic without tests will be rejected.
- **Specs are the source of truth** — if code and spec disagree, the spec wins (raise it as an issue).
- **UK defaults** — GBP, en-GB, ISA/SIPP, DD/MM/YYYY, April–March tax year.

---

## Gotchas & Known Constraints

- `next.config.ts` sets `output: "export"` — dynamic routes require `generateStaticParams`.
- No server-side APIs — all data is ephemeral in client state or `localStorage`.
- Vitest uses `happy-dom` as the test environment (see `vitest.config.ts`).
- Playwright tests are in `e2e/` — run separately with `npx playwright test`.
- Tailwind v4 — configuration syntax differs from v3; see Tailwind v4 docs.
