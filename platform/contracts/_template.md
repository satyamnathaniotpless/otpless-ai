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

## Capability gaps today

{What the MCP cannot do yet. Extending the MCP is the fix — never a curl bypass. List as a finding, not a workaround.}

## Credentials required

- {Credential name} — provided by: {who}. Never a value here — name only, lives in qm's keychain.
