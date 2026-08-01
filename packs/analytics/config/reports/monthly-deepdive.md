<!-- Purpose: the monthly People deep-dive definition — instantiates reports/_template.md (ADR-005: data, not process). -->

# Report definition: Monthly People Deep-Dive

## Identity

| Field | Value |
|---|---|
| Report name | Monthly People Deep-Dive |
| Audience | Leadership — Founder, CTO; later People Lead (master PRD §4 row 4) |
| Channel | #people, Slack canvas (`platform/contracts/slack.md`) |
| Cadence | Monthly, first business day of the month, IST. Exact cron binding is a follow-up for whoever wires `platform/deploy-layer/otpless/crons.md` at deploy time (out of this build's scope). |
| Draft-first gate | Posted as a draft (Slack canvas draft) pending human approval, per `platform/deploy-layer/otpless/command-policy.md` §2 — see `_template.md`. |

## Sections (in order)

| # | Section title | Produced by | Notes |
|---|---|---|---|
| 1 | Hiring funnel & source ROI — full month/quarter trend | `../../funnel-source/SKILL.md` | Pass-through trend and source advance/hire rates over the trailing quarter, not just the month, so a one-month blip doesn't read as a trend |
| 2 | Headcount trend | `../../headcount/SKILL.md` | Quarter-over-quarter, company-wide and by team where n clears threshold |
| 3 | Comp-band drift vs market | `../../comp-drift/SKILL.md` | Band-level only; see that skill and `../metrics.md` for the market-data-source gate |
| 4 | Attrition signals — deep-dive | `../../attrition-signals/SKILL.md` | Tenure-distribution and exit-reason clustering, at the materiality bar in `../metrics.md` |
| 5 | Data-hygiene trend | `../../data-hygiene/SKILL.md` | Flag counts by category over the month, plus any flag still outstanding past its escalation SLA (`../goals.md`) |

## Suppression check

As `_template.md` — re-verify every cell against `../metrics.md` immediately before posting.

## Failure behavior for this report

As `_template.md` — a section that can't produce fresh output posts as explicitly unavailable, never silently dropped.
