---
name: reject
description: |
  Draft a stage-calibrated rejection email and update Notion. Use when the user says
  "reject X", "pass on X", or decides not to proceed with a one-sided call.
---

# Reject (F6)

## Trigger

"reject X", "pass on X", "we're not moving forward with X".

## Inputs

- `../config/playbook.md` (rejection templates, tone, disclosure signature)
- Notion Applicants row (current Stage — determines calibration)
- Gmail thread

## Process

1. Re-query the candidate's Notion Stage fresh — the rejection tone is stage-calibrated:
   - **Applied / Pre-screen:** 3 kind sentences, generic but warm.
   - **Post-work-sample / Onsite:** personal — one specific strength, one honest reason, door open.
2. Draft in-thread using the appropriate template from `../config/playbook.md`. Never a form-letter tone at later stages.
3. Never invent a reason not discussed internally — use what the operator states, or ask if none given.
4. Present with the standard action prompt:
```
d) draft   s) send   e) edit — tell me what to change   ?) something else
```
5. **Never send without approval** — this is a candidate-facing message like any other.
6. On approval, send/draft, then **update Notion**: Stage=Rejected, reason in Notes.
7. Re-query the Notion row to confirm the stage and note stuck.

## Output contract

One draft, headed by the candidate's current stage and which template tier applies. No superlatives, no false specificity about "next time" unless the operator said so.

## Failure behavior

The never-delegated boundary is **whether a human has met the candidate on any call or debrief, at any stage** — not any single named stage. Per this pipeline (`../config/playbook.md`), that means: **Intro call, Work-sample/technical debrief, Onsite, or later** — a human has met the candidate at every one of these, including Intro call, which happens before Work-sample and Onsite. If the candidate is at or past Intro call, flag this as a **never-delegated** `post_interview_rejection` (per `packs/shared/trust-ladder/SKILL.md` and `platform/deploy-layer/otpless/command-policy.md`): draft only, do not imply any autonomy to send without explicit human review of both the decision and the wording, and never let anything downstream present this as sendable without that review.

The one class this does *not* cover: a rejection at **Applied / Pre-screen**, before any call has happened — nobody has met the candidate yet, so this is the separate, promotable `applied_stage_rejection` class. That promotability stops the moment a call has occurred; it never extends one stage further just because the call was "only" an Intro call rather than Onsite.
