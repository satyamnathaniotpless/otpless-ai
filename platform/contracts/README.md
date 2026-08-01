<!-- Purpose: index and definition of "contract" for every external-system integration skills consume — read this before writing or calling into any of Notion/Gmail/Calendar/Slack. -->

# Integration contracts

A **contract** is the one file that stands between a skill and a system we don't own. It states, in plain language, exactly what a skill may read, what it may write, which field/property/stage names mean what (pointing at the config file that holds the real IDs, never duplicating them), how staleness is handled, how a write is verified, what to do when the system fails, and what the underlying MCP still can't do.

Skills consume contracts, never APIs directly, so that:
- a skill never hardcodes a property name, stage value, or ID (ADR-005) — it reads the contract, the contract points at config;
- staleness handling (PRD §8 split-brain rule) is defined once per system, not re-derived per skill;
- a capability gap becomes a tracked finding (extend the MCP) instead of a curl workaround baked into a skill;
- credentials are named here for the gate ledger and never appear as values anywhere in git.

MCP servers are declared in `.mcp.json` at repo root. Every credential referenced there is an env var name only (e.g. `${NOTION_TOKEN}`) — actual values live in qm's keychain, scoped per agent, never in git.

Every contract carries a `## PII handling` section stating what personal data that system carries and the handling rule that follows from it, positioned immediately before `## Capability gaps today`; a new contract inherits this section, and its required position, by copying `_template.md` rather than reinventing it.

**Warning:** the packages pinned in `.mcp.json` are unverified until the deployment is actually wired — in particular, the Slack server (`@modelcontextprotocol/server-slack`) is npm-flagged deprecated. Confirm or replace each package at deploy time (gate G12, `docs/gates.md`).

## Index

| Contract | System | Consumed by |
|---|---|---|
| [`notion.md`](./notion.md) | Notion (ATS / People spine) | `recruiter` scope (F1, F2, F5, F7, F8, F9) |
| [`notion-employees.md`](./notion-employees.md) | Notion — Employees DB + Policies wiki (two objects, one contract by design, not an oversight of the one-system-per-contract convention — see file header) | `onboarder`, `people-ops` scopes |
| [`gmail.md`](./gmail.md) | Gmail | `recruiter` scope (F1, F3, F4, F6, F8) |
| [`calendar.md`](./calendar.md) | Google Calendar | `recruiter` scope (F1, F5, F8) |
| [`slack.md`](./slack.md) | Slack | `recruiter` scope (F2, F7, F9) |
| [`_template.md`](./_template.md) | (blank) | Fill this to add HRMS, WhatsApp, or any future system |

New integration = copy `_template.md`, fill every section, add a row above.
