<!-- Purpose: build plan for P0 — everything that makes the qm deployment a one-command operation the moment credentials land. -->

# Plan — P0 Deployment-Ready

**Milestone:** README Status "qm deployment live". The deploy itself is credential-gated (RUNBOOK §1, founder/CTO). Gated ≠ blocked: P0 ships everything *around* the gate so the deploy costs one command, not a design session.

## Decisions

1. **Scopes are data, not prose.** The deploy layer currently names scopes in a table. Replace with `scopes/_template.md` + one file per scope — a new agent becomes one file (ADR-005), same shape as `jobs/_template.md`.
2. **Integration contracts live at `platform/contracts/`, not in skills.** Skills describe process; what Notion/Gmail/Calendar/Slack can do, their exact field names, and their staleness semantics are a contract every pack consumes. Prevents each new department re-deriving the Notion schema.
3. **Crons are deploy-layer config**, not skill content — the watch loop (F9), 08:30 standup, Monday pipeline report, and weekly retro are one table qm compiles, so a new agent's schedule is a row.
4. **The gate ledger is a living file** (`docs/gates.md`), not a paragraph re-written into each phase report. Reports link it; it is the single answer to "what is the founder blocking?".
5. **F8 `candidate-status` is a P0 gap, not P1** — PRD §7 lists it and the repo never built it; triage and schedule both hand off to it.

## Build list

| Owner | Files | Notes |
|---|---|---|
| integrator | `platform/contracts/{notion,gmail,calendar,slack}.md`, `.mcp.json`, `platform/deploy-layer/otpless/crons.md`, `platform/deploy-layer/otpless/scopes/{_template.md,recruiter.md}` | No fabricated IDs — `TODO(gate)` placeholders |
| builder | `packs/recruiting/candidate-status/SKILL.md`, `packs/shared/config/goals.md.example`, `packs/recruiting/config/agent.md`, `packs/recruiting/config/goals.md` | Agent public name is a gate → placeholder |
| deployer | `platform/scripts/bootstrap-qm.sh`, `docs/gates.md`, RUNBOOK §2/§4 updates | Staged commands, verification is read-back |
| evaluator | `evals/run.mjs` extensions + fixtures | Structure for new paths, disclosure lint, gate-placeholder check |
| reviewer | fresh review of all of the above | No builder context |
| librarian | `brain/`, `CHANGELOG.md`, README Status | Same commit as the change |

## Evals that prove it

- Structure: every new contract/scope/cron/skill file exists and is referenced by something.
- Lint: AI-disclosure and draft-first present in every candidate-facing skill (not just outreach/reject).
- Never-delegated: the six hard-denied classes appear in command policy and no skill claims to perform one.
- Gate hygiene: no fabricated credential-shaped value; every `TODO(gate)` is listed in `docs/gates.md`.

## Human gates this plan creates

None new. It surfaces the existing RUNBOOK §1 list into `docs/gates.md` and adds the agent-public-name decision as a build-blocking placeholder.
