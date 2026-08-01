---
name: pipeline
description: |
  Role x Stage funnel grid with urgency flags and weekly report vs targets. Use when the user
  says "pipeline", "funnel", "priorities", "full pipeline", or on Mondays for the weekly report.
---

# Pipeline & Analytics (F7)

## Trigger

"pipeline", "funnel", "priorities", "full pipeline", "weekly report" (also runs automatically Mondays via `../recruit-watch`).

## Inputs

- `../config/notion.md` (Stage values, Role values)
- Notion Applicants data source (fresh, all roles)
- Funnel targets: 150–200 sourced → 25–30 screens → 8–10 work samples → 4–5 onsites → 1–2 offers → 1 join, per role

## Process

1. Re-query the Applicants data source fresh — full pull, all roles, all stages.
2. Build a Role × Stage grid with counts.
3. Compute days-in-stage per candidate from the Notion Stage-change timestamp; flag 🔴 if >5 days.
4. Compare each role's pipeline depth to the funnel targets above; flag any role with <10 total in pipeline.
5. Compute pass-through rates, time-in-stage, source effectiveness (from Source property), and offer-accept rate.
6. On Mondays (or when asked for the weekly report), post the summary to Slack #hiring.
7. If a flag here leads to an action (reject a stale candidate, nudge an owner), hand off to the matching sub-skill — this skill never sends itself; every write still goes through that sub-skill's `d) draft  s) send  e) edit  ?) something else` prompt.

## Output contract

Grid: Role × Stage counts, urgency column (🔴 >5 days / 🟡 3-5 / 🟢 fresh). Below it: funnel-vs-target table and any role flagged for low depth. Header states `Checked: Notion (all roles, all stages)` per the split-brain rule — always re-query, never reuse a grid built earlier in the session.

## Failure behavior

If a Stage-change timestamp is missing (can't compute days-in-stage), say so per-candidate rather than omitting them from the grid. If Slack posting fails, present the report in-session anyway and note the post failed. Update the Notion row anytime this skill's drill-down produces an action (e.g. flagging a stale candidate that leads to a decision).
