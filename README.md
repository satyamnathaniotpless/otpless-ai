# OTPLESS AI Workforce Platform

The custom agent harness and agent workforce for OTPLESS. One platform, hundreds of scoped agents over time, organized like a company: departments → agents → skills → config. HR/People is department #1 (greenfield, urgent, high-volume); the Recruiter agent is employee #1.

**This is permanent infrastructure.** The current 7-hire sprint is the commissioning run. The platform's product is: any new role, workflow, or department becomes a config change plus a skill pack — never a new system.

## Architecture in one line

```
Humans (judgment) → qm harness (24×7, self-hosted, Slack+web) → Agent scopes (identity, memory, goals, trust level) → Skill packs (git) → Config (data) → MCPs (Notion, Gmail, Calendar, Slack, HRMS, WhatsApp)
```

We adopt [yc-software/qm](https://github.com/yc-software/qm) (MIT) as the harness core via the **private-fork pattern** (see `docs/ADRS.md` ADR-001) — full custom control in `deploy/layers/otpless/`, core stays mergeable with upstream. "Custom harness for OTPLESS" = qm core + our deployment layer + our skill packs + our command policies. We do not rebuild what is MIT-licensed and battle-tested; we own everything above it.

## Repo map

| Path | What |
|---|---|
| `CLAUDE.md` | Operating manual for the builder agent (you, if you're an agent reading this) |
| `BOOTSTRAP_PROMPT.md` | The prompt a human pastes into a Claude cloud agent to build + maintain this, 24×7 |
| `docs/` | PRDs (master + recruiting), ADRs, deploy runbook |
| `docs/gates.md` | Living human-gate ledger: 13 gates (G1–G13), each with accountable owner and unblock checklist |
| `docs/OPERATING_RECRUITER.md` | Operator manual: daily loop, all 10 recruiting skills, config-only changes, known limitations |
| `platform/contracts/` | Integration contracts for Notion, Gmail, Calendar, Slack — consumed by skills; `_template.md` for new connectors |
| `platform/evidence/` | Draft-acceptance evidence: README (schema, formula, promotion decision table), `_rollup-template.md` for weekly rollups (counts only) |
| `platform/scripts/` | Deployment automation: bootstrap-qm.sh (preflight + provisioning), verify-deployment.md (checklist) |
| `platform/deploy-layer/otpless/` | Everything org-specific for the qm deployment (config, command policy, sandbox additions) |
| `packs/shared/` | Generic agent-infrastructure skill pack: identity, standup, retro, trust ladder — every agent imports this |
| `packs/recruiting/` | Department #1, agent #1: full hiring loop skills + per-role job playbooks (generic `_template.md` — any future role is one file) |
| `packs/onboarding/` | Department #2, agents #2–3: 10 skills (notice-period warmth, BGV, paperwork, provisioning, day-one, buddy, 30/60/90 checkins, hire-status, watch, router) + per-role onboarding checklists |
| `packs/people-ops/` | Department #2, agents #4–5: 6 skills (policy Q&A, HRMS reads, payroll prep, letters, vendor renewals, router) + policy-citation guardrails |
| `brain/` | The company brain: canonical, agent-readable knowledge (git = source of truth; Notion mirror for humans). See ADR-003 |
| `evals/` | Fixture-based eval harness; CI gate for every skill/playbook change |
| `agents/` (copy to `.claude/agents/` on first run) | Builder / Reviewer / Evaluator subagent definitions for the build loop |

## Quickstart (human)

1. Read `docs/RUNBOOK_DEPLOY.md` — provision the short credential list (the only human-gated steps).
2. Paste `BOOTSTRAP_PROMPT.md` into a Claude cloud agent (or Claude Code) with this repo.
3. The agent builds, evals, deploys, and reports phase by phase per `CLAUDE.md`. You approve at the marked gates.

## Status

- [x] Architecture + PRDs + ADRs
- [x] Skill packs v1 (shared + recruiting), 7 role playbooks + generic template
- [x] Company brain seed
- [x] Eval harness v1 (structure, template lint, rating fixtures)
- [x] Deployment-ready: contracts, scopes/crons as data, gate ledger, bootstrap preflight, evals x8
- [x] Measurement layer: draft-acceptance evidence, promotion arithmetic, operator manual (evals x10)
- [x] Onboarder + People-Ops packs built (not live — gates G1–G9, G14–G19)
- [ ] qm deployment live — blocked on gates G1–G9 (see `docs/gates.md`)
- [ ] Recruiter agent on qm, trust ladder L0 → L1
- [ ] Analyst + Culture & Growth agents (P3)
