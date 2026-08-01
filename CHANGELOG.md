# Changelog

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
