<!-- Purpose: this pack's own Notion/tracking-surface mapping — field shapes and gates, not a duplicate of the platform contract (ADR-005: data, not process; house rule: never invent an ID). -->

# notion.md — Culture & Growth tracking surfaces

This pack reads one existing (not-yet-built) platform object and needs one new one of its own. Neither exists today.

## What we read

**Employees DB** (person, role, manager, start date, comp, ESOP, documents status, lifecycle stage — master PRD §6) — contract at `platform/contracts/notion-employees.md`. Read-only, cross-reference only: start date (anniversaries), manager (1:1 pairs, offboarding owners), lifecycle stage (offboarding trigger). This pack never writes to the Employees DB — that stays Onboarder's write surface per the contract's "What we write" section.

**Gap to flag for the integrator:** `platform/contracts/README.md`'s index row for `notion-employees.md` already lists `culture` as a consumer, but describes this pack's access as "read/checklist-write" — that's wrong. This pack never writes to the Employees DB (read-only, as stated above); its checklist writes go to the Culture tracker, a separate Notion object (see "What we write" below) that has no contract file of its own at all. The real gap is not a missing consumer row, it's a missing contract: someone needs to write a new contract file for the Culture tracker (or fold it into an existing one) under `platform/contracts/`, and correct the README row to say `culture` scope is read-only on the Employees DB. Noted here rather than edited directly, since `platform/` is outside this build's ownership.

## What we write — the Culture tracker (new object, does not exist yet)

TODO(gate): Notion object creation + machine-user grant for this pack — who: Founder (Notion workspace admin), same shape of gate as the Employees DB (G16) and Policies wiki (G17) in `docs/gates.md`. Until it exists, every skill in this pack runs against synthetic fixtures only.

Proposed shape (this pack's own design, not live):

| Record kind | Fields | Notes |
|---|---|---|
| 1:1 log | Manager, Report, Last confirmed date, Cadence (from `../config/goals.md`, once set) | Confirmed = explicit human "done," never inferred from a calendar accept (`../config/playbook.md`) |
| Review-cycle status | Employee, Cycle, Self-review submitted (bool), Manager-review submitted (bool), Peer-feedback count (int, not content), Calibration scheduled (bool) | No free-text field exists on this record by design — there is nothing here for a skill to accidentally read as "content" |
| Offboarding checklist | Employee, Exit type (points at `../config/offboarding/{exit-type}.md`), Item, Owner, Status | Owner may be this agent, IT, or People-Ops (final-settlement handoff only — this pack never computes settlement figures) |
| Anniversary sent-log | Employee, Milestone, Sent date | Prevents duplicate sends across cron runs |
| Survey response aggregate | Survey, Cut, N, per-question aggregate value | **Only** the suppressed, cut-cleared aggregate lives here — raw per-person responses and all free text never do (see next section) |

## What never goes in the Culture tracker, or any Notion page, or Slack

- Raw pulse-survey responses (per-person answers) and all free-text comments, at any N — stay in qm scope storage only, per `../config/playbook.md` §Small-N suppression.
- Exit-interview transcripts and any content derived from one — never Notion, never Slack, not even to the accountable human's DM (a DM is not a private channel, `packs/shared/identity/SKILL.md` §8). Delivery is a **separate private channel**, TODO(gate): mechanism undecided — a restricted-sharing document or the agent's own mailbox once provisioned (`../config/agent.md`), access-limited to the accountable human specifically. Whichever mechanism is chosen, it must support access control narrower than "anyone in a Slack channel" or "anyone with the Notion workspace link" — that constraint binds the future gate closure, not just this placeholder.
- Review content, ratings, or calibration notes — never written by this pack at all, to any surface; the Review-cycle status record above deliberately has no field that could hold them.

## Staleness & re-query semantics

Same split-brain rule as every other pack (PRD §8): re-query the Employees DB and the Culture tracker fresh before every table or nudge, never reuse a value read earlier in the session.

"Not set" vs "unknown": an empty "Last confirmed date" on the 1:1 log means *no 1:1 logged yet* — a real, reportable state. A query that fails or times out is *unknown* — report "Culture tracker: couldn't check" and exclude that row from any count, never treat a failed read as "not happened."

## Write verification

After any tracking-record write (1:1 log, review-cycle status, checklist item, sent-log), re-read the record and confirm the new value stuck before reporting that step complete — same pattern as `notion-employees.md`.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Employees DB or Culture tracker unavailable | Halt that section, report "{system}: unreachable," never fall back to a prior session's cached rows |
| Permission-denied (machine user lacks access) | Halt, escalate to the accountable human as a credential/grant issue |
| Ambiguous result (duplicate employee rows, two active offboarding records for one person) | Present all matches to the accountable human; never guess which is authoritative |
| Private delivery channel for exit-interview transcripts not yet gated | Hold the transcript in qm scope storage only; report "transcript pending private-channel gate, not yet delivered" explicitly — never fall back to Slack or a shared Notion page to avoid leaving it undelivered |

## PII handling

The Culture tracker's proposed shape above is deliberately status-only — booleans, dates, counts — so that even a fully-populated tracker carries no reviewable content, no survey answer, and no interview transcript. The two genuinely sensitive stores this pack touches (raw survey responses, exit-interview transcripts) are kept out of it entirely, per the section above. Employee PII is handled stricter than candidate PII everywhere on this platform (master PRD §6, DPDP): no comp/ESOP/documents-status value is ever read or written by this pack (it isn't relevant to any skill here); no survey response or interview transcript enters git, a fixture, or a PR description — fixtures for this pack use synthetic employees and synthetic responses only.

## Capability gaps today

No Notion object exists for the Culture tracker (see "What we write" above). No mailbox/calendar/Notion machine user is provisioned for this agent yet (`../config/agent.md`). No private-delivery mechanism for exit-interview transcripts is decided. Every skill in this pack runs against synthetic fixtures until these land.

## Credentials required

- Notion integration token for this pack's own machine user, scoped to the Employees DB (read-only) and the Culture tracker (read/write) once both exist — provided by: Founder (Notion workspace admin).
- A private, access-controlled delivery surface for exit-interview transcripts — provided by: Founder/CTO, mechanism TBD (see "What never goes in the Culture tracker" above).
