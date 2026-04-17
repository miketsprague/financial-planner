# Financial Planner — Agentic Development Sample Project

A personal financial planning application built entirely through **agentic development workflows** using GitHub's native stack. This project serves dual purposes:

1. **A useful tool** — long-term financial planning with compound interest, inflation adjustment, Monte Carlo simulation, and scenario comparison
2. **A showcase** — demonstrating cutting-edge cloud agent patterns including Spec-Driven Development, adversarial multi-agent review, project memory, and automated maintenance workflows

---

## Project Plan

### Phase 1: Agent-Ready Repository Scaffolding

Set up the complete GitHub agentic infrastructure before writing any application code. The repo itself is the first deliverable.

**1.1 Copilot Cloud Agent Environment**
- `copilot-setup-steps.yml` — Node.js 20, npm ci, build, so CCA can run tests/lint
- CI pipeline (`ci.yml`) — lint, typecheck, test, build on all PRs
- Branch protection on `main` requiring CI pass + human approval

**1.2 Custom Instructions & Agent Personas**
- `.github/copilot-instructions.md` — coding standards, architecture rules, testing requirements
- `AGENTS.md` — root-level instructions for multi-agent tools

**1.3 Agent Modes (Separation of Concerns)**

| Agent Mode | File | Role |
|------------|------|------|
| Planner | `.github/agents/plan.agent.md` | Reads issues, writes specs in `specs/`. Never writes code. |
| Implementer | `.github/agents/implement.agent.md` | Reads specs, writes code + tests. Follows instructions strictly. |
| Critic | `.github/agents/critic.agent.md` | Reviews PRs for logic flaws, missed edge cases, spec compliance. Adversarial — looks for problems. |
| Security Auditor | `.github/agents/security.agent.md` | Reviews code for vulnerabilities: injection, auth bypass, data exposure, secrets. Thinks like an attacker. |
| Docs Writer | `.github/agents/docs.agent.md` | Updates README, API docs, and inline documentation after code changes. |

**1.4 Prompt Templates**
- `implement-from-spec.prompt.md` — implement a feature from its spec
- `write-tests.prompt.md` — generate tests for existing code
- `security-review.prompt.md` — adversarial security review
- `update-docs.prompt.md` — sync documentation with code changes

**1.5 Issue Templates (Agent-Optimized)**
- `copilot-task.yml` — well-scoped task with acceptance criteria, auto-assigns to `@copilot`
- `feature-request.yml` — for planning agent to convert into specs
- `bug-report.yml` — structured for agent triage

**1.6 MCP Server Configuration**
- `.vscode/mcp.json` — GitHub MCP server for context, filesystem access

---

### Phase 2: Project Memory & Knowledge Structure

Persistent context files that make agents smarter over time. These are living documents updated as the project evolves.

**2.1 Architecture Context**
- `docs/architecture.md` — system design, component relationships, data flow
- `docs/tech-stack.md` — framework choices and rationale

**2.2 Project Memory**
- `docs/project.context.md` — current goals, active work, what's in progress
- `docs/project.memory.md` — past decisions, lessons learned, rejected approaches
- `docs/glossary.md` — domain terminology (e.g., "Monte Carlo simulation", "real vs nominal returns", "safe withdrawal rate") so agents use terms correctly

**2.3 Architecture Decision Records (ADRs)**
- `docs/decisions/001-framework-next-react-typescript.md`
- `docs/decisions/002-calculation-engine-client-side.md`
- `docs/decisions/003-no-account-linking-privacy-first.md`
- Template: `docs/decisions/TEMPLATE.md`

**2.4 Specs Directory**
- `specs/README.md` — how to write specs, what good specs look like
- Feature specs added in Phase 3+

---

### Phase 3: Application Foundation (via Agent)

The actual app, built primarily by assigning issues to `@copilot` using the infrastructure from Phases 1–2.

**3.1 Next.js + TypeScript Setup**
- App Router, Tailwind CSS, Vitest, React Testing Library
- Feature-based folder structure under `src/`

**3.2 Core Calculation Engine** (`src/lib/calculations.ts`)
- Compound interest / future value
- Inflation adjustment (general + per-category)
- Year-by-year balance projection (accumulation + withdrawal)
- All pure functions, extensively tested

**3.3 Monte Carlo Simulation Engine** (`src/lib/monte-carlo.ts`)
- Configurable return distributions (normal, log-normal)
- 10,000-run simulation with percentile outputs
- Success rate calculation
- Designed for Web Workers (non-blocking UI)

**3.4 Data Model** (`src/types/`)
- Plan, Account, IncomeStream, Expense, LifeEvent, Assumptions interfaces
- Scenario comparison support (multiple plans)

---

### Phase 4: UI & Visualization (via Agent)

**4.1 Input Forms**
- Current age, retirement age, life expectancy
- Accounts with balances and contribution rates
- Income streams (salary, Social Security, pension)
- Expenses with per-category inflation
- Life events (home purchase, college, inheritance)

**4.2 Projection Charts**
- Year-by-year balance chart with Monte Carlo probability bands (10th/25th/50th/75th/90th percentile)
- Nominal vs. inflation-adjusted toggle
- Interactive: hover for year details

**4.3 Scenario Comparison**
- Save multiple plans, compare side-by-side
- "What if I retire at 60 vs 65?" visualization

---

### Phase 5: Adversarial Agent Workflows

Exercise the multi-role agent patterns — the most interesting part of the demo.

**5.1 Doer → Critic → Tester Pipeline**
- Implementer agent writes code from spec
- Critic agent reviews the PR (separate invocation) — looks for logic flaws, missed edge cases, spec violations
- Security agent reviews for vulnerabilities
- Human makes final merge decision

**5.2 Red Team / Blue Team**
- Security agent tries to find exploits in the calculation engine or input handling
- Implementer agent fixes issues found
- Iterate until security agent finds no further issues

**5.3 Documentation Agent Pipeline**
- After any feature merge, docs agent reviews changes and updates:
  - README feature list
  - API documentation
  - Architecture docs if structure changed
  - Glossary if new terms introduced

---

### Phase 6: Automated Maintenance Workflows

Scheduled and event-driven agent tasks for ongoing project health.

**6.1 Dependency Health** (weekly)
- GitHub Actions workflow creates an issue when Dependabot PRs need triage
- Agent reviews dependency changes for breaking risk

**6.2 Test Gap Analysis** (weekly)
- Agent scans for uncovered code paths
- Opens issues for missing tests, assigns to `@copilot`

**6.3 Documentation Freshness** (on merge to main)
- Agent checks if docs are out of sync with code
- Opens PR to update if needed

**6.4 Tech Debt Cleanup** (monthly)
- Agent identifies: unused exports, `any` types, missing error handling, dead code
- Opens focused cleanup issues

**6.5 Changelog & Release Notes** (on tag)
- Agent reads merged PRs since last release
- Generates CHANGELOG.md entry

---

### Phase 7: Polish & Showcase

**7.1 README as Demo Guide**
- Explain each agentic pattern with links to the actual agent files, issues, and PRs that demonstrate them
- "Try it yourself" section showing how to fork and assign issues to `@copilot`

**7.2 Blog-Worthy Examples**
- Curate 3–5 "best of" agent PRs showing the full lifecycle
- Screenshot/link the adversarial review threads

---

## Repository Structure (Target)

```
financial-planner/
├── .github/
│   ├── copilot-instructions.md
│   ├── workflows/
│   │   ├── copilot-setup-steps.yml
│   │   ├── ci.yml
│   │   ├── maintenance-weekly.yml
│   │   └── docs-sync.yml
│   ├── agents/
│   │   ├── plan.agent.md
│   │   ├── implement.agent.md
│   │   ├── critic.agent.md
│   │   ├── security.agent.md
│   │   └── docs.agent.md
│   ├── prompts/
│   │   ├── implement-from-spec.prompt.md
│   │   ├── write-tests.prompt.md
│   │   ├── security-review.prompt.md
│   │   └── update-docs.prompt.md
│   └── ISSUE_TEMPLATE/
│       ├── copilot-task.yml
│       ├── feature-request.yml
│       └── bug-report.yml
├── .vscode/
│   └── mcp.json
├── specs/
│   ├── README.md
│   ├── compound-interest-calculator.spec.md
│   ├── monte-carlo-engine.spec.md
│   ├── scenario-comparison.spec.md
│   └── ...
├── docs/
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── project.context.md
│   ├── project.memory.md
│   ├── glossary.md
│   └── decisions/
│       ├── TEMPLATE.md
│       └── 001-framework-next-react-typescript.md
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Business logic
│   │   ├── calculations.ts
│   │   ├── monte-carlo.ts
│   │   └── scenarios.ts
│   └── types/                  # TypeScript interfaces
│       └── index.ts
├── tests/
├── AGENTS.md
├── package.json
├── tsconfig.json
└── README.md
```

---

## Key Principles

1. **Agents build the app, humans curate the specs and review the output** — the project demonstrates that the human role shifts to specification, review, and orchestration
2. **Adversarial agents improve quality** — the critic and security agents catch issues the implementer misses, just like a real team
3. **Memory makes agents smarter over time** — context files, ADRs, and glossaries reduce hallucination and rework
4. **Maintenance is automated** — docs, tests, deps, and cleanup run on schedule, not on human willpower
5. **Everything is transparent** — every agent action is visible in issues, PRs, and Actions logs
