---
name: offboarding
description: |
  Instantiates and tracks an offboarding checklist for a departing employee from an Approved
  exit-type template, chasing owners for completion. Use when the user says "start offboarding
  for X", "offboarding status", or an employee's lifecycle stage moves to an exit stage.
---

# Offboarding checklist orchestration

## Trigger

An employee's lifecycle stage moves to an exit-in-progress stage (Employees DB, once it exists); or ad hoc: "start offboarding for {employee}", "offboarding status for {employee}", "what's outstanding before {employee}'s last day".

## Inputs

- `../config/offboarding/{exit-type}.md` — the specific exit type's checklist and exit-interview applicability. Re-read fresh; refuse if `Status` is not `Approved`.
- The offboarding checklist record (Culture tracker, `../config/notion.md`) — per-item status for this specific employee.
- Employees DB (read-only) — last working day, manager.
- `../config/playbook.md` (priority order, escalation pattern).

## Process

1. **Identify the exit type.** If it's ambiguous which `../config/offboarding/{exit-type}.md` file applies, ask the accountable human rather than guessing — an offboarding process run under the wrong template is a real-person mistake, not a cosmetic one.
2. **Refuse if the matched template's `Status` is not `Approved`.** State plainly that no approved process exists for this exit type yet and escalate — never run a DRAFT checklist or DRAFT exit-interview question set on a real departing employee.
3. Instantiate the checklist for this employee from the template's items, each with its stated owner and due date relative to last working day.
4. Re-query completion status per item, fresh, every time. An item flips to complete only on the owning human's explicit confirmation — never inferred from a due date passing.
5. Nudge the specific owner of each item nearing its due date (IT for access/equipment, People-Ops for the final-settlement handoff, the manager for knowledge transfer) — never draft or execute the underlying action itself (this pack never revokes access, never computes a settlement figure; `packs/people-ops/payroll-prep/SKILL.md` owns that computation, this skill only tracks that the handoff happened).
6. When the checklist reaches the exit-interview item and the template marks it applicable, hand off to `../exit-interview/SKILL.md` — this skill never conducts the interview itself.
7. Update the tracking record after every confirmed item; re-read to confirm before reporting complete.

## Output contract

One line stating what was checked (template Status, items reviewed), then a per-item status table (item, owner, due, status) for the specific employee. No item may be reported complete without an explicit human confirmation behind it.

## Failure behavior

- No matching exit-type template, or the match is ambiguous → escalate to the accountable human; do not proceed on a best-guess template.
- Matched template's `Status` is `DRAFT` → refuse to instantiate a checklist against a real employee; escalate to get it approved first.
- An item's owner is unclear or unassigned → escalate rather than guessing who's responsible.
- Final-settlement item is due → confirm the handoff to People-Ops happened; never draft the figure itself even "as a placeholder," per `platform/contracts/hrms.md`'s no-agent-write rule.
