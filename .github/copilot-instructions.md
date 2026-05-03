# Copilot Instructions — Financial Planner

These instructions apply to all GitHub Copilot interactions in this repository. Follow them strictly.

---

## Project Overview

A UK-first personal financial planning application built with Next.js, TypeScript, and React. It demonstrates cutting-edge agentic development workflows: spec-driven development, adversarial multi-agent review, project memory, and automated maintenance.

---

## Coding Standards

### TypeScript
- **Always use strict TypeScript** — `"strict": true` is set in `tsconfig.json`. Never use `any` unless absolutely unavoidable and explicitly justified with a comment.
- Prefer `type` over `interface` for object shapes unless you need declaration merging.
- Use `satisfies` operator when validating object shapes against a type without widening.
- Prefer `unknown` over `any` for unsafe external data; narrow with type guards.
- Export types explicitly — avoid leaking internal types.
- No implicit `any`, no `@ts-ignore` without an explanatory comment.

### React & Hooks
- Use **functional components only** — no class components.
- Prefer **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`, `useReducer`) over class lifecycle methods.
- Custom hooks live in `src/hooks/` and are named `use<Name>`.
- Keep components small and focused — extract logic into hooks, pure functions into `src/lib/`.
- Never put business logic directly in components; it belongs in `src/lib/`.
- Use `React.memo` and `useMemo`/`useCallback` only where a measurable performance gain exists — do not pre-optimise.
- Prefer controlled components over uncontrolled ones for form inputs.
- Always handle loading, error, and empty states in UI components.

### Next.js App Router
- Use the App Router (`src/app/`) exclusively — no Pages Router.
- Server Components are the default; add `"use client"` only when client-side state or browser APIs are needed.
- Keep `"use client"` boundaries as far down the component tree as possible.
- Use `next/image` for all images and `next/link` for internal navigation.
- Static export (`output: "export"`) is configured — do not use server-side rendering features that require a Node.js server.

### Styling
- Use **Tailwind CSS** utility classes — no CSS modules, no styled-components, no inline styles (except for dynamic values that cannot be expressed as Tailwind classes).
- Follow mobile-first responsive design.
- Avoid magic numbers — use Tailwind's spacing/colour tokens.

---

## Architecture Rules

### Folder Structure
```
src/
├── app/              # Next.js App Router — pages and layouts only
├── components/       # Reusable UI components
│   └── <feature>/    # Feature-specific components grouped by domain
├── hooks/            # Custom React hooks
├── lib/              # Pure business logic (no React, no DOM)
│   ├── calculations.ts
│   ├── monte-carlo.ts
│   └── scenarios.ts
├── locales/          # Locale/i18n layer (UK default, US variant)
│   ├── en-GB/
│   └── en-US/
└── types/            # Shared TypeScript interfaces and types
    └── index.ts
```

### Feature Folders
- Group related components, hooks, and tests by **feature domain** (e.g., `components/compound-interest/`, `components/monte-carlo/`).
- Each feature folder may contain its own `__tests__/` subdirectory.
- Avoid deeply nested imports — prefer barrel exports (`index.ts`) within feature folders.

### Locale / Internationalisation Layer
- This project is **UK-first** but architected for locale variants.
- All user-facing strings, number formatting, currency symbols, and date formats go through the locale layer in `src/locales/`.
- Default locale: `en-GB` — GBP (£), DD/MM/YYYY dates, comma thousands separator.
- Do **not** hardcode "£", "$", currency codes, or date formats in components or business logic.
- Use locale-aware formatting utilities from `src/lib/` rather than `Intl` directly in components.
- Financial assumptions (e.g., ISA allowances, state pension amounts) are UK defaults; US variants are configuration, not code branches.

### Business Logic
- All financial calculations live in `src/lib/` as **pure functions** — no side effects, no React dependencies, no DOM access.
- Functions must be deterministic and fully unit-tested.
- Use `bigint` or scaled integer arithmetic for monetary values if floating-point drift is a concern.

---

## Testing

### Framework
- **Vitest** for unit and integration tests.
- **React Testing Library** (`@testing-library/react`) for component tests.
- **Playwright** for end-to-end tests in `e2e/`.

### Conventions
- Test files are co-located with source: `src/lib/calculations.test.ts` or inside `__tests__/` subdirectories.
- Use **descriptive test names** — `it("returns 0 when principal is 0", ...)` not `it("works", ...)`.
- Follow the **Arrange–Act–Assert** pattern.
- Mock only what is necessary. Prefer testing real implementations.
- Aim for **100% branch coverage** on `src/lib/` (pure functions).
- Do **not** test implementation details — test behaviour and output.
- Every new feature must ship with tests. PRs without tests for new logic will be rejected.

---

## PR Conventions

- **One PR per feature or fix** — keep scope small and reviewable.
- PR title format: `<type>(<scope>): <short description>` — e.g., `feat(calculations): add inflation-adjusted withdrawal projection`.
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`.
- PR description must include:
  - What changed and why.
  - Link to the spec or issue being implemented.
  - How to test the change manually.
  - Checklist: lint ✅, typecheck ✅, tests ✅, build ✅.
- All CI checks must pass before merge.
- At least one human approval is required for merge to `main`.
- Squash merges only — keep `main` history clean.

---

## UK-First Guidance

- Default currency: **GBP (£)**. Default locale: `en-GB`.
- Financial products: **ISA**, **SIPP**, **state pension** (not 401k, IRA, Social Security).
- Use UK terminology: "portfolio", "drawdown", "income", "tax year" (April–March).
- Tax rules: UK income tax bands, National Insurance, capital gains tax (CGT) allowances — use current HMRC figures, clearly dated in the source.
- All monetary defaults and examples use GBP unless a US locale is explicitly selected.
- Dates: DD/MM/YYYY in UI. ISO 8601 (`YYYY-MM-DD`) in data models and APIs.

---

## Agent Behaviour Notes

- Read `AGENTS.md` in the repo root for project overview and command reference.
- Read `specs/` before implementing any feature — specs are the source of truth.
- Read `docs/architecture.md` and `docs/glossary.md` to understand domain terminology.
- After implementing a feature, check `docs/project.context.md` to see if it needs updating.
- Do not modify files in `docs/decisions/` — ADRs are immutable once merged.
- Run `npm run lint && npm run typecheck && npm run test:run` before marking a task complete.

### Specialised Agent Modes

When invoked in a specific agent mode, load and follow the corresponding persona file:

| Mode | Persona File | When to Use |
|------|-------------|-------------|
| Implement | `.github/agents/implement.agent.md` | Writing code from a spec |
| Critic | `.github/agents/critic.agent.md` | Reviewing a PR for logic/spec issues |
| Security | `.github/agents/security.agent.md` | Reviewing a PR for security vulnerabilities |
| Docs | `.github/agents/docs.agent.md` | Updating documentation after code changes |
| TDD | `.github/agents/tdd.agent.md` | Test-driven development workflow |
| QA Bot | `.github/agents/qa.agent.md` | Browser testing with Playwright on a PR |
