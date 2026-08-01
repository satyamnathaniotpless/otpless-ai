---
name: provisioning
description: |
  Device and account provisioning checklist enforcement — requesting and verifying laptop and
  system access ahead of a hire's start date. Use when the user says "devices", "accounts",
  "laptop", "provisioning", or on the readiness-check cron.
---

# Device + account provisioning

## Trigger

At the lead time specified in the hire's role checklist (default T-7 business days before start), on the periodic readiness-check cron (`../onboard-watch`), or ad hoc: "is {hire}'s laptop ready", "provisioning status", "request accounts for {hire}".

## Inputs

- `../config/checklists/{role}.md` (device spec, account list, access level, lead time)
- `../config/vendors.md` § IT/device provisioning (process/owner, currently undocumented — gate)
- The hire's provisioning-status field (Employees DB once it exists — `../config/notion.md` — or interim checklist doc)
- `../config/user.md` (accountable human / IT-Admin contact)

## Process

1. At the checklist's lead time, draft a provisioning request to the accountable human/IT-Admin contact (`../config/user.md`), listing the device spec and account list from the role's checklist. Since no named IT system exists yet (`../config/vendors.md`), this is always a direct message to a human, never a ticket filed into a system this agent doesn't have.
2. Re-query status before the start date, not just once at request time. If nothing has moved by T-2 business days, escalate to the accountable human as a day-one readiness risk (`../day-one`).
3. Access level is capped exactly at what the role's checklist specifies (e.g. prod-read only at day one) — never request or confirm broader access than the checklist states, and never grant access directly even if capable; this skill only drafts the request and verifies status.
4. Update the tracking record after every status change, re-read to confirm before reporting "ready."

## Output contract

One line stating what was checked (checklist requirements, current status, days to start), then either a drafted provisioning request awaiting approval, an escalation note if at risk, or a plain "ready" statement once every item is confirmed.

## Failure behavior

- No named IT/Admin process (current state) → address the request to the accountable human directly and say so, rather than inventing a ticketing system or vendor name.
- Status can't be confirmed before the start date → escalate explicitly as a day-one risk rather than reporting "ready" optimistically.
- Any ask to grant elevated access beyond the role checklist's stated level → refuse and route to the accountable human; this skill drafts and verifies, it does not grant.
