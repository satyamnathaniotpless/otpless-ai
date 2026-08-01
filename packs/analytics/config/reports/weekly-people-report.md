<!-- Purpose: the weekly People report definition — instantiates reports/_template.md (ADR-005: data, not process). -->

# Report definition: Weekly People Report

## Identity

| Field | Value |
|---|---|
| Report name | Weekly People Report |
| Audience | Leadership — Founder, CTO; later People Lead (master PRD §4 row 4) |
| Channel | #people, Slack canvas (`platform/contracts/slack.md`) |
| Cadence | Weekly, Mondays, IST — after the 08:30 IST agent standups have posted, so this report can note anything a standup already flagged rather than duplicate it. Exact cron binding is a follow-up for whoever wires `platform/deploy-layer/otpless/crons.md` at deploy time (out of this build's scope). |
| Draft-first gate | Posted as a draft (Slack canvas draft) pending human approval, per `platform/deploy-layer/otpless/command-policy.md` §2 — see `_template.md`. |

## Sections (in order)

| # | Section title | Produced by | Notes |
|---|---|---|---|
| 1 | Hiring funnel & source — week snapshot | `../../funnel-source/SKILL.md` | Lightweight: current-week pass-through and source advance-rate only, not the full trend — that's the monthly deep-dive's job |
| 2 | Headcount snapshot | `../../headcount/SKILL.md` | Current headcount + incoming (pipeline) count, company-wide and by team where n clears threshold |
| 3 | Data-hygiene flags this week | `../../data-hygiene/SKILL.md` | Counts by category only — never a row-level detail (see that skill's scope note) |
| 4 | Attrition-signal watch | `../../attrition-signals/SKILL.md` | Most weeks: "no signal this week." Only surfaces a pattern that clears both the small-N threshold and (once decided) the materiality bar in `../metrics.md` |

Comp-band drift is **not** a weekly section — bands and market benchmarks don't move week to week; see `../../comp-drift/SKILL.md`'s Trigger for why it runs monthly instead.

## Suppression check

As `_template.md` — re-verify every cell against `../metrics.md` immediately before posting.

## Failure behavior for this report

As `_template.md` — a section that can't produce fresh output posts as explicitly unavailable, never silently dropped.
