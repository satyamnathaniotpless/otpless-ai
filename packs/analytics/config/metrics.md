<!-- Purpose: every metric definition and the small-N suppression threshold this pack's skills read — never hardcoded in a SKILL.md (ADR-005: data, not process). -->

# metrics.md — metric definitions and small-N threshold

Every skill in this pack reads its numbers, formulas, and thresholds from here. If a skill's Process section is about to state a number or a formula that isn't defined below, that is a bug in the skill, not a shortcut to take — add the definition here first.

## Small-N suppression threshold

**Default: 5.** This is the number of distinct people a cell, cohort, or breakdown must represent before it may be published with a real value, in any output this pack produces (a report, a Slack answer, a standup line — everywhere).

- Below 5: the cell is **suppressed**, not caveated. The output states `below reporting threshold` and nothing else for that cell — no number, no range, no direction ("up" or "down"), no partial figure, no list of who's in it. A caveated small number still deanonymizes (three people on a team and one dissenting data point identifies the dissenter) — suppression is the only safe behavior, per this pack's brief.
- This is a **decision the founder can raise, never lower.** Raising it (e.g. to 8 or 10 for a specific sensitive breakdown) is a config change here; no skill or agent may lower it below 5 for any reason, including "just this once for a clearer report."
- The threshold applies per **breakdown**, not per overall metric: e.g. company-wide headcount (n well above 5) is never suppressed, but a headcount-by-team cut where one team has 3 people is suppressed for that team's row while the rest of the table publishes normally.
- Applies to every skill that produces leadership-facing or reporting output: `../funnel-source`, `../headcount`, `../comp-drift`, `../attrition-signals`. Does **not** apply to `../data-hygiene`'s internal fix-it escalation to the record-owning agent/accountable human (row-level, not leadership-facing — see that skill's own scope note) — that escalation is governed by the existing Notion/HRMS contract PII rules instead, which this pack does not loosen.

## Hiring funnel & source metrics

- **Funnel stages**: the Applicants DB Stage values in `packs/recruiting/config/notion.md` (`Applied → Pre-screen pass → Intro call → Work sample → Onsite → Offer → Hired`, or `Rejected` at any point). This pack never invents a stage name of its own.
- **Time-in-stage (aggregate)**: median and mean calendar days a *cohort* (role × stage, over the report's window) has spent in that stage, computed from the Notion Stage-change timestamp. This is a different statistic from the recruiter's `pipeline` skill (F7), which reports a *specific candidate's* current days-in-stage to flag it for action — see `../funnel-source/SKILL.md` for the boundary.
- **Source ROI**: for a given Source value (`packs/recruiting/config/notion.md` Source values) and window, `advances_from_source ÷ applicants_from_source` (advance rate) and `hires_from_source ÷ applicants_from_source` (hire rate). No cost-per-source figure is computed — no source-acquisition-cost data exists in any system this pack reads; do not estimate one.
- **Pass-through rate**: `count_at_stage_N ÷ count_at_stage_N-1`, per role, per window.

## Headcount

- **Headcount**: count of Employees DB rows (once it exists, gate G16) whose Lifecycle stage (`packs/onboarding/config/notion.md`) is one of `Day one`, `30-day`, `60-day`, `90-day`, `Steady state` — i.e. people who have actually joined. Rows at `Offer accepted`, `Notice period`, `BGV`, or `Pre-boarding` are **pipeline**, reported separately as "incoming headcount," never blended into the headcount figure itself.
- **Headcount by team/role**: same definition, cut by the Employees DB `Role` property — subject to the small-N threshold above per cut.

## Comp-band drift

- **Comp-band drift**: for a role's published band (`packs/recruiting/config/jobs/<role>.md`, e.g. `packs/recruiting/config/jobs/backend.md`) and an external market-data point for the equivalent role/level, the percentage difference between the band's midpoint and the market figure. Reported at the **band level only** — this metric never reads, references, or restates an individual employee's actual compensation (the Employees DB `Comp / ESOP` field is out of scope for this pack, full stop; see `../comp-drift/SKILL.md`).
- **Market-data source**: TODO(gate): not yet chosen — who: Founder / incoming People Lead, a compensation-survey or benchmark provider decision (vendor/spend, same category as the HRMS provider decision, gate G14). No skill in this pack invents a market figure in the meantime — `../comp-drift/SKILL.md` reports "no market source configured" rather than a guessed number.

## Attrition signals

- **Attrition signal**: a pattern in aggregate data only — tenure-distribution clustering (e.g. a concentration of exits within a specific tenure window), exit-reason category clustering (from whatever structured exit-reason field the eventual offboarding process records, categories only, never free text), or stage-time drift trending as a leading indicator. Never a claim about a named person's intent to leave, satisfaction, or performance — see `../attrition-signals/SKILL.md`'s Process for the structural gate that enforces this.
- **Materiality bar**: a pattern is only surfaced in a report if the cohort size clears the small-N threshold above AND the pattern represents a shift from the trailing-quarter baseline (not just a single-period blip) — TODO(gate): the exact statistical shift threshold (e.g. "±1 standard deviation from trailing 4-quarter mean") is not yet decided; who: Founder / incoming People Lead, once enough quarters of real data exist to set one meaningfully. Until decided, `../attrition-signals/SKILL.md` reports raw aggregate figures with the trailing baseline shown alongside, and does not claim "signal" language for a shift it can't yet calibrate.

## Data hygiene

- **Hygiene check categories**: required-field completeness, duplicate/near-duplicate rows, cross-system field disagreement (Notion Employees DB vs HRMS, on fields both claim — see `platform/contracts/hrms.md`), and stale timestamps that block a metric above from computing. See `../data-hygiene/SKILL.md` for the full list and what each category means operationally.
