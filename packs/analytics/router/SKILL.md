---
name: router
description: |
  People Analyst entry point. Routes to the right sub-skill — the weekly/monthly report,
  funnel & source analysis, headcount, comp-band drift, attrition signals, or data hygiene —
  based on what's asked. Use when the user says "analytics", "people numbers", "the weekly
  report", "headcount", "attrition", or any analyst request that doesn't name a specific
  sub-skill.
---

# Analytics — router

Entry point for the People Analyst. Does not do the analysis itself — dispatches to the sub-skill that does, then gets out of the way.

## Trigger

"analytics", "people numbers", "the weekly report", "the monthly deep-dive", "headcount", "attrition", "comp drift", "data hygiene", or any analyst request that doesn't clearly match one sub-skill below.

## Inputs

- The requester's question (free text) — usually a human (Founder/CTO/People Lead), sometimes another agent handing off a cross-agent question.
- `../config/agent.md` and `../config/playbook.md` (priority order, structural guardrail).

## Process

1. Read `../config/agent.md` and `../config/playbook.md` once per session (skip if already read this session).
2. Match the request against the dispatch table below. If ambiguous, ask which the requester means rather than guessing — especially between `../funnel-source` (hiring-funnel trend/source ROI, this pack's job) and the recruiter's own `packs/recruiting/pipeline/SKILL.md` (F7 — today's operational pipeline view, a different agent's job); see `../funnel-source/SKILL.md` for the boundary and route a same-day operational question there instead.
3. Invoke the matched sub-skill. Do not duplicate its logic here — every sub-skill re-queries its own sources fresh and applies the structural aggregate-only / small-N gate (`../config/playbook.md`) on its own; the router never composes a number itself.

### Dispatch table

| Requester says | Route to |
|---|---|
| "the weekly report" / "the monthly deep-dive" / "run the People report" | `../report` |
| "funnel" / "source ROI" / "where are candidates coming from" / "pass-through rates" (trend/aggregate, not today's queue) | `../funnel-source` |
| "what's our headcount" / "how many people do we have" / "headcount by team" | `../headcount` |
| "comp band drift" / "are we competitive on comp" (bands vs market, never an individual) | `../comp-drift` |
| "attrition" / "are we seeing a pattern in who's leaving" | `../attrition-signals` |
| "data hygiene" / "is our data clean" / "any duplicate rows" | `../data-hygiene` |
| "what's happening with candidate X right now" / "is role Y's pipeline on track today" | Not this pack — route to the recruiter's `packs/recruiting/pipeline/SKILL.md` (F7); this agent doesn't run day-to-day pipeline ops |
| bare "analytics" / "go" with no specifics | List the categories above with counts where available, ask what to focus on |

## Output contract

A one-line statement of which sub-skill was invoked and why, then that sub-skill's own output. Never fabricates a number, a table, or an attrition/comp claim here — that is always the matched sub-skill's job, after it re-queries its own sources and passes the structural guardrail gate.

## Failure behavior

If no sub-skill clearly matches, list the dispatch table and ask the requester to clarify — never silently guess between `../funnel-source` and the recruiter's `pipeline` skill, and never answer a numbers question directly here instead of routing it (this router has no authority to compute or cite a metric itself).
