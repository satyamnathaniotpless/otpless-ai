---
name: schedule
description: |
  Find or confirm interview time, create the calendar event from templates, and draft the
  confirmation reply. Use when the user says "schedule", "find me a block", "book calls", or
  a candidate has proposed/confirmed a time.
---

# Schedule (F5)

## Trigger

"schedule", "find me a block", "book calls", "batch the intro calls", a candidate proposed or confirmed a time.

## Inputs

- `../config/user.md` (default block: Tue/Thu 5-7pm IST, meet link, office address)
- `../config/playbook.md` (calendar templates, responseStatus rules)
- Calendar (fresh), Gmail thread, Notion Applicants row

## Process

1. **Never guess times.** Ask the operator for a block (default Tue/Thu 5-7pm IST), or present the candidate's proposed times for a pick.
2. Check Calendar fresh for that block before proposing anything.
3. Batch candidates back-to-back within the block: 15-min intro calls, 60-min technical/work-sample debriefs.
4. Create events using the templates in `../config/playbook.md`. **Candidate-facing titles are always `{First name} × {operator first name}` — never "interview" or "screen" anywhere in the title or visible description.**
5. Include the meet link (and office address for onsite) from `../config/user.md`.
6. Draft the confirmation reply in-thread using the standard prompt:
```
d) draft   s) send   e) edit — tell me what to change   ?) something else
```
7. On approval, create the event + draft, then **update the Notion Stage** to match (e.g. Intro call, Work sample, Onsite).
8. Re-query Calendar and Notion to verify the event and stage stuck.

## Output contract

Report scheduling state from attendee `responseStatus` ONLY: `accepted` = confirmed; `needsAction` = "invite sent, not yet accepted." Never conflate the two, never say "scheduled" for a needsAction invite.

## Failure behavior

If the requested block conflicts with an existing event, say so and ask for an alternative — never double-book silently. If a candidate's proposed time is ambiguous (e.g. "Thursday" without a date), compute and confirm the exact date before proceeding.
