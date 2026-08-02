<!-- Purpose: blank contract shape — copy this file to add a new integration (e.g. HRMS, WhatsApp); fill every section before a skill may consume it. -->

# Contract: {system name}

## Purpose

{One line: what this system is for in the platform, e.g. "ATS — the Applicants database is the single source of truth."}

## What we read

- {Operation}: {what it returns, which skill/F-number uses it}
- ...

## What we write

- {Operation}: {what it changes, which skill/F-number triggers it}
- ...

## Field & name mapping

{Property names, stage/select values, label names, channel names used by this system. Reference where the real IDs/values live (e.g. `packs/recruiting/config/{file}.md`) — do not duplicate IDs here.}

## Staleness & re-query semantics

{How a consumer re-queries before acting (PRD §8 split-brain rule). How "not set" is distinguished from "unknown" / "not yet checked." Cite the canonical Calendar `needsAction` vs `accepted` pattern if analogous.}

## Write verification

{How a caller confirms a write landed — re-read after write, what field to check, what "confirmed" means.}

## Failure modes

| Failure | Consuming skill must |
|---|---|
| System unavailable | {behavior} |
| Rate-limited | {behavior} |
| Permission-denied | {behavior} |
| Ambiguous result (e.g. multiple matches) | {behavior} |

## PII handling

{What personal data this system carries, and the handling rule that follows from it. Be specific about the worst case, not the average one — the field that would do real damage if it reached the wrong surface.

State explicitly: what may appear in Slack (the default answer is a name plus a one-line status, never a field value — a DM is retained, exportable, and admin-readable, so it is not a private channel); what must never enter git; what is never stored or restated by an agent; and any class of result that must route to a human rather than become an agent decision.

Delete this section only if the system genuinely carries no personal data. Most do. Employee data is handled stricter than candidate data (master PRD §6, DPDP).}

## Capability gaps today

{What the mechanism cannot do yet — see the three mechanisms in `README.md` (connector / sandbox tool / plugin). The fix is always to extend the mechanism: request a broader connector scope, add a tool, or ship a plugin. Never a raw HTTP call, a scraped portal, or a human's personal credential. List as a finding, not a workaround.}

## Credentials required

- {Credential name} — provided by: {who}. Never a value here — name only, lives in qm's keychain.
