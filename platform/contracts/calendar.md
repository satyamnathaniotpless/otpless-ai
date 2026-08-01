<!-- Purpose: contract between recruiting skills and Google Calendar — scheduling — so no skill ever infers "scheduled" from anything but the real attendee response field. -->

# Contract: Google Calendar

## Purpose

Availability, event creation, and confirmation state for candidate scheduling (PRD §6, F5).

## What we read

- `list_calendars`: the agent's own calendar and any interviewer calendars it has access to.
- `list_events` / `search_events`: existing events in the proposal window (F1: next 7 days; F5: before proposing any block).
- `get_event`: attendee `responseStatus` for a specific event (F5, F8).
- `suggest_time`: candidate free/busy slots within a block.

## What we write

- `create_event`: new candidate-facing events, template titles/descriptions, meet link from `user.md` (F5).
- `update_event`: reschedules.
- `respond_to_event`: the agent's own RSVP where applicable.
- `delete_event`: cancellations — treated as an external-visible action, same L0 approval gate as creating an event with an external attendee (`command-policy.md` §2), never auto-executed.

## Field & name mapping

Candidate-facing titles never contain "interview"/"screen" — use the title template `{Candidate Name} × {Operator Name}` (PRD §6), where the operator name is pulled from the Operators table in `packs/recruiting/config/user.md`, never hardcoded here (ADR-005: the rule lives in the contract, the value lives in config). Timezone Asia/Kolkata always. Meet link, office address, and default scheduling blocks live in `user.md`. Interviewer list (name/email/role) also in `user.md`.

## Staleness & re-query semantics

Re-check Calendar before proposing any block and before every `/schedule` or `/candidate-status` call — never assume a slot is still free from earlier in the session.

**Canonical staleness rule:** report scheduling state from attendee `responseStatus` only. `needsAction` = "invite sent, not yet accepted." `accepted` = confirmed. These are never conflated — "invite sent" is not "scheduled" (PRD §8 guardrail 3). If the event or attendee record can't be fetched at all, that is *unknown* ("Calendar: couldn't check"), distinct from `needsAction`.

## Write verification

After `create_event`/`update_event`, call `get_event` (or `list_events`) to re-fetch and confirm title, time, and attendee list match what was written before reporting the event as scheduled.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Calendar unavailable | Do not guess free/busy; tell the operator to check manually before proposing times |
| Rate-limited | Back off, retry once; report partial availability labeled incomplete |
| Permission-denied | Halt, escalate as a Calendar grant issue |
| Ambiguous result (`suggest_time` returns multiple equally-valid slots, or multiple events match a search) | Present all options to the operator; never auto-pick |

## Capability gaps today

No way to generate or verify a live video-conferencing link through this MCP — the meet link is a static value pulled from `user.md` config, not created per-event. If per-event unique links are ever required, that's an MCP extension, not a config workaround.

## Credentials required

- OAuth token for the recruiting agent's own calendar (`recruiting@otpless.com`) — provided by: CTO (Google Workspace admin) — gate G5, `docs/gates.md`.
