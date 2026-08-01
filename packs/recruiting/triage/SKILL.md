---
name: triage
description: |
  Start-of-day scan across Notion Applicants, Gmail, Calendar, and drafts. Categorizes what
  needs attention in priority order and presents counts, Q&A-driven. Use when the user says
  "triage", "what do I need to deal with", "what's going on", or "morning digest".
---

# Triage (F1)

## Trigger

"triage", "what's in my inbox", "what do I need to deal with today", "start of day", or the daily 8:30 IST digest (see `../recruit-watch`).

## Inputs

- `../config/playbook.md` (interaction loop, priority order, pre-flight checklist)
- `../config/notion.md` (Applicants DB properties, stage values)
- `../config/user.md` (operator identity)
- Notion Applicants data source, Gmail (3d inbox + 14d sent + drafts), Calendar (7d)

## Process

1. Re-query fresh (never from memory, per the split-brain rule in `../config/playbook.md`): Notion Applicants (all stages, all roles), Gmail inbox (3d), Gmail sent (14d), Gmail drafts, Calendar (7d).
2. Categorize every candidate/item into exactly one bucket, priority order:
   1. Scheduling — confirmed times needing invites; proposals needing a pick
   2. Pipeline decisions — post-call/post-work-sample verdicts pending
   3. Work-sample reviews due
   4. Candidate Q&A unanswered
   5. New applications to review
   6. Outreach follow-ups due (3-day and 7-day silence rules)
3. Present counts + top items only per category (summary, not a full table) — Q&A-driven, never a firehose.
4. Ask which category the operator wants to focus on.
5. On pick, re-query that category's sources fresh again, then hand off to the matching sub-skill (`../review-applicants`, `../reply`, `../schedule`, etc.) for the detailed table and action.
6. This skill never drafts or sends itself — any action always goes through the sub-skill's own `d) draft  s) send  e) edit  ?) something else` prompt before anything is written.

## Output contract

Opens with `Checked: Notion (all), Gmail (3d/14d), Calendar (7d), Drafts` (or notes what was skipped and why). Then the 6-category summary table with counts. No candidate with an email unanswered >24h may be missing from the list.

## Failure behavior

If a source is unreachable, note it explicitly in the header ("Skipped: Calendar — unavailable") and proceed with the rest rather than blocking. Never present a summary without stating what was checked. Update the Notion row after every action taken during drill-down.
