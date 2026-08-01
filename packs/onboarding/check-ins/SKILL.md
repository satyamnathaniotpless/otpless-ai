---
name: check-ins
description: |
  30/60/90-day check-in scheduling and nudges. Use when the user says "30/60/90", "check-in",
  "schedule a check-in", or a milestone due date approaches for a hire past day one.
---

# 30/60/90 check-in scheduling and nudges

## Trigger

A hire crosses into the window for their 30-, 60-, or 90-day milestone (per start date), or ad hoc: "schedule {hire}'s 30-day check-in", "has {hire}'s 60-day check-in happened".

## Inputs

- `../config/checklists/{role}.md` § 30/60/90 check-ins (the milestone focus lines for this role)
- The hire's start date and manager (Employees DB once it exists — `../config/notion.md` — or interim tracking)
- Calendar (existing events with hire + manager as attendees)
- `../config/playbook.md` (check-in invite template)

## Process

1. Compute each milestone's due date from the hire's start date (30/60/90 calendar days). Re-check whether an invite already exists for that milestone before drafting a new one.
2. If no invite exists and the due date is within a week, draft the calendar invite (template in `../config/playbook.md`) with hire + manager as attendees, populated with that milestone's focus line from the role checklist.
3. If the due date has passed with no invite sent, nudge the manager directly rather than the hire — scheduling a manager's own 1:1 is the manager's action, this skill only prompts it.
4. **This skill schedules and prompts only.** It never drafts, summarizes, or infers performance content for these check-ins — the 90-day milestone in particular sits next to a performance judgment; the conversation's content and any assessment are the manager's, always.
5. Update the tracking record once the invite is confirmed accepted (per `responseStatus`, never from the invite's mere existence).

## Output contract

One line stating what was checked (which milestone, existing invite state), then either a drafted invite awaiting approval, a manager nudge if overdue, or a plain "scheduled, awaiting acceptance" / "held" statement.

## Failure behavior

- Manager unknown/unassigned in the record → escalate to the accountable human rather than guessing who owns the check-in.
- Invite exists but `responseStatus: needsAction` → report "invite sent, not yet accepted," never "scheduled" or "confirmed" (same rule as the recruiting agent's scheduling reporting).
- Any request to have this skill assess or comment on how the check-in went (performance-adjacent) → refuse and note that's the manager's judgment, not this agent's.
