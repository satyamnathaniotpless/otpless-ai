---
name: hire-status
description: |
  One command, one hire: full cross-referenced state across the checklist, BGV, paperwork,
  provisioning, buddy, and calendar, re-queried fresh every time. Use when the user says
  "status on {hire}", "where's {hire}", or asks about a specific hire's onboarding state.
---

# Hire status

Purpose: answer "where does this one hire stand, right now" by re-querying every source fresh and cross-referencing them — never from memory, never conflating an invite sent with an invite accepted.

## Trigger

"status on {hire}", "where's {hire}", "what's happening with {hire}", "catch me up on {hire}", or a name mentioned with an implicit status ask during `../onboard-watch` drill-down.

## Inputs

- `../config/playbook.md` (split-brain rule, escalation table)
- `../config/notion.md` (Employees DB contract — not yet live, see Failure behavior)
- The hire's record (Employees DB once it exists, or the interim checklist-tracking doc)
- Calendar (day-one event, 30/60/90 check-in invites, past + future)
- Message thread (email/WhatsApp), full history

## Process

1. Resolve the name to exactly one hire record. Match on name (and role, if given) — never guess from a partial match.
   - **Ambiguous name:** stop, list the hires found (name + role + stage), ask the operator to disambiguate.
   - **Not found:** say so explicitly and ask whether the spelling or role narrows it.
2. Once resolved, re-query fresh, in parallel: lifecycle stage, notice-period-end date, BGV status, documents status, provisioning status, buddy status, and calendar events with `responseStatus`.
3. Cross-reference into one picture. Never merge or infer across sources — if the checklist says "BGV clear" but no confirming update exists, say both facts rather than reconciling silently.
4. Report calendar `responseStatus` literally: `accepted` = confirmed, `needsAction` = "invite sent, not yet accepted." Never state a check-in is "held" from an event's existence alone.
5. If the operator wants to act on what's shown, hand off to the matching sub-skill (`../notice-period-warmth`, `../bgv`, `../paperwork`, `../provisioning`, `../check-ins`) — this skill never drafts or sends itself.

## Output contract

Opens with `Checked: {sources queried}` (or notes what was skipped and why). Then, per dimension:

```
Stage:        {lifecycle stage} — notice ends {date}
BGV:          {status}
Paperwork:    {received}/{required}
Provisioning: {status}
Buddy:        {assigned name, or "not yet confirmed"}
Calendar:     {next milestone/event} — responseStatus: {accepted | needsAction} (or "none scheduled")
```

Close with one line of cross-referenced state in plain language.

## Failure behavior

- Two or more records match the name: list them and ask which — never pick for the operator.
- No record matches: state "not found" explicitly rather than guessing.
- Employees DB gate not yet cleared: state that the source is the interim checklist-tracking doc, not Notion, and proceed on that basis rather than reporting a fabricated Notion-backed status.
- Never answer from a table built earlier in the session — re-query every source every time this skill runs.
