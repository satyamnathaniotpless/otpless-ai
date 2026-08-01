---
name: funnel-source
description: |
  Hiring-funnel trend and source-ROI analysis, aggregated across roles and time — the
  leadership-level view, distinct from the recruiter's own day-to-day pipeline skill (F7).
  Use for "funnel trend", "source ROI", "pass-through rates over time", or as a section of
  the weekly/monthly People report. Never for "what's happening with candidate X right now" —
  that's the recruiter's job.
---

# Funnel & source analysis

## The boundary with the recruiter's `pipeline` skill (F7) — read this first

The recruiter agent already owns operational pipeline reporting: `packs/recruiting/pipeline/SKILL.md` re-queries the Applicants DB, builds a Role × Stage grid, flags any *specific candidate* sitting >5 days in a stage, and posts it to #hiring every Monday for the people actually running that pipeline today. This skill does not duplicate that — duplicating it would give two disagreeing numbers with no way to tell which is stale.

The split is by **audience and grain**, not by data source:

- **F7 (recruiter's `pipeline`)**: operational, per-candidate, per-role, *now*. Its urgency flags (🔴 >5 days) exist to drive an action this week — reject a stale candidate, nudge an owner. Audience: the person running that pipeline. Posts to #hiring.
- **This skill (`funnel-source`)**: aggregate, cross-role, cross-time. It reports *rates and trends* — pass-through rate by stage over a quarter, whether a role's median time-in-stage is drifting, which sourcing channels convert — never a specific candidate's status. Audience: leadership, as one section of the People report. Posts to #people (via `../report`), never #hiring.

This skill never re-implements F7's per-candidate urgency flagging. If a human asks "is role Y on track today," route them to F7 (see `../router/SKILL.md`), don't answer it here even though this skill also reads the Applicants DB.

## Trigger

"funnel trend", "source ROI", "pass-through rates", or invoked by `../report` as a section of the weekly/monthly People report.

## Inputs

- `packs/recruiting/config/notion.md` (Stage values, Role values, Source values — canonical, not restated here).
- Notion Applicants data source, re-queried fresh, full pull across the report's window.
- `../config/metrics.md` (time-in-stage, source-ROI, and pass-through-rate definitions; small-N threshold).
- For the monthly deep-dive: the trailing quarter, not just the trailing month, per `../config/reports/monthly-deepdive.md`.

## Process

1. Re-query the Applicants data source fresh, full pull, all roles, all stages, filtered to the report's window (or trailing quarter for the deep-dive).
2. Compute pass-through rate per stage transition, per role, per `../config/metrics.md`'s formula.
3. Compute aggregate time-in-stage (median + mean) per role × stage cohort — never per candidate; that number belongs to F7.
4. Compute source advance-rate and hire-rate per Source value, per `../config/metrics.md`. State plainly that no cost-per-source figure exists (no acquisition-cost data is available anywhere this pack reads) rather than estimating one.
5. **Apply the small-N gate** (`../config/playbook.md`): any role/stage/source cohort below `../config/metrics.md`'s threshold is suppressed before this step's output is composed — not after.
6. Compose the section: rates and trends only, cross-referencing F7 by name for anyone who wants today's operational detail rather than re-deriving it here.

## Output contract

Opens with `Checked: Notion Applicants DB (all roles, all stages, {window})`. Then: pass-through-rate table (per role × stage transition), time-in-stage trend (aggregate, per role × stage cohort), source advance/hire-rate table. Any cohort below the small-N threshold reads `below reporting threshold`. Ends with a one-line pointer: "For today's per-candidate pipeline status, see the recruiter's weekly report / `packs/recruiting/pipeline/SKILL.md`." Never contains a candidate name, a candidate-specific urgency flag, or a duplicate of F7's grid.

## Failure behavior

- Notion unreachable → "Notion Applicants DB: couldn't check," exclude the affected window from the trend rather than showing a partial or estimated figure.
- A Stage-change timestamp is missing for enough rows to distort the aggregate → state the excluded count explicitly rather than silently narrowing the sample.
- Asked to compute cost-per-source or any figure this pack has no source for → say so, do not estimate.
- Asked to reproduce F7's per-candidate urgency flags here → refuse and route to `packs/recruiting/pipeline/SKILL.md` instead, per the boundary above.
