<!-- Purpose: the analyst qm scope — the numbers: funnel, headcount, comp-band drift, attrition signals — instantiated from scopes/_template.md per master PRD §4 row 4. -->

# Scope: analyst

## Scope id

`analyst` — order 4 in `org-config.md` Scopes table, P3.

## Agent identity config pointer

The Analyst's own pack config path (expected shape: an `agent.md` under that pack's `config/`, filled from `packs/shared/config/agent.md.example`, matching every other scope) — the pack does not exist on disk as of this writing (concurrent build); this scope file is the authoritative pointer until it lands. TODO(gate): agent public name, who: Founder (gate G8, `docs/gates.md`; same naming gate every other agent's identity is waiting on — master PRD §11 open question 2).

## Packs imported

1. `packs/shared` (identity, trust-ladder, retro, goals/standup — always first)
2. The Analyst's own skill pack — hiring funnel, time-in-stage, source ROI, headcount, comp-band drift vs market, attrition signals, weekly People report to leadership, monthly deep-dive, data-hygiene ownership across the Notion/HRMS spine (master PRD §4 row 4). Not yet built as of this writing — a concurrent build owns it; this scope file states the connectors, posture, and trust ladder it will run under regardless of the pack's internal shape.

## Connectors required

- Notion — Applicants DB: `platform/contracts/notion.md` (funnel, time-in-stage, source ROI) — read-only
- Notion — Employees DB: `platform/contracts/notion-employees.md` (headcount, attrition signals) — read-only; TODO(gate): the Employees DB itself does not exist yet (gate G16, `docs/gates.md`)
- HRMS (headcount/comp-band cross-reference): `platform/contracts/hrms.md` — read-only; TODO(gate): provider undecided, no credentials (gates G14, G15, `docs/gates.md`)
- Comp-band market-data source (external salary-benchmark data, needed for the monthly comp-band-drift-vs-market deep-dive): **no contract file exists for this system** — source undecided. Flagged as a capability/contract gap (a new contract file is needed once a source is chosen, following this index's own shape — `platform/contracts/README.md`), not worked around — TODO(gate): comp-band market-data source decision, who: Founder — gate G23, `docs/gates.md`
- Slack (`#people`): `platform/contracts/slack.md` — every report this scope posts is aggregate counts/rates only, never a named or individual figure (see PII note below)
- Google Calendar / Gmail: not bound — no analyst action-class exercises either in P3, so neither is listed as required here (ADR-005: don't bind a connector before a skill needs it), matching the pattern `people-ops.md` already set for Calendar

## Security posture

**Auto** (org default) — per `command-policy.md` §7 ("`onboarder`, `analyst`, `culture` ... inherit org default"). Auto affects content screening, not the trust ladder below; every action-class still starts at L0.

## Cron ids bound

- `analyst-standup` (08:30 IST → `#people`)
- `analyst-weekly-report` (Monday 08:30 IST → `#people`, weekly People report to leadership)
- `analyst-monthly-deepdive` (monthly, comp-band drift vs market + deeper trend analysis)
- `analyst-evidence-rollup` (weekly promotion-evidence rollup)
- `analyst-retro` (weekly playbook-PR retro)

See `crons.md` for full schedule detail.

## Action-classes with current trust level

Every action-class below starts at **L0** (drafts/internal-post only), with the same shared evidence layer as every other scope as its sole promotion path: the weekly evidence rollup (`packs/shared/metrics/SKILL.md`, ADR-008) feeds the ≥95%-unedited-over-the-window gate in `command-policy.md` §3. No analyst action-class inherits evidence from any other scope, and none skips the rollup.

The slug column is the canonical action-class vocabulary — it must match `packs/analytics/config/evidence.md` exactly, and it is what the evidence rollup and any promotion PR cite (`./_template.md`). This scope's four tracked classes already matched 1:1 with `evidence.md`'s slugs (that file was authored against this scope's eventual shape) — nothing invented or merged here.

| Action-class | Slug | Current level | Notes |
|---|---|---|---|
| Weekly People report (funnel, time-in-stage, source ROI, headcount, attrition signals) | `weekly_people_report_post` | L0 | **Outputs are aggregate-only** — counts, rates, and trends, never a figure attributable to one candidate or employee; promotion candidate once 2 weeks of unedited-draft evidence exist |
| Monthly deep-dive (comp-band drift vs market, deeper trend analysis) | `monthly_deepdive_post` | L0 | Same aggregate-only rule; a comp-band comparison is band-level, never an individual's comp — comp disclosure of any kind is `command-policy.md` §4 never-delegated regardless of this scope's own trust level |
| Data-hygiene fix proposal (Notion/HRMS spine) | `data_hygiene_flag` | L0 | Proposes a fix only ("N rows missing Source, propose backfill from X"); any Notion/HRMS write this proposal leads to is itself a write against that system's own contract and posture — this row governs the proposal, not the write |
| Ad hoc metrics query response (headcount, pipeline depth, funnel snapshot, etc.) | `ad_hoc_analysis_response` | L0 | Aggregate-only, same as the weekly report row |
| Offers / comp (individual) / terminations / performance judgments / post-interview rejections / policy changes | n/a | NEVER DELEGATED | Hard deny, `command-policy.md` §4, all postures, all levels — the Analyst reports on comp **bands** in aggregate only; it never discloses, negotiates, or judges an individual's comp |

## Accountable human

Founder — reviews this agent's PRs, drafts, and incidents until a People Lead is hired (master PRD §5).

## Memory / knowledge sources

- `brain/` — company policies, decisions, and the analytics playbook mirrored per ADR-003
- The Analyst's own pack config (identity, goals, trust-ladder mirror) — not yet built as of this writing; see "Packs imported" above
- `platform/evidence/` — the weekly rollup files this scope's own promotion path reads (ADR-008)

## Gates outstanding

- TODO(gate): agent public name — who: Founder (gate G8, `docs/gates.md`)
- TODO(gate): Notion Employees DB creation + machine-user grant (read access) — who: Founder (gate G16, `docs/gates.md`)
- TODO(gate): HRMS provider decision — who: Founder (gate G14, `docs/gates.md`)
- TODO(gate): HRMS credentials (read-only) — who: Founder (gate G15, `docs/gates.md`)
- TODO(gate): comp-band market-data source decision — who: Founder (gate G23, `docs/gates.md`)
- TODO(gate): this agent's own mailbox/Slack bot handle/GitHub account — who: CTO. No existing gate row names this distinctly (G5/G6/G9 are worded specifically for the `recruiter` scope's identity) — flagged as a gap in the phase report rather than assigned a fabricated ID here, same convention `onboarder.md`/`people-ops.md` already use
