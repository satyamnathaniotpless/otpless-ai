<!-- Purpose: contract between recruiting skills and Notion — the ATS system of record — so no skill ever touches the Notion MCP or hardcodes a property/stage name directly. -->

# Contract: Notion

## Purpose

ATS and People spine — the Applicants database is the single source of truth for candidate state (ADR-003, PRD §6).

## What we read

- `notion-query-data-sources` / `notion-query-database-view`: Applicants rows filtered by Stage (F1 triage, F9 SLA sweep) or Role (F7 pipeline funnel), and single-row lookups by candidate (F8 candidate-status).
- `notion-fetch`: Careers page, a specific applicant row, or role page content.
- `notion-search`: locate a candidate row when the exact page isn't known.
- `notion-get-comments`: existing notes/discussion on a row.

## What we write

- `notion-update-page`: Stage transitions, Builder/OSS/Fraud flags, Scorecard avg, Notes (F2, F5, F6).
- `notion-create-comment`: supplementary notes that shouldn't overwrite the Notes property.
- `notion-create-pages`: new applicant rows — only if intake ever needs agent-side creation; today the careers form writes rows directly (PRD §6), so this is not exercised by any current skill.

## Field & name mapping

Property names, stage values, role values, owner values, and source values, plus the real page/data-source IDs, live in `packs/recruiting/config/notion.md` — read that file, never inline a property name or ID in a skill.

## Staleness & re-query semantics

Split-brain rule (PRD §8): operators edit Notion directly, constantly. Re-query the Applicants data source fresh before every table and before acting on any candidate — never reuse a Stage/Owner value read earlier in the same session.

"Not set" vs "unknown": a property read as empty (e.g. Scorecard avg blank) means *not yet rated* — a real, reportable state. A query that fails or times out means *unknown* — the skill must say "Notion: couldn't check" and exclude that row from any count, never silently treat a failed read as empty/not-set.

## Write verification

Per `packs/recruiting/config/notion.md` query conventions: after every write, re-read the row back (`notion-fetch` or a targeted query) and confirm the new value matches before reporting success to the operator. A write that isn't re-read is not confirmed.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Notion unavailable | Halt that data source's section, tell the operator "Notion: unreachable," never fall back to a prior session's cached rows |
| Rate-limited | Back off, retry once; if still failing, report partial results explicitly labeled incomplete |
| Permission-denied (machine user lacks access to the data source) | Halt, escalate to the accountable human as a credential/grant issue — do not proceed on partial access |
| Ambiguous result (duplicate/near-duplicate candidate rows) | Present both rows to the operator; never guess which is authoritative or write to either |

## Capability gaps today

No push/subscribe mechanism — "new applicant → Slack within minutes, any hour" (F9) can only be achieved by polling `notion-query-data-sources` on a tight cron; latency is bounded by cron cadence, not a real-time event. See `crons.md` for the polling interval chosen to approximate this.

## Credentials required

- Notion integration token for the recruiting agent's own machine user (never a human's), scoped to the Applicants data source and Careers page — provided by: Founder (Notion workspace admin, OAuth/integration grant) — gate G7, `docs/gates.md`.
