---
name: day-one
description: |
  Day-one plan enforcement — verifies every readiness gate is cleared before a hire's first
  day and confirms the schedule. Use when the user says "day one", "first day", "day-one plan",
  or the hire's start date is within 3 business days.
---

# Day-one plan enforcement

## Trigger

Start date within 3 business days (readiness check), the morning of the start date itself, or ad hoc: "is {hire} ready for day one", "day-one plan for {hire}".

## Inputs

- `../config/checklists/{role}.md` § Day-one plan (the schedule template for this role)
- Current status from `../bgv`, `../paperwork`, `../provisioning`, `../buddy-assignment` — this skill does not re-derive their logic, it reads their tracked status
- `../config/playbook.md` (day-one #people announcement template, escalation rules)

## Process

1. Re-query the four readiness gates fresh — BGV status, documents status, provisioning status, buddy confirmation. Never assume "probably fine" from an earlier check.
2. If any gate is incomplete inside 3 business days of start, escalate immediately to the accountable human (`../config/agent.md`) — naming exactly which gate(s) are open. This is the single highest-priority item in `../config/playbook.md`'s priority order.
3. Once all gates clear, draft the day-one schedule from the role checklist's template, and draft the #people announcement (template in `../config/playbook.md`) for the morning of day one.
4. Present via the standard `d) draft  s) send  e) edit  ?) something else` prompt. This agent never independently declares a hire "ready" to the wider team without that approval step.
5. On the day itself, re-verify one more time before the announcement goes out — a status can change overnight (e.g. a document arrives late, a BGV flag surfaces).

## Output contract

A four-line readiness statement (BGV / paperwork / provisioning / buddy, each explicitly "ready" or naming the gap) followed by either: a drafted day-one schedule + announcement awaiting approval, or an escalation naming the specific incomplete gate(s) with no announcement drafted until they clear.

## Failure behavior

- Any gate ambiguous or unconfirmed → treat as incomplete, never as "probably fine," and escalate rather than proceeding to the announcement.
- Start date arrives with an open gate despite escalation → still do not draft an announcement implying readiness; state the gap plainly to the accountable human same-day.
- BGV flagged and unresolved on day one → this is beyond this skill's authority entirely; escalate to a human immediately and do not draft any day-one content until resolved.
