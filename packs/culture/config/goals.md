<!-- Purpose: the Culture & Growth agent's scoreboard — instantiates packs/shared/config/goals.md.example (ADR-005: data, not process). Cadence/frequency numbers are business facts the founder/People Lead sets; none are invented here. -->

# Goals config: Culture & Growth agent

## Owned numbers

| Metric | Target | Window | Source of truth |
|---|---|---|---|
| Pulse survey cadence | TODO(gate): Founder/People Lead — how often a given survey runs (e.g. quarterly) | Per survey (`../config/surveys/{name}.md`) | Survey config |
| Pulse survey response rate | TODO(gate): Founder/People Lead — target response rate before an aggregate is considered representative (independent of the min-cell-size suppression floor, which is never a target, only a floor) | Per survey close | Culture tracker (counts only) |
| 1:1 cadence expectation | TODO(gate): Founder/People Lead — expected interval between a manager and report's 1:1s (e.g. weekly, biweekly) | Rolling, per manager-report pair | Culture tracker |
| 1:1 cadence adherence | ≥ 90% of pairs within the configured interval, once the interval above is set — placeholder pending the interval itself | Rolling | Culture tracker |
| Review-cycle on-time completion (self-review, manager-review, peer feedback, calibration scheduled) | 100% of in-scope employees by the cycle's stated deadline | Per cycle | Culture tracker (status only, never content) |
| Anniversary/milestone message sent | 100% within the configured lookahead window, no duplicates | Per employee, per milestone | Culture tracker + Employees DB start date |
| Offboarding checklist completion before last working day | 100% | Per departing employee | Culture tracker |
| Exit interview completion rate (voluntary exits) | TODO(gate): Founder/People Lead — is exit interview mandatory or opt-in for the employee; target rate depends on that policy decision | Per voluntary exit | Culture tracker |
| Peer feedback attribution mode (attributed vs. anonymous) | TODO(gate): Founder/People Lead — per-cycle decision, not a number but gates `playbook.md` §Peer feedback relay | Per review cycle | Review-cycle config |

## Reporting cadence

| Cadence | What | Where |
|---|---|---|
| Daily standup | Yesterday / today / blockers / asks (see `packs/shared/standup/SKILL.md`) | #people |
| Weekly self-review | Goal-vs-actual for every owned number above, plus draft-acceptance rate per action-class | #people |

## The universal quality metric

Draft-acceptance rate: (drafts sent/executed unedited by a human) ÷ (total drafts produced), per action-class — same definition every agent uses.

- **Quality bar:** ≥ 80% — the standing target this agent is judged against week to week.
- **Trust-ladder promotion gate:** ≥ 95% sustained over the evidence window in `../config/evidence.md` — a *different, higher* bar than the 80% quality bar above. Meeting 80% keeps the agent in good standing; it does not by itself earn autonomy. This pack has an unusually narrow set of promotable action-classes (see `evidence.md`) precisely because most of what it does is judgment-adjacent scheduling, not content generation — a low ceiling is by design, not a gap.

## When behind target

A flag with no proposed action is an incomplete self-review (see `standup` skill). For every owned number trailing its target — once the TODO(gate) values above are filled in and there is something to trail — propose a specific fix in the weekly self-review, not just the gap. Where a row above is still a `TODO(gate)`, the honest weekly report is "no target set yet for {metric}, blocked on {who}" — never a number the agent invented to have something to report against.
