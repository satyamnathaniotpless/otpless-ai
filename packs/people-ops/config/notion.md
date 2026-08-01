<!-- Purpose: Notion IDs, properties, and status values for the Employees DB and Policies wiki, as People-Ops reads them — never hardcode any of this in a SKILL.md. -->

# notion.md — Notion IDs, properties, and status values (People-Ops read side)

Source of truth for the Notion identifiers and schema People-Ops skills (`../hrms-query`, `../policy-qa`, `../payroll-prep`) read against. Neither the Employees DB nor the Policies wiki exists in Notion yet — every ID below is a placeholder pending its gate; no ID is invented in the meantime (house rule). This file is the People-Ops-side counterpart to `packs/onboarding/config/notion.md` (Onboarder's write side) — both instantiate `platform/contracts/notion-employees.md`. People-Ops never writes to either object (see that contract's "What we write") — this file exists to name what People-Ops reads, not to duplicate Onboarder's write-side detail.

## Databases / pages

| Item | ID | Status |
|---|---|---|
| Employees DB | TODO(gate): not yet created — who: Founder (Notion workspace admin), gate G16, `docs/gates.md` | People-Ops reads only, to cross-reference against HRMS (`../config/hrms.md`) — Onboarder owns the write side |
| Policies wiki | TODO(gate): not yet created — who: Founder (Notion workspace admin + initial policy authoring), gate G17, `docs/gates.md` | The human-facing **mirror** of `brain/people/`, not the canonical source (ADR-003). `../policy-qa` cites `brain/`; People-Ops is read-only against the wiki and uses it only as the cross-check described below |
| Machine-user grant (People-Ops's own integration token, scoped to both) | TODO(gate): not yet issued — who: Founder, gates G16 + G17, `docs/gates.md` | Never the recruiting agent's or Onboarder's token |

## Which policy source is canonical

`brain/people/` is canonical; the Notion Policies wiki is a downstream mirror for humans to browse (ADR-003). `../policy-qa` therefore cites the `brain/` file and its approval status from `brain/people/policies-index.md` — not the wiki page — and that remains true after gate G17 closes.

The wiki still matters once it exists, as a **disagreement detector**: if a wiki page's Status contradicts the index (wiki says Approved, index says DRAFT, or the reverse), that is not a tie to break by picking the more convenient one. It means the mirror has drifted from canon, which is itself a defect. The correct behavior is to answer from neither, say the sources disagree, and escalate — a policy an employee could act on must not be served out of an inconsistent pair.

## Employees DB — properties (read-only for this pack)

Same schema Onboarder writes (`packs/onboarding/config/notion.md`) — People-Ops reads these fields, never sets them:

| Property | Type | Notes |
|---|---|---|
| Name | Title | Real employee name — DPDP-stricter handling than candidate PII (master PRD §6) |
| Role | Select | Matches recruiting's Role values (`packs/recruiting/config/notion.md`) |
| Manager | Text/Person | |
| Start date | Date | |
| Lifecycle stage | Select | `Offer accepted → Notice period → BGV → Pre-boarding → Day one → 30-day → 60-day → 90-day → Steady state` |
| BGV status | Select | `Not started / In progress / Clear / Flagged / Waived-pending` — People-Ops never interprets a `Flagged` value; see `platform/contracts/bgv.md` |
| Documents status | Select or rollup | Read-only reference for `../hrms-query` cross-checks |
| Comp / ESOP | Text | People-Ops reads this only to detect that a comp question was raised (routes to a human) — never to answer it or restate its value, same rule as Onboarder's copy of this field |

## Policies wiki — page properties

This pack's own design (`platform/contracts/notion-employees.md` — no page exists yet to define these live):

| Property | Type | Notes |
|---|---|---|
| Title | Title | Cited verbatim in every `../policy-qa` answer |
| Status | Select | `Draft` \| `Approved` — see "Status values" below; matches `brain/people/policies-index.md`'s own Status column |
| Owner | Text/Person | Typically Founder or People Lead |
| Category | Select | e.g. Leave, Expense, Notice period — extend freely, one row per topic |
| Last-reviewed date | Date | Informational only; does not itself confer `Approved` status |

## Status values

- Employees DB `Lifecycle stage`: `Offer accepted`, `Notice period`, `BGV`, `Pre-boarding`, `Day one`, `30-day`, `60-day`, `90-day`, `Steady state`.
- Employees DB `BGV status`: `Not started`, `In progress`, `Clear`, `Flagged`, `Waived-pending`.
- Policies wiki `Status`: `Draft`, `Approved` — only `Approved` may ever be cited to an employee as current policy. This mirrors the DRAFT-marker convention already in force for the git-side canon at `brain/people/policies-index.md`: a policy whose Status is not `Approved` there is never quoted as settled either. Once the wiki exists, its `Status` property and the index's `Status` column must agree — if they ever disagree, treat that as an "ambiguous result" per `platform/contracts/notion-employees.md`'s failure modes and escalate rather than trusting either alone.

## Query conventions

- Re-query both objects fresh before every answer or cross-check (split-brain rule, `platform/contracts/notion-employees.md`) — never trust a Lifecycle stage, BGV status, or policy-page value read earlier in the session.
- Every `../policy-qa` answer requires a citation naming the exact page: today that's the page title (no ID exists yet); once the wiki exists and its page IDs are known, add them to the Policies wiki table above and cite the ID alongside the title. No answer is given without a citation — see `../policy-qa/SKILL.md`'s output contract.
- A policy page read as `Status: Draft` (or any status other than `Approved`) is never quoted to an employee as policy — state plainly that only draft/unapproved guidance exists and escalate, per `platform/contracts/notion-employees.md`'s "Draft pages are never quoted as approved policy" rule.
- Until gates G16/G17 clear, every read against this file's IDs runs against synthetic fixtures only — never a real employee's record or a real policy page.
