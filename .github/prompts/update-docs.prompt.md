---
mode: agent
tools:
  - read_file
  - write_file
  - create_file
  - search_files
  - list_dir
description: >
  Review recent code changes and update README, docs/, and the glossary to
  match the current state of the codebase.
---

Review recent changes to the codebase and update all documentation to match.

## Your Workflow

1. **Read context first:**
   - `AGENTS.md` — project overview and structure
   - `.github/copilot-instructions.md` — project conventions and architecture rules
   - The merged PR description and any linked spec to understand the intent of the change

2. **Identify what changed:**
   - Use `git log --oneline -20` or review the PR diff to find recently modified files
   - Note new features, removed functionality, changed APIs, new types, and new dependencies

3. **Update each affected document** (see scope below)

4. **Validate your updates:**
   - Every claim in the updated docs must match the current code exactly
   - Do not describe planned or future work in current-state docs (use `project.context.md` for that)

## Documents to Review and Update

### `README.md`
Update when a new feature is added, the tech stack changes, new commands are available, or the deployment setup changes.
- Keep it concise — README is for first-time visitors
- Link to `docs/` for deeper explanations rather than expanding inline
- Use present tense: "The app supports…" not "Added support for…"

### `docs/architecture.md`
Update when new components, modules, or layers are added; data flow changes; a new design pattern is introduced; or the folder structure changes.
- Describe *what exists now*, not what was planned
- Include or update diagrams and ASCII art for data flows and component relationships
- Reference ADRs (`docs/decisions/`) for *why* decisions were made, not in this file

### `docs/glossary.md`
Update when new domain terms appear in code (new TypeScript types, new financial concepts) or existing terms are redefined.
- Every entry must have a plain-English definition
- Include the TypeScript type name when a term maps directly to a type
- Flag UK-specific terms (ISA, SIPP, drawdown) with a 🇬🇧 marker
- Note US equivalents where they exist

### `docs/project.context.md`
Update when a feature moves from "in progress" to "complete", new active work begins, or project goals evolve.
- This is a living document — update it with every meaningful change
- Include: current milestone, what's in progress, what's blocked, what's next
- Keep it short — it is for quick orientation, not deep documentation

### `docs/project.memory.md`
Update when a significant decision is made that doesn't warrant a full ADR, a problem is solved and the lesson is worth recording, or an approach is rejected after investigation.
- Write for future agents and developers who weren't present
- Include the date of each new entry
- Be honest about failed approaches — they are as valuable as successes

### `docs/tech-stack.md`
Update when a new library or tool is added, a library is upgraded to a new major version, or a technology decision changes.
- Include version numbers for all technologies
- Link to the relevant ADR for major decisions

### Inline Code Documentation
Review when new public functions or hooks are added without JSDoc, or complex algorithms are added or changed.
- Add JSDoc to all exported functions in `src/lib/` — include `@param`, `@returns`, and a description
- For complex algorithms (Monte Carlo, projection logic), add an inline comment explaining the mathematical formula
- Do not add JSDoc to trivial getters/setters or self-evident wrappers

## Rules

- Do **not** modify `docs/decisions/` — ADRs are immutable once merged
- Do **not** rewrite documentation that is still accurate — only update what has changed
- Do **not** add speculation or future plans to current-state docs
- Do **not** change any source code — your role is documentation only
- Do **not** pad documentation with obvious or redundant information

## Definition of Done

- [ ] All docs files affected by the recent changes are reviewed
- [ ] Inaccurate or stale content is updated to reflect the current codebase
- [ ] New features, types, and terms are documented
- [ ] `docs/project.context.md` reflects the current project state
- [ ] Inline JSDoc is present for all new exported `src/lib/` functions
- [ ] The PR description lists which docs changed and why
