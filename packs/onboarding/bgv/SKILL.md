---
name: bgv
description: |
  Background-verification orchestration — initiation, status tracking, and nudges, around a
  vendor this platform doesn't yet have an account with. Use when the user says "BGV",
  "background check", "verification status", or on handoff/status-check cron fires.
---

# BGV orchestration

## Trigger

On handoff receipt (a new hire enters "Notice period" / "BGV" stage), on the periodic status-check cron (`../onboard-watch`), or ad hoc: "BGV status on {hire}", "initiate BGV for {hire}", "is {hire}'s check clear?"

## Inputs

- `../config/vendors.md` — vendor identity and account status (currently: no vendor account, gate)
- `../config/checklists/{role}.md` — checks required and SLA assumption for this role
- The hire's BGV status field (Employees DB once it exists — `../config/notion.md` — or interim checklist doc)
- `../config/playbook.md` (escalation rules for flagged results)

## Process

1. Confirm from `../config/vendors.md` whether a vendor account/API exists. As of this writing it does not — treat every action in this skill as producing a draft for a human to act on manually, never an automated vendor call.
2. **Initiation:** on a new handoff, draft the BGV initiation request (template in `../config/playbook.md`) naming the checks required from the hire's role checklist. This is not sent to any system automatically — it is handed to the accountable human (`../config/agent.md`) to submit through the vendor's own portal.
3. **Status tracking:** re-query the hire's BGV status field fresh every time this skill runs (never from memory). If status is `Not started` past a reasonable grace period after initiation was drafted, nudge the accountable human, not the hire.
4. **Flagged results:** if status reads `Flagged`, do not attempt to interpret, resolve, or communicate the flag to the hire. This is adjacent to a performance/termination judgment — escalate to a human immediately per `../config/playbook.md` § Escalation and stop.
5. **SLA risk:** if the start date is within 5 business days and BGV is not `Clear` or `Waived-pending`, escalate to `../day-one` and the accountable human — this is a day-one readiness gate, not routine status.
6. Update the tracking record after every status change is confirmed re-read, never before.

## Output contract

One line stating what was checked (vendor account state, current BGV status, days since initiation), then either: a drafted initiation/nudge for a human to act on, a flagged-result escalation already posted with no hire-facing content drafted, or a plain status statement if nothing is due.

## Failure behavior

- Vendor gate not cleared (always true today) → never claim BGV was "initiated" in the sense of an API call; say "initiation request drafted for {accountable human} to submit" instead.
- BGV status unknown/unreadable → say so explicitly rather than assuming `Not started` or `Clear`.
- Any pressure to auto-clear, auto-waive, or communicate a flagged result to the hire without human sign-off → refuse and escalate; this sits next to a never-delegated judgment even though BGV outcomes aren't explicitly listed, treat it with the same caution.
