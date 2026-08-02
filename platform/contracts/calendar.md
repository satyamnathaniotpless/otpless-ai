<!-- Purpose: contract between recruiting skills and Google Calendar — scheduling — so no skill ever infers "scheduled" from anything but the real attendee response field. -->

# Contract: Google Calendar

## Purpose

Availability, event creation, and confirmation state for candidate scheduling (PRD §6, F5).

## Mechanism

Reached through qm's **Google connector** (`platform/contracts/README.md` "How a contract reaches its system") — the same connector `gmail.md` uses, registered once for Google Workspace as a whole. Confirmed registered (Admin-UI step) on the OTPLESS deployment; whether the recruiting agent's own identity (`recruiting@otpless.com`) has completed the second, individual connection step at `/keychain` is unverified — confirm at deploy time before assuming any read/write below is callable. Once connected, the agent is handed whatever Calendar-capability tools the connector exposes — this contract states the operations we need, not a tool name; where a name would matter it is called out as unverified rather than invented.

## What we read

- List calendars: the agent's own calendar and any interviewer calendars it has access to.
- List or search events: existing events in the proposal window (F1: next 7 days; F5: before proposing any block).
- Fetch an event: attendee `responseStatus` for a specific event (F5, F8).
- Suggest a time: candidate free/busy slots within a block.

## What we write

- Create an event: new candidate-facing events, template titles/descriptions, meet link from `user.md` (F5).
- Update an event: reschedules.
- Respond to an event: the agent's own RSVP where applicable.
- Delete an event: cancellations — treated as an external-visible action, same L0 approval gate as creating an event with an external attendee (`command-policy.md` §2), never auto-executed.

## Field & name mapping

Candidate-facing titles never contain "interview"/"screen" — use the title template `{Candidate Name} × {Operator Name}` (PRD §6), where the operator name is pulled from the Operators table in `packs/recruiting/config/user.md`, never hardcoded here (ADR-005: the rule lives in the contract, the value lives in config). Timezone Asia/Kolkata always. Meet link, office address, and default scheduling blocks live in `user.md`. Interviewer list (name/email/role) also in `user.md`.

## Staleness & re-query semantics

Re-check Calendar before proposing any block and before every `/schedule` or `/candidate-status` call — never assume a slot is still free from earlier in the session.

**Canonical staleness rule:** report scheduling state from attendee `responseStatus` only. `needsAction` = "invite sent, not yet accepted." `accepted` = confirmed. These are never conflated — "invite sent" is not "scheduled" (PRD §8 guardrail 3). If the event or attendee record can't be fetched at all, that is *unknown* ("Calendar: couldn't check"), distinct from `needsAction`.

## Write verification

After creating or updating an event, re-fetch it (or re-list events) to confirm title, time, and attendee list match what was written before reporting the event as scheduled.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Calendar unavailable | Do not guess free/busy; tell the operator to check manually before proposing times |
| Connector registered but not connected (agent's identity hasn't completed the `/keychain` step) | Halt, report "Calendar: not connected," escalate as an onboarding/connection step — distinct from "unreachable" |
| Rate-limited | Back off, retry once; report partial availability labeled incomplete |
| Permission-denied | Halt, escalate as a Calendar grant issue |
| Ambiguous result (a time-suggestion returns multiple equally-valid slots, or multiple events match a search) | Present all options to the operator; never auto-pick |

## PII handling

An event's attendee list is itself PII: it reveals which candidate is interviewing, with which interviewers, at what stage — and, for internal calendars, an interviewer's schedule and workload. An invite is visible to every party on it: the candidate sees who else is listed, and every interviewer sees the candidate's name and email — there is no private field on a calendar invite the way there is on a Notion property.

This is why the title rule in "Field & name mapping" is a PII control, not a style preference: a candidate-visible title never contains "interview"/"screen" or any other word that outs the process to someone who sees the candidate's calendar over their shoulder (current employer, family). Attendee lists, event descriptions, and titles never enter Slack beyond what F5/F8 already report — name + stage-status one-liner, per `packs/shared/identity/SKILL.md` §8 — never the full attendee list, never an interviewer's other bookings. None of it enters git or a fixture; fixtures use synthetic candidates and interviewers. Cancelling or rescheduling a candidate-facing event is already gated as an external-visible action (`command-policy.md` §2, see "What we write") in part for this reason — a change to who's on an invite is a change to who knows what about whom.

## Capability gaps today

No confirmed way to generate or verify a live video-conferencing link through this connector — the meet link is a static value pulled from `user.md` config, not created per-event. Whether the Google connector's Calendar integration can create a per-event unique link is unverified; if per-event unique links are ever required, confirm that capability first, and if absent, extend it (connector or a scoped sandbox tool) — never a config workaround pretending the link is unique.

## Credentials required

Two separate steps, per the connector model (`platform/contracts/README.md`):

- **Admin client registration** — the Google OAuth client id/secret entered at `/admin/connectors`. Confirmed done on the OTPLESS deployment. Provided by: CTO (Google Workspace admin) — gate G5, `docs/gates.md`.
- **User connection** — the recruiting agent's own calendar (`recruiting@otpless.com`) completing the connection at `/keychain`. Whether this has happened is unverified — reconfirm at deploy time; a registered-but-unconnected connector does nothing. Provided by: CTO — gate G5, `docs/gates.md`.
