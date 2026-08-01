---
name: standup
description: Daily standup post and weekly self-review format every OTPLESS agent uses to report on its own goals, like a teammate. Use at 08:30 IST daily, and once weekly for the self-review.
---

Automation responds to requests; a teammate reports on its own numbers unasked. This skill is how every agent — regardless of department — shows its work daily and weekly.

## Trigger

- **Daily**, 08:30 IST, cron-fired: post a standup to the agent's department channel (e.g. `#hiring`, `#people`).
- **Weekly**, cron-fired (pick one fixed day per agent, documented in its `agent.md`): post a self-review against its configured goals in the same channel.

## Inputs

- The agent's `agent.md` goals table (the numbers it owns).
- Yesterday's/this week's activity: what it drafted, sent (if L1+), escalated, and any blockers hit.
- Draft-acceptance rate: (drafts sent unedited by a human) ÷ (total drafts produced), tracked per action-class — the universal quality metric across every agent regardless of department.

## Process

### Daily standup (08:30 IST)

Post a short, four-part message to the department channel:

```
Yesterday: <2-4 bullets of what actually happened — sends, drafts, escalations>
Today: <what's planned, priority order>
Blockers: <anything stuck on a human, a credential, or a trust-ladder gate — name it>
Asks: <specific asks of a human — "approve draft X", "pick a time block", "review PR #Y">
```

Keep it factual and short — this is a status post, not a report. No PII beyond the identity skill's Slack minimization rule (name + one-liner per person mentioned).

### Weekly self-review

Post against the goals table in `agent.md`:
1. State each owned number and its current value vs target.
2. For any number behind target, **propose the fix, not just the gap.** ("Security pipeline at 4 candidates, target 10. HN reply rate is 2× LinkedIn's — I've drafted 12 more HN-sourced outreach emails, approve?") A flag with no proposed action is an incomplete self-review.
3. Report draft-acceptance rate per action-class this week vs the trailing window, and call out any action-class trending toward or away from a trust-ladder gate (see `trust-ladder` skill).
4. Note any pattern already flagged for the weekly retro (see `retro` skill) so humans see it in one place.

## Output contract

- One standup message per agent per day in its department channel, posted by 08:30 IST, in the four-part format above.
- One self-review message per agent per week, containing: goal-vs-actual for every owned number, a proposed fix for every number behind target, and current draft-acceptance rate per action-class.
- Both are agent-signed per the `identity` skill.

## Failure behavior

- If the cron fires but there is genuinely nothing to report (e.g. a brand-new agent with no activity yet), still post the standup with explicit "Nothing yet" rather than staying silent — silence is indistinguishable from a dead cron to a human skimming the channel.
- If goals data is unavailable (config missing, source system unreachable), post what's known and flag the gap explicitly as a blocker rather than fabricating numbers.
- Never skip the "propose the fix" step by only listing gaps — that is a standup failure, not a shorter one.
