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

If the candidate is past Onsite (met a human), flag this as a **never-delegated** decision per the trust ladder — draft only, do not imply any autonomy to send without explicit human review of both the decision and the wording.
