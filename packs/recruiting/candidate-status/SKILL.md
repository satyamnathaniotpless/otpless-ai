---
name: candidate-status
description: |
  One command, one candidate: full cross-referenced state from Notion, Gmail, Calendar, and
  drafts, re-queried fresh every time. Use when the user says "status on {candidate}", "where's
  {candidate}", "what's happening with {candidate}", or asks about a specific person's pipeline state.
---

# Candidate status (F8)

Purpose: answer "where does this one candidate stand, right now" by re-querying every source fresh and cross-referencing them — never from memory, never conflating an invite sent with an invite accepted.

## Trigger

"status on {candidate}", "where's {candidate}", "what's happening with {candidate}", "catch me up on {candidate}", or a name/handle mentioned with an implicit status ask during triage drill-down.

## Inputs

- `../config/playbook.md` (split-brain rule, pre-flight checklist, "what to say when you don't know" table)
- `../config/notion.md` (Applicants DB properties, stage values)
- Notion Applicants data source (the one row matching the candidate)
- Gmail (candidate's thread — inbox + sent, no fixed window; pull the full thread history)
- Gmail drafts (any draft against that thread)
- Calendar (events with that candidate as attendee, past + future)

## Process

1. Resolve the candidate name/handle to exactly one Notion Applicants row. Match on name (and email if given) — never guess from a partial match.
   - **Ambiguous name** (more than one row matches): stop and list the candidates found (name + role + stage) for the operator to disambiguate. Do not guess which one was meant.
   - **Not found**: say so explicitly — "No Applicants row matches {name}" — and ask whether the spelling or role narrows it, rather than presenting a partial answer for someone else.
2. Once resolved to one row, re-query fresh, in parallel, per the pre-flight checklist in `../config/playbook.md`:
   - Notion Applicants row: stage, owner, flags, notes, stage-change timestamp.
   - Gmail: full thread with this candidate (inbox + sent) — latest message direction, date, and one-line content summary.
   - Gmail drafts: any draft queued against this thread.
   - Calendar: any event with this candidate as attendee — time, and attendee `responseStatus` exactly as returned.
3. Cross-reference the four sources into one picture. Never merge or infer across them — if Notion says "Intro call" but Calendar shows no event, say both facts, don't reconcile silently.
4. Report `responseStatus` literally: `accepted` = confirmed; `needsAction` = "invite sent, not yet accepted." Never state a candidate is "scheduled" or "confirmed" from an event's existence alone — only from `accepted`.
5. If any single source can't answer part of the picture (e.g. no calendar event, no draft pending, thread empty), state that explicitly per source rather than omitting it or inferring a value.
6. If the operator wants to act on what's shown (draft a reply, schedule, reject), hand off to the matching sub-skill (`../reply`, `../schedule`, `../reject`) — this skill never drafts or sends itself.

## Output contract

Opens with `Checked: Notion (1 row), Gmail (full thread), Calendar (all events), Drafts` (or notes what was skipped and why). Then, per source:

```
Notion:    Stage — Owner — Flags — last updated {date}
Gmail:     Last message {direction, date} — "{one-line summary}"
Calendar:  {event title, time} — responseStatus: {accepted | needsAction} (or "none scheduled")
Drafts:    {pending draft summary} (or "none pending")
```

Close with one line of cross-referenced state in plain language, without conflating any of the above (e.g. "Notion shows Intro call stage; invite sent for Tue 6pm but not yet accepted; no draft pending").

## Failure behavior

- Two or more Notion rows match the name: list them (name, role, stage) and ask which one — never pick for the operator.
- No row matches: state "not found" explicitly and ask for a narrower name/role rather than guessing.
- Any single source unreachable or empty: name it in the output ("Calendar: none scheduled" vs "Calendar: unavailable — could not query") rather than silently dropping that line.
- Never answer from a table built earlier in the session — re-query all four sources every time this skill runs, even if checked minutes ago.
