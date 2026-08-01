<!-- Purpose: blank recurring-report definition — copy this file to add a new report; the `report` skill is generic process, this is the data that makes it a specific report (ADR-005). -->

# Report definition: {report-name}

Copy this file to `{report-name}.md` in this directory and fill every field. A new recurring People report is this one file — no new skill code.

## Identity

| Field | Value |
|---|---|
| Report name | {e.g. "Weekly People Report"} |
| Audience | {e.g. "Leadership — Founder, CTO; later People Lead"} |
| Channel | {e.g. "#people, Slack canvas"} — per `platform/contracts/slack.md` |
| Cadence | {e.g. "Weekly, Mondays" or "Monthly, first business day"} — the actual cron binding happens in `platform/deploy-layer/otpless/crons.md` at deploy time; state the intended cadence here, don't invent a cron ID |
| Draft-first gate | Every posting of this report is a draft (Slack message/canvas draft) pending human approval, per `platform/deploy-layer/otpless/command-policy.md` §2 — regardless of how safe the (aggregate) content is. Content safety never substitutes for trust-ladder evidence. |

## Sections (in order)

One row per section; each section is produced fresh by the named skill every time this report runs — never carried over from a prior run.

| # | Section title | Produced by | Notes |
|---|---|---|---|
| 1 | {e.g. "Hiring funnel & source"} | `../../{skill-dir}/SKILL.md` | |
| {add rows} | | | |

## Suppression check

Before assembly is considered complete, re-verify every cell against `../metrics.md`'s small-N threshold, even though each section skill already did so — this is the final gate, not a redundant one (a section could be hand-edited between generation and assembly in a future workflow; the check must not assume it wasn't).

## Failure behavior for this report

If a named section's skill cannot produce fresh output (source unreachable, gate not yet cleared), the report still posts with that section explicitly marked as unavailable and why — never silently drop a section.
