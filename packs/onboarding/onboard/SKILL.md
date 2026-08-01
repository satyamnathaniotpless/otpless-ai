---
name: onboard
description: |
  Onboarding co-pilot entry point. Routes to the right sub-skill based on what the operator
  asks — status, notice-period warmth, BGV, paperwork, provisioning, day-one, buddy, check-ins,
  or watch. Use when the user says "onboard", "onboarding", "new hires", "who's joining", or any
  onboarding request that doesn't name a specific sub-skill.
---

# Onboard — router

Entry point for all onboarding work (offer-accept through day 90, master PRD §4). Does not do the work itself — dispatches to the sub-skill that does, then gets out of the way.

## Trigger

"onboard", "onboarding", "new hires", "who's joining", "what's going on with onboarding", or any onboarding ask that doesn't clearly match one sub-skill below.

## Inputs

- The operator's request (free text).
- `../config/playbook.md` and `../config/user.md` for process rules and operator identity.

## Process

1. Read `../config/playbook.md` and `../config/user.md` once per session (skip if already read this session).
2. Match the request against the dispatch table below. If ambiguous, ask which the operator means rather than guessing.
3. Invoke the matched sub-skill. Do not duplicate its logic here — every sub-skill re-queries its own sources fresh and gates any write behind its own `d) draft  s) send  e) edit  ?) something else` prompt; the router never skips that gate on its behalf.
4. If the request names a specific hire with no clear verb ("what about Priya?"), route to `../hire-status`.

### Dispatch table

| Operator says | Route to |
|---|---|
| "what needs attention" / "onboarding triage" / "start of day" | `../onboard-watch` |
| "status on X" / "where's X" / "what's happening with X" | `../hire-status` |
| "check in with X" / "notice period" / "counteroffer risk" | `../notice-period-warmth` |
| "BGV" / "background check" / "verification" | `../bgv` |
| "paperwork" / "documents" / "docs" | `../paperwork` |
| "devices" / "accounts" / "laptop" / "provisioning" | `../provisioning` |
| "day one" / "first day" / "day-one plan" | `../day-one` |
| "buddy" / "assign a buddy" | `../buddy-assignment` |
| "30/60/90" / "check-in" / "schedule a check-in" | `../check-ins` |
| "watch" / background monitoring ask | `../onboard-watch` |
| bare "onboard" / "go" with no specifics | `../onboard-watch` (default start-of-day view) |

## Output contract

A one-line statement of which sub-skill was invoked and why, then that sub-skill's own output. Never fabricate a table here — that's the sub-skill's job after it re-queries.

## Failure behavior

If no sub-skill clearly matches, list the dispatch table to the operator and ask them to pick — never silently default to a guess beyond the bare "onboard" case above.
