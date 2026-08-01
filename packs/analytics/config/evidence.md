<!-- Purpose: tells the metrics skill and trust ladder which action-classes the People Analyst agent is accumulating evidence for and where — instantiates packs/shared/config/evidence.md.example (ADR-005: data, not process). -->

# Evidence config: People Analyst

This file does not itself contain any evidence — it points `packs/shared/metrics/SKILL.md` at what to measure and where to write it. The ledger lives in qm scope storage (never here, never git); the rollup lives in `platform/evidence/analyst/` (generated, never hand-edited).

## Action-classes tracked

The authoritative per-action-class table for this scope lives in `platform/deploy-layer/otpless/scopes/analyst.md` — the command policy compiles from the deploy layer, so that file governs and the rows below are a convenience read that must never be cited to justify a level it does not grant.

`platform/deploy-layer/otpless/command-policy.md` does not yet carry named per-action-class rows; they compile in at deployment (gate G19). No promotion can cite a row that does not exist, so nothing here is promotable yet — the correct state, since the agent has not run and no evidence exists.

| Action-class | Rollup location | Minimum sample size | Current level | Notes |
|---|---|---|---|---|
| `weekly_people_report_post` | `platform/evidence/analyst/` | 20 | L0 | Slack canvas/message draft to #people; aggregate-safe content, but promotion still runs on evidence, never on content-safety (`./playbook.md`) |
| `monthly_deepdive_post` | `platform/evidence/analyst/` | 20 | L0 | Lower natural volume (12/year) — will take longer to clear the 20-draft floor than weekly-cadence classes; report `insufficient_evidence`, not a failing rate, until it does |
| `data_hygiene_flag` | `platform/evidence/analyst/` | 20 | L0 | Internal escalation to the record-owning agent/accountable human, not a leadership-facing send — still an action-class per `packs/shared/metrics/SKILL.md`'s definition (a drafted action with a resolution) |
| `ad_hoc_analysis_response` | `platform/evidence/analyst/` | 20 | L0 | On-demand Slack answers to a question outside the report cadence (e.g. "what's current headcount") |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | n/a | NEVER DELEGATED | No evidence accumulates for these — they never enter the ladder regardless of any rate (`packs/shared/trust-ladder/SKILL.md`). This agent additionally never accumulates evidence toward promoting "naming an attrition risk" or "stating an individual's comp" as an action-class at all — those aren't drafts this pack is allowed to produce, at any level (see `../attrition-signals/SKILL.md`, `../comp-drift/SKILL.md`). |

Minimum sample size defaults to 20 (`platform/evidence/README.md`); only raise it here per action-class, never lower it below 20.

## Light-edit threshold

Proposed starting point, not yet decided by a human — TODO(gate): who: Founder / incoming People Lead, once real drafts exist to calibrate against (same status as `packs/people-ops/config/evidence.md`'s equivalent section). Proposal: a "light edit" changes wording or formatting only — no figure, no threshold application, no added/removed section, and no change to which cohort was suppressed. Anything touching a number, a suppression decision, or the set of included sections is `sent_rewrite`. When unclear, `packs/shared/metrics/SKILL.md` requires classifying into the worse bucket.

## Where this agent's evidence lives

| Field | Value |
|---|---|
| Ledger (private, qm scope storage, never git) | `analyst` scope storage (once the scope exists) |
| Rollup directory (git, counts only) | `platform/evidence/analyst/` |
| Rollup cadence | Weekly, cron-fired — see `packs/shared/metrics/SKILL.md` |

## Current level per class (mirror of command-policy, for quick reference only)

This table is a convenience read; `platform/deploy-layer/otpless/command-policy.md` is the enforced source of truth and this section must never drift from it or be used to justify a level this agent doesn't actually have there.

| Action-class | Level | Evidence window last measured | Rollup file |
|---|---|---|---|
| `weekly_people_report_post` | L0 | — (no evidence yet; scope has not run) | — |
| `monthly_deepdive_post` | L0 | — | — |
| `data_hygiene_flag` | L0 | — | — |
| `ad_hoc_analysis_response` | L0 | — | — |
