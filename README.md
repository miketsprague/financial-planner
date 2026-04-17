# Financial Planner

A personal financial planning application built entirely through **agentic development workflows** using GitHub's native stack (Copilot Cloud Agent, Actions, Spec-Driven Development).

> 🚧 **This project is under active development.** See [PLAN.md](PLAN.md) for the full roadmap.

## What This Is

**Two things at once:**

1. **A useful financial planning tool** — compound interest, Monte Carlo simulation, inflation adjustment, scenario comparison (UK-first with locale architecture for US support)
2. **A showcase of cutting-edge agentic development** — adversarial multi-agent review, spec-driven development, project memory, automated maintenance

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS
- **Charts:** Recharts
- **Testing:** Vitest + React Testing Library
- **Deployment:** GitHub Pages (static export)
- **CI/CD:** GitHub Actions
- **Agent:** GitHub Copilot Cloud Agent (CCA)

## Development

```bash
npm install
npm run dev          # Start dev server
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run)
npm run build        # Production build
```

## Agentic Patterns Demonstrated

| Pattern | How |
|---------|-----|
| **Spec-Driven Development** | Features start as specs in `specs/`, agents implement from specs |
| **Cloud Agent (CCA)** | Issues assigned to `@copilot` → autonomous PRs |
| **Adversarial Review** | Critic + Security agents challenge implementer's code |
| **Automated Maintenance** | Scheduled workflows for docs, tests, deps, cleanup |
| **Custom Agent Modes** | Specialised personas in `.github/agents/` |

## License

MIT
