---
name: headcount
description: |
  Current headcount and incoming (pipeline) count, company-wide and by team/role, from the
  Employees DB. Use for "what's our headcount", "how many people do we have", "headcount by
  team", or as a section of the weekly/monthly People report.
---

# Headcount

## Trigger

"headcount", "how many people do we have", "headcount by team", or invoked by `../report` as a section.

## Inputs

- `packs/onboarding/config/notion.md` (Employees DB field shape, Lifecycle stage values — canonical, not restated here) and `platform/contracts/notion-employees.md` (the contract).
- Notion Employees DB, re-queried fresh, once it exists (gate G16, `docs/gates.md`).
- `../config/metrics.md` (headcount definition, small-N threshold).

## Process

1. State plainly whether the Employees DB exists yet. If gate G16 hasn't cleared, this skill runs against synthetic fixtures only and says so in its output — it never presents a fixture-derived number as if it were real.
2. Re-query the Employees DB fresh, full pull.
3. Compute headcount per `../config/metrics.md`'s definition: rows at Lifecycle stage `Day one` / `30-day` / `60-day` / `90-day` / `Steady state`. Compute incoming (pipeline) count separately: rows at `Offer accepted` / `Notice period` / `BGV` / `Pre-boarding`. Never blend the two into one figure.
4. Cut by Role/team if asked or if the report's section calls for it.
5. **Apply the small-N gate**: any team/role cut below `../config/metrics.md`'s threshold is suppressed before output is composed. Company-wide totals are essentially never below threshold and are shown normally.

## Output contract

Opens with `Checked: Notion Employees DB ({connected | not yet connected — gate G16, running on synthetic fixtures})`. Then: headcount (company-wide, and by team/role where n clears threshold), incoming/pipeline count (same cut). Any cut below the small-N threshold reads `below reporting threshold`. Never lists individual names, even for a team of one (that team's row reads `below reporting threshold`, not "1 person: {name}").

## Failure behavior

- Employees DB unreachable (post-gate) → "Notion Employees DB: couldn't check," exclude from the count rather than reporting a stale or zero figure.
- Employees DB doesn't exist yet (pre-gate) → state that plainly, run on synthetic fixtures, never present a fixture number as real.
- A row has an ambiguous or missing Lifecycle stage → exclude it from both headcount and incoming count, and state the excluded count explicitly rather than guessing which bucket it belongs in.
