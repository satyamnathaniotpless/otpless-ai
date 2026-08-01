<!-- Purpose: contract between Onboarder/People-Ops skills and the Employees DB + Policies wiki — neither exists in Notion yet — so no skill invents a property, an ID, or answers a policy question without a real citable page. -->

# Contract: Notion (Employees DB + Policies wiki)

## Purpose

Two not-yet-created Notion objects, one contract, because both are consumed by the same two P2 scopes and both inherit the split-brain and citation discipline below. **Employees DB**: the People spine's lifecycle record (person, role, manager, start date, comp, ESOP, documents status, lifecycle stage — master PRD §6). **Policies wiki**: the sole source People-Ops may answer policy questions from — no policy improv, ever (master PRD §4, §6). Neither exists in the Notion workspace today (gates G16, G17 — `docs/gates.md`).

## What we read

- `notion-query-data-sources` / `notion-query-database-view`: Employees DB rows filtered by lifecycle stage (Onboarder: day-1/30/60/90 tracking) or by employee (People-Ops: cross-reference against `platform/contracts/hrms.md` reads).
- `notion-fetch`: a specific employee row, or a specific Policies wiki page. **Every policy-Q&A answer requires a fetch performed this turn** — never answered from a page fetched earlier in the session or from memory of prior content (PRD §8 split-brain rule, same discipline as `notion.md`).
- `notion-search`: locate an employee row or a policy page when the exact one isn't known (e.g. by name or topic keyword).
- `notion-get-comments`: existing notes/discussion on an employee row or a policy page.

**Citation requirement (hard rule, not a style preference):** every People-Ops answer to a policy question must name the exact source it was drawn from. Note that the canonical source is `brain/people/` (ADR-003) and this wiki is its human-facing mirror — so the citation is the `brain/` file and its status in `brain/people/policies-index.md`, and this contract's role is the cross-check below, not the citation itself. An answer with no source named must not be given — the correct response is "I don't have a citation for that yet — escalating," not a best-effort synthesis from several partial matches.

**Mirror-drift check.** Once the wiki exists, a page's `Status` and the git index's `Status` must agree. If they disagree, answer from neither and escalate: the mirror has drifted from canon, and serving a policy out of an inconsistent pair is how an employee gets told they have leave they do not have.

**Draft pages are never quoted as approved policy.** If the only matching page carries a Draft status, People-Ops must say so explicitly ("the only guidance I found is in draft, not yet approved") and escalate to the accountable human rather than presenting draft content as settled policy. This applies regardless of how confident the draft content looks or how urgent the employee's question is.

## What we write

- `notion-update-page` (Onboarder only): lifecycle-stage transitions (e.g. Day-1 confirmed, 30/60/90 checkpoint reached), documents-status updates (BGV/paperwork complete), buddy-assignment field.
- `notion-create-pages` (Onboarder only): a new Employee row at offer-accept handoff from the Recruiter scope — not exercised until the Employees DB exists (gate G16).
- **People-Ops never writes to the Policies wiki.** Policy changes are NEVER DELEGATED (`command-policy.md` §4) — People-Ops is read-only against the Policies wiki, full stop, the same absolute rule `hrms.md` states for HRMS writes. People-Ops also never writes to the Employees DB — that is Onboarder's write surface, not People-Ops's; People-Ops reads it only, to cross-reference.

## Field & name mapping

Employees DB fields per master PRD §6: Person, Role, Manager, Start date, Comp, ESOP, Documents status, Lifecycle stage. Policies wiki page properties (this contract's own design, since none exist yet): Title, Status (`Draft` | `Approved`), Owner, Category, Last-reviewed date. Real property names and the real database/page IDs live in `packs/onboarding/config/notion.md` (Onboarder's write-side) and `packs/people-ops/config/notion.md` (People-Ops's read-side) once both objects are created (gates G16/G17) — this contract states the shape only; no ID is invented here (house rule).

## Staleness & re-query semantics

Same split-brain rule as `notion.md` (PRD §8): humans (the accountable human, and eventually the People Lead) edit both the Employees DB and the Policies wiki directly. Re-query fresh before every lifecycle write and before every policy answer — never reuse a Documents-status, Lifecycle-stage, or policy-page-content value read earlier in the session.

"Not set" vs "unknown": an empty Documents-status property means *not yet collected* — a real, reportable state. A query that fails or times out means *unknown* — report "Notion (Employees/Policies): couldn't check" and exclude that row from any count, never silently treat a failed read as empty/not-set. For the Policies wiki specifically: a page with `Status = Draft` is a real, citable-as-draft state (see citation requirement above) — distinct from a page that fails to fetch at all (unknown, no answer possible).

## Write verification

After any Employees DB write (Onboarder only), re-read the row (`notion-fetch` or a targeted query) and confirm the new value matches before reporting that lifecycle step complete — same pattern as `notion.md`. People-Ops has no write path against either object, so nothing to verify on its side.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Notion unavailable | Halt that section, report "Notion (Employees/Policies): unreachable," never fall back to a prior session's cached rows |
| Rate-limited | Back off, retry once; if still failing, report partial results explicitly labeled incomplete |
| Permission-denied (machine user lacks access) | Halt, escalate to the accountable human as a credential/grant issue — do not proceed on partial access |
| Ambiguous result (duplicate employee rows, or multiple policy pages matching a query) | Present all matches to the accountable human/asking employee; never guess which is authoritative, never synthesize one answer out of several ambiguous pages |
| Only match is a Draft policy page | Never quote it as approved policy — say only draft guidance exists, and escalate; this is a distinct failure from "unreachable" or "ambiguous," name it as such |

## PII handling

The Employees DB is the single most person-linkable store this platform will hold: comp, ESOP, documents status (BGV/paperwork), and lifecycle stage, all keyed to a named real employee (master PRD §6). This contract deliberately covers two objects of very different sensitivity under one file (see `platform/contracts/README.md` index) — worth stating in the open: **a Policies wiki page is not personal data; an Employees DB row is.** The split-brain and citation rules above apply to both objects equally; the PII rule below applies to the Employees DB only.

Comp and ESOP figures, and documents-status detail, are the worst-case fields here — a leaked comp number or ESOP grant is irreversible the moment it reaches the wrong person. None of it is Slack-safe: any reference to a specific employee's row in Slack (channel, DM, or digest) is name + lifecycle-stage-only ("day-30 checkpoint reached"), never comp, never ESOP, never a documents-status value (`packs/shared/identity/SKILL.md` §8). No comp, ESOP, or documents-status value enters git, a fixture, or a PR description — fixtures for Onboarder/People-Ops use synthetic employees only. A lifecycle-stage transition is a routine agent write (Onboarder only, per "What we write"); a comp or ESOP change is never an agent write and never even drafted by a skill under this contract — comp/ESOP content is on the never-delegated list (master PRD §6) and is a People Lead/founder edit made directly in Notion, not something Onboarder or People-Ops proposes.

## Capability gaps today

The Employees DB and Policies wiki do not exist in Notion yet (gates G16, G17 — `docs/gates.md`) — no data-source ID, no page ID, nothing to query today. Every skill depending on this contract runs against synthetic fixtures only until the gates clear (same pre-gate convention as `notion.md`'s scratch-location rule for the Applicants DB). No push/subscribe mechanism exists (same gap as `notion.md`) — any "policy just changed" or "employee record just changed" detection is poll-only, cadence set in `crons.md`.

## Credentials required

- Notion integration token for the Onboarder agent's and the People-Ops agent's own machine users (never a human's, never shared with the recruiting agent's token or each other's) — scoped to the Employees DB and Policies wiki once created, provided by: Founder (Notion workspace admin) — gates G16 (Employees DB creation + grant) and G17 (Policies wiki creation + grant), `docs/gates.md`.
