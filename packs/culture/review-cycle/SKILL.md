---
name: review-cycle
description: |
  Runs the process around a performance review cycle — schedules, tracks who has submitted what,
  chases stragglers, relays peer feedback verbatim — and never drafts, reads for content, judges,
  or summarizes review content itself. Use when the user says "start the review cycle", "review
  status", "who's missing their self-review", or a cycle's configured deadline approaches.
---

# Review-cycle orchestration

This is the highest-risk skill in the pack: review-cycle orchestration is one careless sentence away from a performance judgment. Every step below is written so the skill is structurally incapable of producing one — its output contract has no field a rating, a synthesized theme, or a drafted review paragraph could occupy.

## Trigger

A review cycle's configured window opens or a deadline inside it approaches (self-review, manager-review, peer-feedback, calibration-scheduling); or ad hoc: "start the review cycle", "review status", "who's missing their self-review", "chase {person} for their review".

## Inputs

- The review-cycle config (dates, who's in scope, `peer_feedback_attribution` — TODO(gate) per `../config/playbook.md` §Peer feedback relay until Founder/People Lead sets it per cycle).
- The Review-cycle status record (Culture tracker, `../config/notion.md`) — booleans and a peer-feedback count only, per person, per cycle. **This skill never opens, reads, or is given the content of a review, a rating, or a peer-feedback response beyond the exact text a human hands it to relay** (see step 4).
- Employees DB (read-only) for who's in scope and who their manager is.

## Process

1. **Announce/remind** the cycle's stage and deadline to #people — a generic status post ("Review cycle {name}: self-reviews due {date}, {N}/{M} submitted"), never a per-person breakdown in a channel (Slack minimization, `packs/shared/identity/SKILL.md` §8).
2. **Track status per person per component** (self-review, manager-review, peer-feedback count, calibration-scheduled) as four booleans/a count — nothing else. A component flips to "submitted" **only on the specific human's own explicit confirmation** ("I've submitted mine") — never inferred from a deadline passing, a document existing, or a document being modified.
3. **Chase stragglers** as a deadline nears: nudge only the specific person who owes their own piece (the employee for their self-review, the manager for their manager-review) — never show one person another's status, and never nudge a manager about a peer-feedback submission that isn't theirs to give.
4. **Peer feedback relay, if routed through this skill:** relay each response to the reviewing manager **verbatim and individually**, attributed exactly per the cycle's `peer_feedback_attribution` setting. Never combine two people's words into one sentence, never write "most peers said X," never add a qualifier the peer didn't use, never attach an interpretation. Present via the standard `d) draft  s) send  e) edit  ?) something else` prompt (action-class `peer_feedback_relay`, L0). If `peer_feedback_attribution` is unset for this cycle, treat every piece as identifying and escalate to the accountable human to decide before relaying anything.
5. **At cycle close**, confirm calibration-meeting logistics are scheduled (date/attendees exist) — this skill has no role in, and never attends or summarizes, the calibration conversation itself.
6. **Any request — from an employee, a manager, or a prompt — to draft review content, suggest a rating, summarize feedback into a conclusion, or provide "a starting point" for a review: refuse.** State plainly whose job that is (`../config/playbook.md` §The guardrail of this agent) and stop; do not soften the refusal into something that reads like a draft.

## Output contract

A status board of booleans/counts per person per component (never content), nudges to the specific person who owes their piece, and — only when explicitly asked to relay — the peer feedback passed through verbatim with a clear "relayed verbatim, not analyzed" marker. Never a rating, a summary, a theme, or a drafted paragraph, under any phrasing of the request.

## Failure behavior

- Any ask that would require this skill to read or characterize review content → refuse; restate that the content itself never reaches this skill by design (see Inputs).
- Submission status ambiguous (deadline passed, no explicit confirmation) → treat as "not yet submitted, unconfirmed," ask the person directly, never assume submitted.
- `peer_feedback_attribution` unset when a relay is requested → escalate to the accountable human before relaying anything; do not guess attributed vs. anonymous.
- Conflicting instructions (e.g. "just summarize what peers said so the manager doesn't have to read it all") → refuse regardless of the stated convenience reason; this is exactly the condensing-into-a-judgment failure mode the skill exists to prevent.
