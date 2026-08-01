<!-- Purpose: the Notion contract this pack reads against — a pointer, not a duplicate, of the property/ID mappings other packs already own (ADR-003/ADR-005: one canonical mapping per object, not one per consuming pack). -->

# notion.md — Notion read-side pointer (Analyst)

This pack is **read-only** against every Notion object it touches — it never calls `notion-update-page`, `notion-create-pages`, or any other write operation, at any trust-ladder level, on any object. It also never invents a property name or ID; it reads the mapping from whichever pack already owns that object's schema, per the pointers below, exactly as `platform/contracts/notion.md` and `platform/contracts/notion-employees.md` require ("never inline a property name or ID in a skill").

## Applicants DB (real object, real IDs today)

Property names, stage values, role values, source values, and the real page/data-source IDs: `packs/recruiting/config/notion.md`. That file is canonical; this pack does not restate its table. `../funnel-source/SKILL.md` reads it directly.

## Employees DB (does not exist yet — gate G16)

Property names and the intended shape: `packs/onboarding/config/notion.md` (the write-side owner) and `platform/contracts/notion-employees.md` (the contract). Real IDs land there once the gate clears, not here. `../headcount/SKILL.md`, `../comp-drift/SKILL.md`, and `../attrition-signals/SKILL.md` all read this pointer and run against synthetic fixtures until then, per the same convention every other pack uses pre-gate.

## Policies wiki

Not read by this pack. Policy-citation and mirror-drift checking is People-Ops's `policy-qa` skill's job (`packs/people-ops/policy-qa/SKILL.md`) — this pack does not duplicate that check (see `../data-hygiene/SKILL.md`'s scope note).

## Credentials

TODO(gate): this agent's own Notion machine-user token — see `./agent.md` "Notion machine user" row. Until it exists, every skill in this pack runs against synthetic fixtures only, same pre-gate convention as `platform/contracts/notion.md` and `platform/contracts/notion-employees.md` use for their own consuming packs.

## Query conventions

Same split-brain discipline as every other consumer of these contracts (PRD §8): re-query fresh before composing any report section — never reuse a count computed for last week's report, even for a "trend" line; recompute the full series from source each time. "Not set" vs "unknown" follows `platform/contracts/notion.md` / `platform/contracts/notion-employees.md` exactly: an empty field is a real, reportable state; a failed read is *unknown* and excludes that row from any count rather than treating it as zero or absent.

## Consumer-list gap

`platform/contracts/notion.md` and `platform/contracts/notion-employees.md` list their consuming scopes as `recruiter` and `onboarder`/`people-ops` respectively — neither lists `analyst` yet. Adding this pack as a named consumer in both contracts' headers is a one-line follow-up for whoever maintains `platform/contracts/` (out of this build's scope — see this phase's report).
