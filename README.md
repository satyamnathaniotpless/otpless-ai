# Otto — OTPLESS AI Workforce Platform

> **Do not run `fly launch` (or any source-build deploy) against this repository.** It fails with
> *"Could not find a Dockerfile, nor detect a runtime or framework from source code"* — correctly.
> This repo is skill packs, config, and docs; it contains no service, and it never will.
>
> qm does not build from source. It pulls immutable image digests and orchestrates the Fly apps
> itself. The deployment lives in a **separate directory** created by `qm init`, and goes live via
> `qm up`. Start at `docs/RUNBOOK_DEPLOY.md` §2 — not at Fly's quickstart.

**Naming:** Otto is OTPLESS's agent platform — what this repo builds and what the company runs. qm is the open-source harness Otto runs on, the same way a cluster runs on Kubernetes without becoming Kubernetes. Every CLI command, config file, and package name (`qm up`, `qm.config.jsonc`, `@yc-software/qm`) stays `qm` — if you're searching for help or reading upstream docs, `qm` is the name to look for, not Otto.

Otto is OTPLESS's custom agent harness and agent workforce. One platform, hundreds of scoped agents over time, organized like a company: departments → agents → skills → config. HR/People is department #1 (greenfield, urgent, high-volume); the Recruiter agent is employee #1.

**This is permanent infrastructure.** The current 7-hire sprint is the commissioning run. The platform's product is: any new role, workflow, or department becomes a config change plus a skill pack — never a new system.

## Architecture in one line

```
Humans (judgment) → qm harness (24×7, self-hosted, Slack+web) → Agent scopes (identity, memory, goals, trust level) → Skill packs (git) → Config (data) → MCPs (Notion, Gmail, Calendar, Slack, HRMS, WhatsApp)
```

We adopt [yc-software/qm](https://github.com/yc-software/qm) (MIT) as the harness core (see `docs/ADRS.md` ADR-001 and its 2026-08-01 correction) — we depend on the published package rather than a fork, and everything OTPLESS-specific lives in the deployment directory's `qm.config.jsonc` and `sandbox/` layer. There is no `deploy/layers/` contract; that was an assumption corrected by running `qm init` against the real package. "Custom harness for OTPLESS" = qm core + our deployment layer + our skill packs + our command policies. We do not rebuild what is MIT-licensed and battle-tested; we own everything above it.

## Repo map

| Path | What |
|---|---|
| `CLAUDE.md` | Operating manual for the builder agent (you, if you're an agent reading this) |
| `BOOTSTRAP_PROMPT.md` | The prompt a human pastes into a Claude cloud agent to build + maintain this, 24×7 |
| `docs/` | PRDs (master + recruiting), ADRs, deploy runbook |
| `docs/gates.md` | Living human-gate ledger: 28 gates (G1–G28), each with accountable owner and unblock checklist |
| `docs/OPERATING_RECRUITER.md` | Operator manual: daily loop, all 10 recruiting skills, config-only changes, known limitations |
| `platform/contracts/` | Integration contracts for Notion, Gmail, Calendar, Slack — consumed by skills; `_template.md` for new connectors |
| `platform/evidence/` | Draft-acceptance evidence: README (schema, formula, promotion decision table), `_rollup-template.md` for weekly rollups (counts only) |
| `platform/scripts/` | Deployment automation: bootstrap-qm.sh (preflight + provisioning), verify-deployment.md (checklist) |
| `platform/deploy-layer/otpless/` | Everything org-specific for Otto (config, command policy, sandbox additions) |
| `packs/shared/` | Generic agent-infrastructure skill pack: identity, standup, retro, trust ladder — every agent imports this |
| `packs/recruiting/` | Department #1, agent #1: full hiring loop skills + per-role job playbooks (generic `_template.md` — any future role is one file) |
| `packs/onboarding/` | Department #2, agents #2–3: 10 skills (notice-period warmth, BGV, paperwork, provisioning, day-one, buddy, 30/60/90 checkins, hire-status, watch, router) + per-role onboarding checklists |
| `packs/people-ops/` | Department #2, agents #4–5: 6 skills (policy Q&A, HRMS reads, payroll prep, letters, vendor renewals, router) + policy-citation guardrails |
| `packs/analytics/` | Department #3, agent #6: 7 skills (attrition signals, comp drift, engagement drilldown, survey analysis, metrics, evidence, router) — aggregate-only, structural PII safety |
| `packs/culture/` | Department #3, agent #7: 7 skills (review tracking, 1:1 cadence, offboarding, pulse-survey cycle, team-tenure heatmap, culture changelog, peer-review agg) — process/judgment separation, structural safety |
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
- [x] Analyst + Culture & Growth packs built, WhatsApp contract (not live — gates G1–G9, G14–G25)
- [x] Otto live — Fly.io `sin`, 5 services healthy, Postgres + Tigris, portal at `otpless-portal.fly.dev` (2026-08-02)
- [x] Recruiting packs loaded onto Otto — deployment layer v6: 15 skills (shared + recruiting), integration contracts, and per-deployment `user.md`. Agent named **Scout** (G8 closed)
- [ ] Recruiter agent proven in shadow mode, trust ladder L0 → L1 — blocked on a real triage run and the enforcement re-founding (ADR-004 describes a command policy qm does not have)
- [x] Department automation playbook (`docs/DEPARTMENT_AUTOMATION_PLAYBOOK.md`) — template out to department #2, recommendation: support
