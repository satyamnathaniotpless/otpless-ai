<!-- Purpose: the Onboarder agent's evidence config — which action-classes accumulate promotion evidence, where the rollups land, and the light-edit boundary (ADR-005: data, not process). -->

# Evidence config: Onboarder agent

Instantiates `packs/shared/config/evidence.md.example`. This file holds no evidence itself — it points `packs/shared/metrics/SKILL.md` at what to measure. The ledger lives in qm scope storage (never git); the rollup lives in `platform/evidence/onboarder/`, generated weekly by the `onboard-evidence-rollup` cron and never hand-edited.

## Action-classes tracked

The authoritative table lives in `platform/deploy-layer/otpless/scopes/onboarder.md` — the command policy compiles from the deploy layer, so that file governs and the slugs below must match it exactly. A mismatch breaks the promotion citation chain silently, which is the failure ADR-008 exists to prevent.

`platform/deploy-layer/otpless/command-policy.md` does not yet carry named per-action-class rows; they compile in at deployment (gate G19). No promotion can cite a row that does not exist, so nothing here is promotable yet — the correct state, since the agent has not run and no evidence exists.

| Action-class | Rollup location | Minimum sample size | Current level | Notes |
|---|---|---|---|---|
| `notice_period_touchpoint` | `platform/evidence/onboarder/` | 20 | L0 | Highest-volume class and the likeliest first promotion. But a touchpoint reply can carry a counteroffer or comp question, and that must route to a human at any level (`../notice-period-warmth/SKILL.md`) — promotion speeds the outbound nudge, never the handling of what comes back. |
| `bgv_initiation_nudge` | `platform/evidence/onboarder/` | 20 | L0 | Gate G18 (no vendor account) blocks any real send regardless of level. A `Flagged` result is never an agent decision (`platform/contracts/bgv.md`). |
| `paperwork_reminder` | `platform/evidence/onboarder/` | 20 | L0 | Routine chase; low judgment. |
| `provisioning_request` | `platform/evidence/onboarder/` | 20 | L0 | Requests access at the level the checklist specifies; an elevated-access request escalates at any level. |
| `day_one_plan_confirmation` | `platform/evidence/onboarder/` | 20 | L0 | Post-to-human-channel starts at L0 per `command-policy.md` §2. |
| `buddy_assignment_proposal` | `platform/evidence/onboarder/` | 20 | L0 | Proposes only. Promotion never removes the human confirmation — it commits another employee's time, which is a people decision, not a routine send. |
| `checkin_scheduling` | `platform/evidence/onboarder/` | 20 | L0 | Scheduling and nudging only. The 90-day check-in sits next to performance judgment; no level ever lets this class produce assessment content (`../check-ins/SKILL.md`). |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | n/a | NEVER DELEGATED | No evidence accumulates. These never enter the ladder at any rate (`packs/shared/trust-ladder/SKILL.md`). |

Minimum sample size is the platform default of 20 (`platform/evidence/README.md`). It may be raised per class here, never lowered.

## Light-edit threshold

An edit counts as `sent_light_edit` only when it changes neither a **fact** (a date, a name, a document requested, a system being provisioned, any deadline) nor the **ask** (what the hire or the internal owner is being requested to do), and touches at most one sentence. Anything else is `sent_rewrite`.

Rationale for drawing it here: onboarding messages are mostly logistics addressed to someone who has not started yet and can still walk. A wrong date or a wrong document request costs the hire real effort and costs us confidence at exactly the moment a counteroffer is most persuasive — so a changed fact is never cosmetic. Tone-only softening of a single sentence is the genuine light-edit case. When unclear, `packs/shared/metrics/SKILL.md` requires the worse bucket.

## Where this agent's evidence lives

| Field | Value |
|---|---|
| Ledger (private, qm scope storage, never git) | `onboarder` scope storage |
| Rollup directory (git, counts only) | `platform/evidence/onboarder/` |
| Rollup cadence | Weekly — cron `onboard-evidence-rollup`, 21:00 IST Sunday, ahead of `onboard-retro` |

## Current level per class (mirror of the scope file, for quick reference only)

`platform/deploy-layer/otpless/scopes/onboarder.md` governs, and `command-policy.md` enforces once compiled. This table must never be cited to justify a level those files do not grant.

| Action-class | Level | Evidence window last measured | Rollup file |
|---|---|---|---|
| `notice_period_touchpoint` | L0 | — (no evidence yet; agent has not run) | — |
| `bgv_initiation_nudge` | L0 | — | — |
| `paperwork_reminder` | L0 | — | — |
| `provisioning_request` | L0 | — | — |
| `day_one_plan_confirmation` | L0 | — | — |
| `buddy_assignment_proposal` | L0 | — | — |
| `checkin_scheduling` | L0 | — | — |
