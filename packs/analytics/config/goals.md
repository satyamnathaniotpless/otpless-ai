<!-- Purpose: the People Analyst agent's scoreboard — instantiates packs/shared/config/goals.md.example (ADR-005: data, not process). -->

# Goals config: People Analyst

## Owned numbers

| Metric | Target | Window | Source of truth |
|---|---|---|---|
| Weekly People report delivered on schedule | 100% of weeks | Rolling | `./reports/weekly-people-report.md` cadence field |
| Monthly deep-dive delivered on schedule | 100% of months | Rolling | `./reports/monthly-deepdive.md` cadence field |
| Small-N suppression compliance | Zero violations — every published cell/cohort at or above the threshold in `./metrics.md`, or explicitly suppressed | Every report, no exceptions | Self-audited per `../report/SKILL.md` Process step (final check before posting) |
| Data-hygiene flags: time from detection to escalation | TODO(gate): not yet set — who: Founder / incoming People Lead, once real flag volume exists to calibrate an SLA against | Rolling | `../data-hygiene/SKILL.md` |
| Draft-acceptance rate (overall, and per action-class in `./evidence.md`) | ≥ 80% (quality bar); ≥ 95% sustained (trust-ladder promotion gate — a different, higher bar, see `packs/shared/config/goals.md.example`) | Trailing per `./evidence.md` window | qm approval log, rolled up per `packs/shared/metrics/SKILL.md` |

## Reporting cadence

| Cadence | What | Where |
|---|---|---|
| Daily standup | Yesterday / today / blockers / asks (see `packs/shared/standup/SKILL.md`) | #people |
| Weekly self-review | Goal-vs-actual for every owned number above, plus draft-acceptance rate per action-class | #people |
| Weekly People report | Aggregate funnel/source snapshot, headcount, data-hygiene flag counts, attrition-signal watch — see `./reports/weekly-people-report.md` | #people, weekly (`../report/SKILL.md`) |
| Monthly deep-dive | Full funnel + source ROI, headcount trend, comp-band drift, attrition-signal deep-dive, data-hygiene trend — see `./reports/monthly-deepdive.md` | #people, monthly (`../report/SKILL.md`) |

## The universal quality metric

Draft-acceptance rate: (drafts sent unedited by a human) ÷ (total drafts produced), per action-class (`./evidence.md`).

- **Quality bar:** ≥ 80% — the standing target this agent's work is judged against week to week.
- **Trust-ladder promotion gate:** ≥ 95% sustained over the evidence window in `./agent.md`'s action-class pointer — a *different, higher* bar than the 80% quality bar above. Meeting 80% keeps the agent in good standing; it does not by itself earn autonomy. A weekly/monthly report being aggregate-safe by construction does **not** shortcut this gate — the trust ladder promotes on measured evidence, never on a content-safety argument (see `packs/shared/trust-ladder/SKILL.md`).

## When behind target

A flag with no proposed action is an incomplete self-review (see `standup` skill). For every owned number trailing its target, propose a specific fix — not just the gap — in the weekly self-review: what you'd change, what you've already drafted toward it, and what needs human approval to act on it. A proposed fix never names a specific employee as the cause of a missed number (e.g. "attrition in the X cohort" is in scope; naming who left and why is not — see `../attrition-signals/SKILL.md`).
