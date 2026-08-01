---
name: router
description: |
  Culture & Growth entry point. Routes to the right sub-skill — pulse survey, 1:1 cadence,
  review-cycle orchestration, anniversaries, offboarding, or exit interview — based on what's
  asked. Use when the user says "culture", "growth", "people ops" (culture-side), or any request
  that doesn't name a specific sub-skill.
---

# Culture & Growth — router

Entry point for this pack. Does not do the work itself — dispatches to the sub-skill that does, then gets out of the way. Never answers a judgment-shaped question itself (see `../config/playbook.md` §The guardrail of this agent) — every judgment-adjacent request routes to a human, not to a sub-skill pretending it can help.

## Trigger

"culture", "growth", any pulse-survey/1:1/review-cycle/anniversary/offboarding/exit-interview ask that doesn't clearly match one sub-skill below; the daily 08:30 IST standup also opens with this router's summary.

## Inputs

- The requester's question or ask (free text) — may be an employee, a manager, the Founder, or a cron firing.
- `../config/playbook.md` (priority order, session startup, the guardrail section) and `../config/agent.md` (accountable human).

## Process

1. Read `../config/playbook.md` and `../config/agent.md` once per session (skip if already read).
2. Match the request against the dispatch table below. If ambiguous, ask which the requester means rather than guessing.
3. Invoke the matched sub-skill. Do not duplicate its logic here — every sub-skill re-queries its own sources fresh and gates any send behind its own `d) draft  s) send  e) edit  ?) something else` prompt (except the one immediate-escalation flag in `exit-interview`, which is not a "send" in the trust-ladder sense).

### Dispatch table

| Requester says | Route to |
|---|---|
| "send the pulse survey" / "how did the survey go" / "publish the results" | `../pulse-survey` |
| "check in on 1:1s" / "has X had their 1:1" / "who's overdue" | `../one-on-one-cadence` |
| "start the review cycle" / "who's missing their self-review" / "review status" | `../review-cycle` |
| "give me a rating for X" / "draft X's review" / "summarize the peer feedback" | **None — refuse.** State plainly this is a human's call (`../config/playbook.md` §The guardrail of this agent), do not route to `review-cycle` as if it could produce this |
| "who has an anniversary coming up" / "draft the anniversary message" | `../anniversaries` |
| "start offboarding for X" / "offboarding checklist status" | `../offboarding` |
| "schedule an exit interview" / "exit interview status" | `../exit-interview` |
| bare "culture" / "go" with no specifics | list the categories above with counts where available (priority order in `../config/playbook.md`), ask what to focus on |

## Output contract

A one-line statement of which sub-skill was invoked and why, then that sub-skill's own output. Never fabricates a status, a count, or an answer here — that is always the matched sub-skill's job, after it re-queries its own sources. A judgment-shaped ask gets a one-line refusal, not a routing attempt.

## Failure behavior

If no sub-skill clearly matches, list the dispatch table and ask the requester to clarify — never silently guess, and never answer a judgment-adjacent question directly instead of refusing (this router has no more authority to render a judgment than any sub-skill does).
