<!-- Purpose: index and definition of "contract" for every external-system integration skills consume — read this before writing or calling into any of Notion/Gmail/Calendar/Slack. -->

# Integration contracts

A **contract** is the one file that stands between a skill and a system we don't own. It states, in plain language, exactly what a skill may read, what it may write, which field/property/stage names mean what (pointing at the config file that holds the real IDs, never duplicating them), how staleness is handled, how a write is verified, what to do when the system fails, and what today's mechanism still can't do.

Skills consume contracts, never APIs directly, so that:
- a skill never hardcodes a property name, stage value, or ID (ADR-005) — it reads the contract, the contract points at config;
- staleness handling (PRD §8 split-brain rule) is defined once per system, not re-derived per skill;
- a capability gap becomes a tracked finding (extend the connector/tool) instead of a curl workaround baked into a skill;
- credentials are named here for the gate ledger and never appear as values anywhere in git.

**Correction (2026-08-02):** every contract in this index previously described reaching its system through an MCP server declared in `.mcp.json`. **qm does not use MCP** — verified by reading the qm@0.1.4 CLI source and its operator docs: zero occurrences of "mcp" or "notion" anywhere in the package. `.mcp.json` is read by nothing in qm. The corrected mechanism model is below; every contract file in this index has been rewritten against it.

## How a contract reaches its system (qm's three mechanisms)

qm offers exactly three ways for an agent to reach an external system. A contract's "what we read"/"what we write" sections state the *capability* needed (the operation, not an invented tool name); which mechanism supplies it is stated in the contract's mechanism note and credentials section.

1. **Connectors — the first-class path, and the one every contract in this index uses today.** An OAuth provider is registered once, org-wide, by an operator in the Admin UI at `adminConnectorsUrl` (`/admin/connectors`): the operator enters the provider's client id and secret into write-only fields and registers the callback qm shows. Separately, and required in addition, an individual user completes their own connection at `userConnectionsUrl` (`/keychain`). **These are two distinct steps — a configured-but-unconnected connector does nothing.** Credentials are encrypted at rest under `CONNECTOR_SECRET_KEY`. Once connected, the agent is handed whatever tools that connector's integration exposes at runtime; this repo does not know and must not invent the exact tool/operation names until they're confirmed against the running deployment (see each contract's mechanism note for what's confirmed vs. unverified). Google, Notion, and Slack are confirmed registered (Admin-UI step done) on the OTPLESS deployment as of this writing; whether the recruiting/onboarding/people-ops/analyst/culture agents' own identities have completed the second, per-user connection step at `/keychain` is unverified per contract and must be checked at deploy time.

2. **Sandbox tools — for a system with no connector (a vendor with no OAuth integration, e.g. WhatsApp Business, a BGV vendor, an HRMS).** A tool is declared as `sandbox/tools/<id>/tool.json` plus an executable shipped in the sandbox image. The descriptor fields, verified from the parser: `id`, `advertise` (the command name the agent sees), `install.binary`, `hints[]`, `egress[]` (the hosts the tool declares it needs — validated-only in contract v1, not a platform-enforced allowlist; confinement comes from the G27 blanket egress proxy instead, per ADR-010 correction §1), `auth { check, reauth, credentialPaths[{path, kind}] }` (how the tool authenticates and where its credential lives), and `approvals[{ command | pattern, decision }]` (platform-enforced approval routing for specific invocations — the enforced equivalent of a guardrail we otherwise only express in skill prose). A future contract author reaching for a sandbox tool should still set `egress` to the vendor's API host(s) as documentation of intent, and use `approvals` to encode any action that needs a human gate at the platform layer rather than trusting a skill to ask nicely.

3. **Plugins — a prebuilt image running alongside the qm services**, declared as `plugins: [{ name, image }]` in `qm.config.jsonc`. Used when the integration needs its own long-running service rather than a callable tool or an OAuth-token round trip.

**`.mcp.json` at repo root is retained deliberately** for local Claude Code development against the same systems (Notion/Gmail/Calendar/Slack) while building and testing skills — it is genuinely useful for that. **qm reads nothing from it.** Do not treat it as deployment config, and do not infer anything about the deployed agent's actual tool surface from the package names or tool names it lists.

## Index

| Contract | System | Consumed by |
|---|---|---|
| [`notion.md`](./notion.md) | Notion (ATS / People spine) | `recruiter` scope (F1, F2, F5, F7, F8, F9); `analyst` scope (funnel/time-in-stage/source-ROI reads, read-only) |
| [`notion-employees.md`](./notion-employees.md) | Notion — Employees DB + Policies wiki (two objects, one contract by design, not an oversight of the one-system-per-contract convention — see file header) | `onboarder`, `people-ops` scopes; `analyst` scope (headcount/attrition reads, read-only); `culture` scope (anniversary/review-cycle/offboarding metadata, **read-only**) |
| [`gmail.md`](./gmail.md) | Gmail | `recruiter` scope (F1, F3, F4, F6, F8) |
| [`calendar.md`](./calendar.md) | Google Calendar | `recruiter` scope (F1, F5, F8) |
| [`slack.md`](./slack.md) | Slack | `recruiter`, `onboarder`, `people-ops`, `analyst`, `culture` scopes |
| [`hrms.md`](./hrms.md) | HRMS — payroll/leave/attendance system of record (provider undecided, gate G14) | `people-ops` scope — read-only in P2; `analyst` scope — read-only (headcount/comp-band cross-reference) |
| [`bgv.md`](./bgv.md) | Background verification vendor (undecided, gate G18) | `onboarder` scope |
| [`whatsapp.md`](./whatsapp.md) | WhatsApp Business API — candidate/employee messaging channel (mechanism undecided — sandbox tool vs. plugin; account/template/infra decisions undecided, gates G20–G22) | `recruiter`, `onboarder` scopes (drafted text only until a mechanism exists) |
| [`_template.md`](./_template.md) | (blank) | Fill this to add any future system |

**One Notion object is not yet covered by any contract:** the **Culture tracker**, where the `culture` scope's checklist and cadence writes actually go. It does not exist in Notion yet (gate G25), so its shape currently lives in `packs/culture/config/notion.md` as the pack's own read of what it will need. A contract file lands here when the object is created — recorded rather than quietly implied, because "culture writes to the Employees DB" was the wrong assumption this row used to carry.


New integration = copy `_template.md`, fill every section, add a row above.
