<!-- Purpose: tells the metrics skill and trust ladder which action-classes the People-Ops agent is accumulating evidence for and where — instantiates packs/shared/config/evidence.md.example (ADR-005: data, not process). -->

# Evidence config: People-Ops agent

This file does not itself contain any evidence — it points `packs/shared/metrics/SKILL.md` at what to measure and where to write it. The ledger lives in qm scope storage (never here, never git); the rollup lives in `platform/evidence/people-ops/` (generated, never hand-edited).

## Action-classes tracked

Slugs match `platform/deploy-layer/otpless/command-policy.md` exactly. The authoritative per-action-class table for this scope lives in `platform/deploy-layer/otpless/scopes/people-ops.md` — the command policy compiles from the deploy layer, so that file governs and the rows below are a convenience read that must never be cited to justify a level it does not grant.

| Action-class | Rollup location | Minimum sample size | Current level | Notes |
|---|---|---|---|---|
| `policy_qa_response` | `platform/evidence/people-ops/` | 20 | L0 | Never sent without a citation regardless of level — see `../policy-qa/SKILL.md` |
| `leave_attendance_query_response` | `platform/evidence/people-ops/` | 20 | L0 | Read-only HRMS lookups |
| `letter_draft` | `platform/evidence/people-ops/` | 20 | L0 | Always requires a human signatory; promotion affects speed-to-signatory only, never removes the signature step |
| `payroll_input_packet` | `platform/evidence/people-ops/` | 20 | L0 | Internal coordination, not an external send; never promotes to an HRMS write |
| `vendor_renewal_notice` | `platform/evidence/people-ops/` | 20 | L0 | Any spend/contract commitment stays a human gate regardless of level |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | n/a | NEVER DELEGATED | No evidence accumulates for these — they never enter the ladder regardless of any rate |

Minimum sample size defaults to 20 (`platform/evidence/README.md`); only raise it here per action-class, never lower it below 20.

## Light-edit threshold

TODO(gate): not yet decided — who: Founder / incoming People Lead, once real drafts exist to calibrate against. A reasonable starting proposal for this agent's first retro to test: for `policy_qa_response` and `leave_attendance_query_response`, a "light edit" is a tone/wording tweak that does not change the cited source, the section referenced, or any figure; anything touching the citation or a number is `sent_rewrite`. Do not treat this proposal as decided — it is a draft starting point for the founder to confirm, same status as the seed policies in `brain/people/`.

## Where this agent's evidence lives

| Field | Value |
|---|---|
| Ledger (private, qm scope storage, never git) | `people-ops` scope |
| Rollup directory (git, counts only) | `platform/evidence/people-ops/` |
| Rollup cadence | Weekly, cron-fired — see `packs/shared/metrics/SKILL.md` |

## Current level per class (mirror of command-policy, for quick reference only)

This table is a convenience read; `platform/deploy-layer/otpless/command-policy.md` is the enforced source of truth and this section must never drift from it or be used to justify a level this agent doesn't actually have there.

| Action-class | Level | Evidence window last measured | Rollup file |
|---|---|---|---|
| `policy_qa_response` | L0 | — | — |
| `leave_attendance_query_response` | L0 | — | — |
| `letter_draft` | L0 | — | — |
| `payroll_input_packet` | L0 | — | — |
| `vendor_renewal_notice` | L0 | — | — |
