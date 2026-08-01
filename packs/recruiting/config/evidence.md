<!-- Purpose: the recruiting agent's evidence config — which action-classes accumulate promotion evidence, where the rollups land, and the current level per class (ADR-005: data, not process). -->

# Evidence config: recruiting agent

Instantiates `packs/shared/config/evidence.md.example`. This file holds no evidence itself — it points `packs/shared/metrics/SKILL.md` at what to measure. The ledger lives in qm scope storage (never git); the rollup lives in `platform/evidence/recruiter/`, generated weekly by the `recruit-evidence-rollup` cron and never hand-edited.

## Action-classes tracked

Slugs match `platform/deploy-layer/otpless/command-policy.md` exactly — the ledger, the rollup, and the policy file must all name a class the same way, or the promotion citation chain breaks silently.

| Action-class | Rollup location | Minimum sample size | Current level | Notes |
|---|---|---|---|---|
| `scheduling_confirmation` | `platform/evidence/recruiter/` | 20 | L0 | The most likely first promotion: highest volume, lowest judgment. Blocked on G13 (Gmail send capability) as well as evidence — see ADR-007. |
| `application_acknowledgment` | `platform/evidence/recruiter/` | 20 | L0 | Second candidate for L1. Same G13 precondition. |
| `followup_nudge` | `platform/evidence/recruiter/` | 20 | L0 | The 3-day and 7-day silence nudges. Same G13 precondition. |
| `outreach_send` | `platform/evidence/recruiter/` | 20 | L0 | Personalisation is the whole value; a template that passes lint can still be wrong for a person. Do not propose above L0 without an explicit human decision, regardless of rate. |
| `applied_stage_rejection` | `platform/evidence/recruiter/` | 20 | L0 | L2-eligible at the earliest (4-week clean window). Only pre-screen rejections — anything after a human has met the candidate is never-delegated. |
| `stage_advance` | `platform/evidence/recruiter/` | 20 | L0 | L2-eligible. Advance-to-onsite is excluded and stays human (PRD §12.3). |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | n/a | NEVER DELEGATED | No evidence accumulates. These never enter the ladder at any rate (`packs/shared/trust-ladder/SKILL.md`). |

Minimum sample size is the platform default of 20 (`platform/evidence/README.md`). It may be raised per class here, never lowered.

## Light-edit threshold

An edit counts as `sent_light_edit` only when it changes neither a **fact** (time, date, name, role, stage, link, any number) nor the **ask** (what the candidate is being requested to do), and touches at most one sentence. Anything else is `sent_rewrite`.

Rationale for drawing it here: recruiting drafts are short and mostly logistical, so a changed fact is almost never cosmetic — it usually means the draft would have sent a candidate the wrong information. Tone-only softening of a single sentence is the genuine light-edit case. When unclear, `packs/shared/metrics/SKILL.md` requires classifying into the worse bucket.

## Where this agent's evidence lives

| Field | Value |
|---|---|
| Ledger (private, qm scope storage, never git) | `recruiter` scope storage |
| Rollup directory (git, counts only) | `platform/evidence/recruiter/` |
| Rollup cadence | Weekly — cron `recruit-evidence-rollup`, 21:00 IST Sunday, ahead of `recruit-retro` |

## Current level per class (mirror of command-policy, for quick reference only)

`platform/deploy-layer/otpless/command-policy.md` is the enforced source of truth. This table must never drift from it, and must never be cited to justify a level the policy file does not grant.

| Action-class | Level | Evidence window last measured | Rollup file |
|---|---|---|---|
| `scheduling_confirmation` | L0 | — (no evidence yet; system has not run) | — |
| `application_acknowledgment` | L0 | — | — |
| `followup_nudge` | L0 | — | — |
| `outreach_send` | L0 | — | — |
| `applied_stage_rejection` | L0 | — | — |
| `stage_advance` | L0 | — | — |
