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

The split is by **audience and grain, not by who computes what** — this skill is the single computation for every aggregate rate metric, full stop:

- **F7 (recruiter's `pipeline`)**: operational, per-candidate, per-role, *now* — the Role × Stage grid, urgency flags (🔴 >5 days) that drive an action this week (reject a stale candidate, nudge an owner), and pipeline depth vs. target. Audience: the person running that pipeline. Posts to #hiring. F7 does **not** independently compute pass-through rate, time-in-stage, source effectiveness, or offer-accept rate — it cites this skill's most recent figures (naming this skill and its window) in that same #hiring post. See `packs/recruiting/pipeline/SKILL.md` for the citation mechanics.
- **This skill (`funnel-source`)**: the sole owner of pass-through rate, time-in-stage (aggregate), source effectiveness, and offer-accept rate — defined once in `../config/metrics.md`, computed once here, for every audience that needs them. Aggregate, cross-role, cross-time: rates and trends — pass-through rate by stage over a quarter, whether a role's median time-in-stage is drifting, which sourcing channels convert, offer-accept rate — never a specific candidate's status. Composed as its own section of the People report (`../report`, #people) *and* the figure set F7 cites in its Monday #hiring post — one computation, two audiences.

This skill never re-implements F7's per-candidate urgency flagging, and F7 never re-implements this skill's rate math. If a human asks "is role Y on track today," route them to F7 (see `../router/SKILL.md`), don't answer it here even though this skill also reads the Applicants DB.

## Trigger

"funnel trend", "source ROI", "pass-through rates", or invoked by `../report` as a section of the weekly/monthly People report.

## Inputs

- `packs/recruiting/config/notion.md` (Stage values, Role values, Source values — canonical, not restated here).
- Notion Applicants data source, re-queried fresh, full pull across the report's window.
- `../config/metrics.md` (time-in-stage, source-ROI, pass-through-rate, and offer-accept-rate definitions — the single source for every metric this skill and F7's `#hiring` post cite; small-N threshold).
- For the monthly deep-dive: the trailing quarter, not just the trailing month, per `../config/reports/monthly-deepdive.md`.

## Process

1. Re-query the Applicants data source fresh, full pull, all roles, all stages, filtered to the report's window (or trailing quarter for the deep-dive).
2. Compute pass-through rate per stage transition, per role, per `../config/metrics.md`'s formula.
3. Compute aggregate time-in-stage (median + mean) per role × stage cohort — never per candidate; that number belongs to F7.
4. Compute source advance-rate and hire-rate per Source value, per `../config/metrics.md`. State plainly that no cost-per-source figure exists (no acquisition-cost data is available anywhere this pack reads) rather than estimating one.
5. Compute offer-accept rate per role, per `../config/metrics.md`'s formula — the fourth metric F7's Monday `#hiring` post cites from this skill.
6. **Apply the small-N gate** (`../config/playbook.md`): any role/stage/source/offer cohort below `../config/metrics.md`'s threshold is suppressed before this step's output is composed — not after.
7. Compose the section: rates and trends only, cross-referencing F7 by name for anyone who wants today's operational detail rather than re-deriving it here. This composed output — with its window stated — is what F7 cites verbatim in its own post; it is never recomputed a second time by F7.

## Output contract

Opens with `Checked: Notion Applicants DB (all roles, all stages, {window})`. Then: pass-through-rate table (per role × stage transition), time-in-stage trend (aggregate, per role × stage cohort), source advance/hire-rate table, offer-accept-rate table (per role). Any cohort below the small-N threshold reads `below reporting threshold`. Ends with a one-line pointer: "For today's per-candidate pipeline status, see the recruiter's weekly report / `packs/recruiting/pipeline/SKILL.md`." Never contains a candidate name, a candidate-specific urgency flag, or a duplicate of F7's grid. This output, with its `{window}`, is the figure set F7 names and cites in its own Monday `#hiring` post.

## Failure behavior

- Notion unreachable → "Notion Applicants DB: couldn't check," exclude the affected window from the trend rather than showing a partial or estimated figure.
- A Stage-change timestamp is missing for enough rows to distort the aggregate → state the excluded count explicitly rather than silently narrowing the sample.
- Asked to compute cost-per-source or any figure this pack has no source for → say so, do not estimate.
- Asked to reproduce F7's per-candidate urgency flags here → refuse and route to `packs/recruiting/pipeline/SKILL.md` instead, per the boundary above.
