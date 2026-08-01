<!-- Purpose: the recruiting agent's scoreboard — real numbers from docs/PRD_Recruiting_System.md, instantiating packs/shared/config/goals.md.example (ADR-005: data, not process). -->

# Goals config: recruiting agent

## Owned numbers

| Metric | Target | Window | Source of truth |
|---|---|---|---|
| First response time to new applicant | < 24h, 100% of applicants | Rolling, per applicant | Notion Applicants DB + Gmail |
| Time in stage before flag | Nothing sits > 5 days in a stage without a system flag | Rolling, per candidate | Notion Applicants DB (stage-change timestamp) |
| Pipeline depth per open role | ≥ 10 candidates in pipeline | Current snapshot, per role | Notion Applicants DB |
| Funnel per role (sourced → screen → work sample → onsite → offer → join) | 150–200 sourced → 25–30 screens → 8–10 work samples → 4–5 onsites → 1–2 offers → 1 join | Per open role, tracked to close | Notion Applicants DB (`pipeline` skill weekly report) |
| Founder/CTO ops minutes per candidate | ≥ 70% reduction vs. week-1 manual baseline | Ongoing, measured against baseline | Manual baseline (week 1) vs. current |
| Offer-accept rate | ≥ 80% | Per offer extended | Notion Applicants DB |
| Weekly funnel report | Generated and posted without human effort | Weekly (Mondays, #hiring) | `pipeline` skill |

## Reporting cadence

| Cadence | What | Where |
|---|---|---|
| Daily standup | Yesterday / today / blockers / asks (see `packs/shared/standup/SKILL.md`) | #hiring |
| Weekly self-review | Goal-vs-actual for every owned number above, plus draft-acceptance rate per action-class | #hiring |
| Weekly funnel report | Role × Stage grid, funnel vs. targets, pass-through/time-in-stage/source effectiveness | #hiring, Mondays (`pipeline` skill) |

## The universal quality metric

Draft-acceptance rate: (drafts sent unedited by a human) ÷ (total drafts produced), per action-class (outreach, reply, scheduling confirmation, rejection, etc.).

- **Quality bar:** ≥ 80% (PRD §12.2) — the standing target this agent is judged against week to week.
- **Trust-ladder promotion gate:** ≥ 95% sustained over the evidence window in `agent.md`'s action-class table (PRD §12.3) — a *different, higher* bar than the 80% quality bar above. Hitting 80% keeps the agent in good standing; it does not by itself move an action-class up the trust ladder.

## When behind target

Per the `standup` skill, a flag with no proposed action is an incomplete self-review. Example from the PRD: "Security pipeline at 4 candidates, target 10. HN reply rate is 2x LinkedIn's — I've drafted 12 more HN-sourced outreach emails, approve?" Every owned number trailing target gets a proposed fix in the weekly self-review, not just a flag.
