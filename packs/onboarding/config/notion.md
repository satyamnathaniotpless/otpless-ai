<!-- Purpose: the Notion contract this pack consumes — property/schema expectations for databases that do not exist yet (ADR-005: never invent an ID; ADR-003: Notion is the operational record). -->

# notion.md — Notion contract (Employees DB does not exist yet — gate)

The onboarding agent's system of record is the **Employees DB** (master PRD §6: "to build"). It does not exist in Notion today. Every skill in this pack that would read or write it must state that plainly rather than inventing an ID — this file is the contract those skills point at.

## Databases

| Item | ID | Status |
|---|---|---|
| Employees DB | TODO(gate): not yet created — who: Founder/CTO (master PRD §6) | Blocking: lifecycle stage, BGV status, document status, buddy, comp/ESOP all live here once built |
| Onboarding checklist DB | TODO(gate): not yet created — who: Founder/CTO (master PRD §6) | Per-hire instance of `checklists/{role}.md`; one row/page per checklist item per hire |
| Applicants DB (recruiting's, read-only reference) | `collection://29905732-673c-4cf8-85c5-15f1aa2a1f7a` (see `packs/recruiting/config/notion.md`) | This pack may read the accepted-offer row for candidate background at handoff; it never writes to Applicants — that DB belongs to the recruiting agent |

## Employees DB — properties expected (contract for when it lands, not live data)

| Property | Type | Notes |
|---|---|---|
| Name | Title | Real employee name — DPDP-stricter handling than candidate PII (master PRD §6) |
| Role | Select | Matches recruiting's Role values |
| Manager | Text/Person | |
| Start date | Date | Drives every SLA this pack tracks |
| Notice period end | Date | Typically start date − 1 day |
| Lifecycle stage | Select | `Offer accepted → Notice period → BGV → Pre-boarding → Day one → 30-day → 60-day → 90-day → Steady state` |
| BGV status | Select | `Not started / In progress / Clear / Flagged / Waived-pending` |
| Documents status | Select or rollup | Against the doc list in the hire's `checklists/{role}.md` |
| Comp / ESOP | Text | Human-entered only; this pack never writes this field and reads it only to know a comp conversation happened, never its content (never-delegated, see `playbook.md`) |
| Buddy | Text/Person | |
| Checklist template used | Text | Which `checklists/{role}.md` instantiated this hire's plan |

## Query conventions

- Re-query the Employees DB fresh before every table (split-brain rule, `playbook.md`) — once it exists. Until then, every skill states explicitly that the read/write is blocked pending this gate rather than presenting a partial or invented picture.
- Read comp/ESOP only to detect that a comp question was raised (so it routes to a human) — never to answer it or restate its value.
