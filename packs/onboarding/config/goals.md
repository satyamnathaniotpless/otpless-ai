<!-- Purpose: the onboarding agent's owned-numbers scoreboard — instantiates packs/shared/config/goals.md.example (ADR-005: data, not process). -->

# Goals config: onboarding agent

## Owned numbers

| Metric | Target | Window | Source of truth |
|---|---|---|---|
| Day-one readiness (BGV clear, paperwork complete, devices/accounts ready) | 100% by start date | Per hire | Employees DB (TODO(gate): not yet built, master PRD §6) / `checklists/{role}.md` in the interim |
| Notice-period touchpoint cadence | No hire goes >7 days without a weekly touchpoint | Rolling, per hire | Checklist tracking + #people |
| BGV completion before start date | 100%, zero hires starting with BGV outstanding | Per hire | BGV status field (Employees DB, gate) |
| 30/60/90 check-ins scheduled by their due date | 100% | Per hire | Calendar |
| First 3 joiners onboarded with zero founder-driven paperwork | 3/3 (P2 exit criterion, master PRD §8) | One-time, P2 | Manual review at phase close |
| Draft-acceptance rate (overall) | ≥ 80% | Weekly | `packs/shared/metrics/SKILL.md` rollup |

## Reporting cadence

| Cadence | What | Where |
|---|---|---|
| Daily standup | Yesterday / today / blockers / asks (see `packs/shared/standup/SKILL.md`) | #people |
| Weekly self-review | Goal-vs-actual for every owned number above, plus draft-acceptance rate per action-class | #people |

## The universal quality metric

Every agent tracks **draft-acceptance rate**: (drafts sent/executed unedited by a human) ÷ (total drafts produced), per action-class.

- **Quality bar:** ≥ 80% — the standing target this agent's work is judged against week to week.
- **Trust-ladder promotion gate:** ≥ 95% sustained over the evidence window defined in `agent.md`'s action-class table — a *different, higher* bar than the 80% quality bar above. Meeting 80% keeps the agent in good standing; it does not by itself earn autonomy. Do not conflate the two numbers.

## When behind target

A flag with no proposed action is an incomplete self-review (see `standup` skill). For every owned number trailing its target, propose a specific fix in the weekly self-review — what you'd change, what you've already drafted toward it, and what needs human approval to act on it. For the notice-period touchpoint number specifically: a miss is the leading indicator of counteroffer risk (master PRD §4) — treat it as the highest-priority gap to fix, not one line among many.
