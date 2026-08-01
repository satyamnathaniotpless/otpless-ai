<!-- Purpose: the People-Ops agent's scoreboard — real numbers from docs/PRD_People_Department_Agents.md §9, instantiating packs/shared/config/goals.md.example (ADR-005: data, not process). -->

# Goals config: People-Ops agent

## Owned numbers

| Metric | Target | Window | Source of truth |
|---|---|---|---|
| Policy-answer accuracy | ≥ 95% | Spot audit, monthly | Master PRD §9; audit performed by accountable human against `../policy-qa` answer log |
| Policy questions answered without a citation | 0 (zero — every answer either cites an Approved doc or refuses, per `../policy-qa/SKILL.md`) | Continuous | `../policy-qa` output review |
| Payroll inputs missed vs. cutoff | 0 missed cutoffs | Per payroll cycle | `../payroll-prep/SKILL.md` packet + accountable human confirmation |
| Lifecycle/ops events handled within SLA | 100% | Rolling | Master PRD §2 goal 3 — letters, policy Q&A, leave/attendance queries, vendor renewal flags |
| Employee deletion requests honored | ≤ 7 days, 100% | Per request | Master PRD §6, DPDP |
| Draft-acceptance rate (overall) | ≥ 80% | Rolling | Universal quality metric — tracked per action-class too, see below |
| Founder/People-Lead time on routine people-ops questions | ≤ 2h/week outside judgment calls (master PRD §9 leverage metric, department-wide) | Ongoing | Manual baseline vs. current |

## Reporting cadence

| Cadence | What | Where |
|---|---|---|
| Daily standup | Yesterday / today / blockers / asks (see `packs/shared/standup/SKILL.md`) | #people |
| Weekly self-review | Goal-vs-actual for every owned number above, plus draft-acceptance rate per action-class | #people |

## The universal quality metric

Draft-acceptance rate: (drafts sent/executed unedited by a human) ÷ (total drafts produced), per action-class (policy Q&A response, leave/attendance query response, letter draft, payroll input packet, vendor renewal notice).

- **Quality bar:** ≥ 80% (master PRD §12.2, mirrored department-wide) — the standing target this agent is judged against week to week.
- **Trust-ladder promotion gate:** ≥ 95% sustained over the evidence window in `agent.md`'s action-class table — a *different, higher* bar than the 80% quality bar above. Meeting 80% keeps the agent in good standing; it does not by itself move an action-class up the trust ladder. Note: the policy-answer-accuracy number above (95%, monthly audit) is a *content-correctness* metric distinct from draft-acceptance (an *edit-rate* metric) — do not conflate the two when reporting.

## When behind target

Per the `standup` skill, a flag with no proposed action is an incomplete self-review. Every owned number trailing target gets a proposed fix in the weekly self-review — e.g. "Payroll input packet missed the cutoff flag by 1 day this cycle because the joiner's HRMS record wasn't complete — I've added a 3-day-earlier pre-check to `payroll-prep`'s process, approve the config change?"
