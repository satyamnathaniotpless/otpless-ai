---
name: notice-period-warmth
description: |
  Weekly touchpoint with a hire serving their notice period — the loop that keeps a signed
  offer from evaporating to a counteroffer. Use when the user says "check in with X", "notice
  period", "counteroffer risk", or the weekly cron fires per hire.
---

# Notice-period warmth

## Trigger

Weekly, cron-fired, once per hire currently in the "Notice period" lifecycle stage — or ad hoc, "check in with {hire}", "any counteroffer risk on {hire}?", "notice period status".

## Inputs

- `../config/playbook.md` (escalation rules, tone, touchpoint template, priority order)
- `../config/checklists/{role}.md` (role-specific talking points and known counteroffer risk factors)
- The hire's stage record: start date, notice-period-end date, last touchpoint date (Employees DB once it exists — `../config/notion.md` — or the interim checklist-tracking doc otherwise)
- The hire's message thread (email/WhatsApp draft surface), full history, no fixed window

## Process

1. Re-query fresh: last touchpoint date, days since, and any unread message from the hire since the last check. Never assume "still fine" from memory.
2. If ≥7 days since the last touchpoint (or no touchpoint yet and notice period has started), draft the weekly touchpoint using the template in `../config/playbook.md`, personalized with one specific, warm detail — never a generic "just checking in."
3. **Screen the hire's own messages for escalation triggers before drafting anything back:** any mention of compensation, a competing offer, hesitation about joining, timeline flexibility asks, or policy questions. If found, stop drafting a reply — follow `../config/playbook.md` § Escalation instead: post the flag to #people and wait for a human. This is the single most important check this skill performs; a missed counteroffer signal is a lost hire.
4. If the role's checklist flags this role as higher counteroffer risk, note that explicitly in the summary shown to the operator, and prefer a touchpoint over silence when in doubt about cadence.
5. Present the draft (or the escalation) via the standard `d) draft  s) send  e) edit  ?) something else` prompt. Never send without approval — this action-class is L0 (see `../config/agent.md`).
6. After the operator acts, update the tracking record's last-touchpoint date and note.

## Output contract

One line stating what was checked (last touchpoint date, message screen result), then either: a drafted touchpoint message awaiting the standard approval prompt, or an escalation notice already posted to #people with drafting explicitly withheld pending a human.

## Failure behavior

- Any ambiguity about whether a hire's message constitutes a comp/offer/policy question → treat it as one and escalate; false positives cost a Slack post, false negatives cost a hire.
- No last-touchpoint date on record (new handoff, first cycle) → treat as overdue and draft the first touchpoint rather than waiting for an assumed baseline.
- Employees DB gate not yet cleared → state that the source of record is the interim checklist doc, not Notion, and proceed on that basis rather than blocking the whole check-in.
