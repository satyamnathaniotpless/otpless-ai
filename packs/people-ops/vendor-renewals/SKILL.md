---
name: vendor-renewals
description: |
  Flags vendor contracts entering their renewal-notice window and drafts the reminder or
  renewal/cancellation-intent communication — never commits spend or signs anything. Use when
  asked "what vendor renewals are coming up," or on the configured renewal-notice cron.
---

# Vendor renewals

Any spend or contract commitment is a human gate (`CLAUDE.md` autonomy & human gates) — this skill's job stops at surfacing the decision and drafting the communication, never at making the decision.

## Trigger

A vendor's renewal-notice lead time (per `../config/vendors.md`) has opened, cron-fired; or a human asks "what vendor renewals are coming up" / "are we covered on {vendor}."

## Inputs

- `../config/vendors.md` — the tracked vendor register (vendor, contract term end, renewal notice lead time, owner). Currently seeded with `TODO(gate)` placeholder rows, not real contract data.
- `../config/user.md` (accountable human per vendor category, escalation contacts).

## Process

1. **Re-read `../config/vendors.md` fresh.** Never rely on a renewal date read earlier in the session — the register can be edited independently.
2. **Flag any vendor whose current date has entered its configured renewal-notice lead-time window** relative to its contract term end.
3. **A row with a `TODO(gate)` field (no real term-end date, no real lead time) is a data gap, not "no renewal due."** Report it as a gap needing the accountable human to fill in `../config/vendors.md`, never as "nothing due."
4. **Draft the appropriate communication** — either an internal reminder to the accountable human ("renewal decision needed on {vendor} by {date}") or, if asked, renewal/cancellation-intent text addressed to the vendor. Both are drafts only.
5. **Never commit to a renewal, a cancellation, a price, or a signature.** This skill has no authority to decide any of those — it surfaces the decision and hands the accountable human a draft to act on.

## Output contract

A table of vendors within their lead-time window or flagged as a data gap:
```
Vendor | Term end | Notice deadline | Owner | Status (due now / data gap / not yet due)
```
followed by any drafted communication text, each gated by the standard `d) draft  s) send  e) edit  ?) something else` prompt.

## Failure behavior

- A vendor row is missing its term-end date or lead time → report as a data gap needing the accountable human to fill `../config/vendors.md`, not as evergreen or "not due."
- Ambiguous who owns a renewal decision → escalate to the accountable human rather than guessing or defaulting to the Founder for every row.
- Any instruction to execute a renewal, agree to a price, or sign anything → refuse; this is a human gate regardless of trust-ladder level for this action-class (`../config/agent.md`).
