---
name: anniversaries
description: |
  Detects upcoming work anniversaries from start date and drafts a congratulatory message and
  manager notification, tracking sent-state to avoid duplicates. Use when the user says
  "anniversaries", "milestones coming up", or the weekly digest cron fires.
---

# Anniversaries and milestones

## Trigger

Weekly, cron-fired, scanning every employee's start date for an upcoming work anniversary within the configured lookahead window; or ad hoc: "who has an anniversary coming up", "draft the anniversary message for {employee}".

## Inputs

- Employees DB (read-only, `../config/notion.md`) — start date, manager.
- The anniversary sent-log (Culture tracker) — which milestones have already been sent, to prevent duplicates across cron runs.
- `../config/playbook.md` (tone) and `../config/agent.md` (identity/disclosure).

## Process

1. Re-query start dates fresh across every employee. Compute each employee's next work-anniversary date (1 year, 2 years, etc. from start date — this skill only tracks the **work anniversary**; it does not track birthdays or any other personal date, since none is a field this pack has access to per `../config/notion.md`'s Employees DB shape).
2. Re-check the sent-log: has this specific milestone (employee × year-count) already been sent? If yes, skip silently — do not re-draft.
3. If the milestone falls within the lookahead window and hasn't been sent, draft a short congratulatory message to the employee and a heads-up to their manager, personalized only with the milestone itself (e.g. "2 years today") — no performance content, no comparison to peers.
4. Present via the standard `d) draft  s) send  e) edit  ?) something else` prompt (action-class `anniversary_message`, L0).
5. On confirmation, write the sent-log entry (employee, milestone, date sent) and re-read to confirm it stuck before reporting done.

## Output contract

One line stating what was checked (start dates re-queried, sent-log state), then a list of upcoming milestones with drafts awaiting approval, or "already sent" for milestones already logged.

## Failure behavior

- Start date missing or unreadable for an employee → report the gap explicitly ("no start date on file for {employee}"), never guess or skip silently.
- Sent-log unreachable → do not draft, to avoid risking a duplicate send; report "Culture tracker: couldn't check, holding to avoid a duplicate."
- Any request to add a personal-date category this pack has no field for (e.g. birthdays) → decline and note it needs a new field/source added to `../config/notion.md` first, a data-source change, not something this skill can improvise around.
