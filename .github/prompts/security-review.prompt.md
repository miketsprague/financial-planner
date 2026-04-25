---
mode: agent
tools:
  - read_file
  - search_files
  - list_dir
description: >
  Review code for security vulnerabilities. Thinks like an attacker and reports
  all findings with severity, attack scenario, and remediation guidance.
---

Review the code for security vulnerabilities. Think like an attacker. Report every finding with its severity.

## Context

This is a **client-side-only** financial planning application:
- No backend server, no database, no authentication
- User data lives in client state and `localStorage`
- Deployed as a static site on GitHub Pages
- Handles sensitive financial data: account balances, income, retirement projections

Read `AGENTS.md` and `.github/copilot-instructions.md` before starting. Understand the data model in `src/types/` so you know exactly what sensitive data exists.

## Scope

If a specific file or component was provided, focus your review there. Otherwise, review the full `src/` directory.

## OWASP Top 10 Checklist (Client-Side Adapted)

Work through each category systematically:

### A01 — Broken Access Control
- Is sensitive financial data in `localStorage` readable by injected scripts?
- Do any URL parameters expose plan data without the user's explicit intent?
- Is there any debug or admin functionality accessible to regular users?

### A02 — Cryptographic Failures
- Is sensitive data transmitted unencrypted? (Must be HTTPS only.)
- Is any financial data logged to the browser console or analytics?
- Is data stored in `localStorage` in plain text? (Note the browser-extension risk.)

### A03 — Injection
- Is any user input rendered as raw HTML via `dangerouslySetInnerHTML`? Is it sanitised?
- Are there any `eval()` or `new Function()` calls using user-supplied data?
- Are URL fragments or query parameters used in a way that could cause DOM-based XSS?

### A04 — Insecure Design
- Does the app fail safely with malformed or extreme input values?
- Are financial calculations resilient to adversarial inputs: negative ages, rates > 100%, `NaN`, `Infinity`?
- Is there a disclosure about what data is stored locally?

### A05 — Security Misconfiguration
- Is `Content-Security-Policy` configured for the static site?
- Are there hardcoded API keys, tokens, or secrets in source files, `.env`, or CI config?
- Are development-only features (debug panels, verbose errors) disabled in production builds?

### A06 — Vulnerable and Outdated Components
- Do any dependencies have known CVEs? (Check `package.json` against GitHub Advisory Database.)
- Are packages loaded from external CDNs without Subresource Integrity (SRI) hashes?
- Are there `npm audit` findings in the current dependency tree?

### A07 — Identification and Authentication Failures
- Flag immediately if any authentication is ever added without a dedicated security review.

### A08 — Software and Data Integrity Failures
- Are GitHub Actions workflows pinned to specific commit SHAs, not floating tags like `@v4`?
- Are there any `postinstall` scripts from third-party packages that could execute arbitrary code?
- Is the CI pipeline protected against script injection via issue or PR titles?

### A09 — Security Logging and Monitoring Failures
- Are errors silently swallowed? Could a failed calculation produce a wrong result silently?
- Is sensitive financial data present in error messages or logs?

### A10 — Server-Side Request Forgery (SSRF)
- Flag immediately if any server component or API route is ever added.

## Input Validation

For every user-controlled input (form fields, URL parameters, `localStorage` reads):
- Is the type validated (number vs string)?
- Are numeric bounds checked (non-negative, within realistic ranges)?
- Is input validated before being passed to financial calculations?
- Is there protection against extreme values that could cause performance issues or infinite loops?

## How to Report

For each finding, report:

1. **File and line** (or function/component name)
2. **OWASP category** (e.g., A03-Injection)
3. **Severity** — one of:
   - `critical` — exploitable right now with no user interaction
   - `high` — likely exploitable with minimal attacker effort
   - `medium` — exploitable under specific conditions
   - `low` — defence-in-depth improvement
   - `informational` — worth noting, but not a direct risk
4. **Attack scenario** — how would an attacker exploit this in practice?
5. **Remediation** — describe the fix conceptually (do not write the code)

## Rules

- Do not raise false positives — every finding must be specific and realistic
- Do not inflate severity; label `informational` only when it provides genuine value.
- Do not modify any source files — this is a read-only review
- Do not approve changes with `critical` or `high` severity findings unresolved
