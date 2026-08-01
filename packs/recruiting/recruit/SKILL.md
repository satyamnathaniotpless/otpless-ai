---
name: recruit
description: |
  Recruiting co-pilot entry point. Routes to the right sub-skill based on what the operator
  asks — triage, review, outreach, reply, schedule, reject, pipeline, or watch. Use when the
  user says "recruit", "candidates", "hiring", "who's waiting", "pipeline", or any recruiting
  request that doesn't name a specific sub-skill.
---

# Recruit — router

Entry point for all recruiting work. Does not do the work itself — dispatches to the sub-skill that does, then gets out of the way.

## Trigger

"recruit", "candidates", "hiring", "what's going on with hiring", or any recruiting ask that doesn't clearly match one sub-skill below.

## Inputs

- The operator's request (free text).
- `../config/user.md` for operator identity and defaults.

## Process

1. Read `../config/user.md` and `../config/notion.md` once per session (skip if already read this session).
2. Match the request against the dispatch table below. If ambiguous, ask which the operator means rather than guessing.
3. Invoke the matched sub-skill. Do not duplicate its logic here — every sub-skill re-queries its own sources fresh and gates any write behind its own `d) draft  s) send  e) edit  ?) something else` prompt; the router never skips that gate on its behalf.
4. If the request names a specific candidate with no clear verb ("what about Priya?"), route to `../review-applicants` or `../schedule` based on their current Notion Stage.

### Dispatch table

| Operator says | Route to |
|---|---|
| "what's in my queue" / "triage" / "start of day" | `../triage` |
| "review applicants" / "who applied" / "new inbound" | `../review-applicants` |
| "reach out to X" (no prior contact) | `../outreach` |
| "reply to X" / "draft for X" (existing thread) | `../reply` |
| "schedule" / "find me a block" / "book calls" | `../schedule` |
| "reject X" / "pass on X" | `../reject` |
| "pipeline" / "funnel" / "weekly report" | `../pipeline` |
| "watch" / background monitoring ask | `../recruit-watch` |
| bare "recruit" / "go" with no specifics | `../triage` (default start-of-day view) |

## Output contract

A one-line statement of which sub-skill was invoked and why, then that sub-skill's own output. Never fabricate a table here — that's the sub-skill's job after it re-queries.

## Failure behavior

If no sub-skill clearly matches, list the dispatch table to the operator and ask them to pick — never silently default to a guess beyond the bare "recruit" case above.
