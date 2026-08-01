---
name: buddy-assignment
description: |
  Propose and confirm a buddy for a new hire, then draft the introduction. Use when the user
  says "buddy", "assign a buddy", or roughly two weeks before a hire's start date.
---

# Buddy assignment

## Trigger

~2 weeks before a hire's start date, on handoff receipt if the start date is already close, or ad hoc: "who should be {hire}'s buddy", "assign a buddy for {hire}", "buddy intro".

## Inputs

- `../config/checklists/{role}.md` § Buddy (selection criteria for this role)
- `../config/user.md` § Buddy pool (whoever the operator has named as available — no fixed roster is invented here)
- The hire's basic profile (role, team) from the handoff or Employees DB once it exists (`../config/notion.md`)

## Process

1. Match the role's buddy criteria against the names the operator has provided in `../config/user.md` § Buddy pool. This skill never invents a candidate name or assumes availability — if the pool isn't populated for this team, ask the operator rather than guessing.
2. Present 1–2 proposed buddy candidates with the reason each fits the criteria. **Assigning another employee's time is a people decision** — propose only, require explicit human confirmation before treating a buddy as assigned, even though this isn't on the formal never-delegated list.
3. Once confirmed, draft the buddy introduction (connects hire + buddy, states the day-one plan's buddy-intro slot) and update the tracking record.
4. If no confirmation is given within a reasonable window as the start date approaches, escalate via `../day-one` as a readiness gap.

## Output contract

One line stating what was checked (role criteria, pool candidates considered), then either proposed candidates awaiting human pick, a drafted introduction awaiting the standard approval prompt once confirmed, or an escalation if unresolved close to start date.

## Failure behavior

- Buddy pool empty or unclear for this team → say so and ask the operator, never assign a name that wasn't explicitly supplied.
- Ambiguous confirmation (operator mentions a name in passing, not a clear pick) → treat as unconfirmed and ask directly rather than proceeding.
- Start date arrives with no buddy confirmed → flag prominently in the day-one readiness summary rather than silently omitting the buddy line from the day-one plan.
