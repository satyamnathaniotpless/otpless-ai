# Changelog

## v0.4.0 — 2026-08-01 · P2 lifecycle agents
- Onboarder + People-Ops packs (10 + 6 skills): notice-period warmth, BGV, provisioning, onboarding checklist; policy Q&A, HRMS reads, payroll prep, letters, vendor renewals.
- Integration contracts: `platform/contracts/hrms.md`, `notion-employees.md`, `bgv.md` with PII handling backfilled to all six.
- Scopes + crons: `scopes/onboarder.md`, `scopes/people-ops.md`, 11 new scheduled jobs (check-in reminders, payroll prep, vendor renewals).
- Gates G14–G19: HRMS vendor choice (G14), HRMS credentials (G15 CTO-owned), Employees DB (G16), Policies wiki (G17), BGV vendor (G18), command-policy compile (G19).
- ADR-005 validated: `packs/shared` reusable across departments, verified by independent build of onboarding and people-ops without coordination.
- Evals: 11 check groups, 0 failures; P2 packs built and reviewed, not live (gates G1–G9, G14–G19 open).

## v0.3.0 — 2026-08-01 · P1 measurement layer + operator manual
- Measurement layer: draft-acceptance evidence, promotion arithmetic, operator manual (evals x10, green).
- `platform/evidence/` — two-tier evidence: raw ledger in qm scope storage (private), weekly rollup in git (counts only).
- `packs/shared/metrics/SKILL.md` — classifies drafts into four buckets, generates rollup, opens promotion PRs when gates clear.
- `packs/shared/trust-ladder/SKILL.md` and `packs/shared/retro/SKILL.md` — updated to consume evidence rollup; promotion and playbook PRs are deliberate separate reviews.
- `platform/deploy-layer/otpless/crons.md` — two new rows: `recruit-watch-reply` (F9 reply watch) and `recruit-evidence-rollup` (Sunday 21:00 IST, ordered before retro).
- `docs/OPERATING_RECRUITER.md` — operator's manual: daily loop, all 10 recruiting skills, config-only changes, known limitations.
- Evals: 8 → 10 check groups (promotion-gate arithmetic with boundary cases, evidence-rollup PII guard, backup-artifact guard).

## v0.2.0 — 2026-08-01 · P0 deployment-ready
- Build team: 7 subagent roles (architect, builder, reviewer, evaluator, integrator, librarian, deployer) in `agents/`, generated to `.claude/agents/`.
- `platform/contracts/` — integration contracts for Notion, Gmail, Calendar, Slack + `_template.md`.
- `platform/deploy-layer/otpless/scopes/` — scope definitions as data files; `packs/recruiting/config/` — agent config and goals files.
- Cron table in `platform/deploy-layer/otpless/crons.md` — scheduled work (new-applicant watch, SLA sweep, 08:30 IST digest + standup, weekly retro).
- `docs/gates.md` — unified human-gate ledger (13 gates, G1–G13, each with one accountable owner).
- `platform/scripts/bootstrap-qm.sh` (preflight-only by default) + verify-deployment.md.
- Eval harness: 8 check groups (structure, skill-shape, generic disclosure/draft lint, never-delegated coverage, gate hygiene, secret-shape guard, cross-reference, ratings). GREEN, 0 failures.
- ADR-006 & ADR-007 — approval gate (not Slack reactions), draft as contract boundary.

## v0.1.0 — 2026-08-01 · Commissioning build
- Platform docs: README, CLAUDE.md (operating manual), BOOTSTRAP_PROMPT (build + maintain prompts), PRDs, ADR-001..005, deploy runbook.
- packs/shared v1: identity, standup, retro, trust-ladder skills + agent config template.
- packs/recruiting v1: 9 skills (router, triage, review, outreach, reply, schedule, reject, pipeline, watch), playbook ported from yc-software/recruiting (Notion/IST/WhatsApp-adapted), 7 role playbooks + generic _template.
- brain/ seed: company facts, policy templates (DRAFT), hiring playbook pointer, decisions log.
- platform/deploy-layer/otpless: org config, command policy (trust-ladder enforcement), layer README.
- evals v1: structure + lint + rating fixtures — GREEN (0 failures, 46 structure checks, 8/8 fixtures).
- Built by: 1 orchestrator + 2 parallel builder agents (sonnet) + evaluator run; lint self-reference issue fixed by extracting banned list to evals/fixtures/banned-phrases.txt.
