<!-- Purpose: which action-classes this pack accumulates trust-ladder evidence for and where — instantiates packs/shared/config/evidence.md.example (ADR-005: data, not process). -->

# Evidence config: Culture & Growth agent

Instantiates `packs/shared/config/evidence.md.example`. This file holds no evidence itself — it points `packs/shared/metrics/SKILL.md` at what to measure. The ledger lives in qm scope storage (never git, and for this pack especially never git — see `../config/notion.md` §PII handling); the rollup lives in `platform/evidence/culture/`, generated weekly and never hand-edited.

The authoritative per-action-class table for this scope lives in `platform/deploy-layer/otpless/scopes/culture.md` — the command policy compiles from the deploy layer, so that file governs and the rows below are a convenience read.

`platform/deploy-layer/otpless/command-policy.md` does not yet carry named per-action-class rows; they compile in at deployment (gate G19). No promotion can cite a row that does not exist, so nothing here is promotable yet — the correct state, since the agent has not run and no evidence exists.

## Action-classes tracked

| Action-class | Rollup location | Minimum sample size | Current level | Notes |
|---|---|---|---|---|
| `pulse_survey_invite` | `platform/evidence/culture/` | 20 | L0 | Distribution send only — content is the fixed, Approved question set, not agent-composed |
| `one_on_one_nudge` | `platform/evidence/culture/` | 20 | L0 | Occurrence-tracking nudge; no content variance to speak of, good L1 candidate once evidence exists |
| `review_cycle_reminder` | `platform/evidence/culture/` | 20 | L0 | Deadline/status nudge only |
| `peer_feedback_relay` | `platform/evidence/culture/` | 20 | L0 | Per-instance content is human-authored, not agent-composed — do not propose above L0 without an explicit human decision regardless of rate, same reasoning as recruiting's `outreach_send` (an unedited "send" here mostly proves routing was correct, not that judgment was sound) |
| `anniversary_message` | `platform/evidence/culture/` | 20 | L0 | |
| `offboarding_checklist_nudge` | `platform/evidence/culture/` | 20 | L0 | |
| `exit_interview_invite` | `platform/evidence/culture/` | 20 | L0 | Scheduling only |
| `exit_interview_transcript_delivery` | n/a — not evidence-eligible | n/a | L0, permanently | This is a private, one-directional handoff to the accountable human, not a routine send a promotion would ever streamline past a human — see `../config/notion.md`. Never proposed for promotion, regardless of any future rate |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | n/a | NEVER DELEGATED | No evidence accumulates. These never enter the ladder at any rate (`packs/shared/trust-ladder/SKILL.md`) |

Minimum sample size is the platform default of 20 (`platform/evidence/README.md`). It may be raised per class here, never lowered.

## Light-edit threshold

An edit counts as `sent_light_edit` only when it changes neither a **fact** (a date, a name, a due date, a link, a cycle deadline) nor the **ask** (what the recipient is being requested to do — attend, submit, confirm), and touches at most one sentence. Anything else is `sent_rewrite`. Because most of this pack's drafts are scheduling/status nudges rather than persuasive prose, a changed fact here is almost always a correctness bug (wrong date, wrong person), not a style choice — the same reasoning `recruiting/config/evidence.md` uses, applied to a pack with even less room for stylistic variance.

## Where this agent's evidence lives

| Field | Value |
|---|---|
| Ledger (private, qm scope storage, never git) | `culture` scope storage |
| Rollup directory (git, counts only) | `platform/evidence/culture/` |
| Rollup cadence | Weekly, cron-fired — see `packs/shared/metrics/SKILL.md` |

## Current level per class (mirror of command-policy, for quick reference only)

`platform/deploy-layer/otpless/command-policy.md` is the enforced source of truth once this scope is compiled into it (see provisional-authorship note above). This table must never drift from it or be cited to justify a level the policy file does not grant.

| Action-class | Level | Evidence window last measured | Rollup file |
|---|---|---|---|
| `pulse_survey_invite` | L0 | — (no evidence yet; system has not run) | — |
| `one_on_one_nudge` | L0 | — | — |
| `review_cycle_reminder` | L0 | — | — |
| `peer_feedback_relay` | L0 | — | — |
| `anniversary_message` | L0 | — | — |
| `offboarding_checklist_nudge` | L0 | — | — |
| `exit_interview_invite` | L0 | — | — |
| `exit_interview_transcript_delivery` | L0 (permanent, not evidence-eligible) | n/a | n/a |
