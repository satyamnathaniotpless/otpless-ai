<!-- Purpose: the culture qm scope — pulse surveys, 1:1 cadence, review-cycle + anniversary + offboarding process — instantiated from scopes/_template.md per master PRD §4 row 5. -->

# Scope: culture

## Scope id

`culture` — order 5 in `org-config.md` Scopes table, P3.

## Agent identity config pointer

The Culture & Growth agent's own pack config path (expected shape: an `agent.md` under that pack's `config/`, filled from `packs/shared/config/agent.md.example`, matching every other scope) — the pack does not exist on disk as of this writing (concurrent build); this scope file is the authoritative pointer until it lands. TODO(gate): agent public name, who: Founder (gate G8, `docs/gates.md`; same naming gate every other agent's identity is waiting on — master PRD §11 open question 2).

## Packs imported

1. `packs/shared` (identity, trust-ladder, retro, goals/standup — always first)
2. The Culture & Growth agent's own skill pack — pulse surveys, 1:1 cadence nudges, review-cycle orchestration (process only; humans write reviews), anniversaries, offboarding checklists + exit interviews (structured; a human reviews transcripts) (master PRD §4 row 5). Not yet built as of this writing — a concurrent build owns it; this scope file states the connectors, posture, and trust ladder it will run under regardless of the pack's internal shape.

## Connectors required

- Notion — Employees DB (anniversary dates, review-cycle scheduling metadata, offboarding checklist status): `platform/contracts/notion-employees.md` — read/checklist-write only, no policy or record content; TODO(gate): the Employees DB itself does not exist yet (gate G16, `docs/gates.md`)
- Pulse-survey tooling: **no contract file exists for this system** — tool/vendor undecided. Flagged as a capability/contract gap (a new contract file is needed once a tool is chosen, following this index's own shape — `platform/contracts/README.md`), not worked around — TODO(gate): pulse-survey tooling decision, who: Founder — gate G24, `docs/gates.md`
- Slack (`#people`): `platform/contracts/slack.md` — pulse-survey nudges, 1:1 cadence nudges, anniversary recognition, offboarding/exit-interview scheduling logistics only; never review content, never exit-interview content (see PII note below)
- Google Calendar / Gmail: not bound — no culture action-class exercises either in P3, so neither is listed as required here (ADR-005: don't bind a connector before a skill needs it), matching the pattern `people-ops.md` already set for Calendar; revisit if exit-interview or review-cycle scheduling ends up needing calendar writes

## Security posture

**Auto** (org default) — per `command-policy.md` §7 ("`onboarder`, `analyst`, `culture` ... inherit org default"). Auto affects content screening, not the trust ladder below; every action-class still starts at L0.

## Cron ids bound

- `culture-standup` (08:30 IST → `#people`)
- `culture-pulse-survey-cycle` (cadence pending pulse-survey tooling decision, gate G24)
- `culture-1on1-nudge` (weekly, Monday 08:30 IST → `#people`)
- `culture-anniversary-check` (08:30 IST → `#people`)
- `culture-evidence-rollup` (weekly promotion-evidence rollup)
- `culture-retro` (weekly playbook-PR retro)

See `crons.md` for full schedule detail.

## Action-classes with current trust level

Every action-class below starts at **L0** (drafts/internal-post only), with the same shared evidence layer as every other scope as its sole promotion path: the weekly evidence rollup (`packs/shared/metrics/SKILL.md`, ADR-008) feeds the ≥95%-unedited-over-the-window gate in `command-policy.md` §3. This scope and `analyst` sit closest to the never-delegated line of any launched scope — two rows below are hard-denied for this scope specifically, in addition to the org-wide list.

The slug column is the canonical action-class vocabulary — it must match `packs/culture/config/evidence.md` exactly, and it is what the evidence rollup and any promotion PR cite (`./_template.md`). Six of these rows already matched 1:1 with `evidence.md`'s slugs; **`peer_feedback_relay` was added to this table during this reconciliation pass** — `evidence.md` tracked it, this table did not. `evidence.md`'s `exit_interview_transcript_delivery` needs no row of its own here: it is marked non-evidence-eligible there and corresponds to the "Exit-interview content" hard-deny row below, not a promotable class.

| Action-class | Slug | Current level | Notes |
|---|---|---|---|
| Pulse-survey cycle (launch / nudge / close a survey window) | `pulse_survey_invite` | L0 | Reported results are aggregate participation/response-rate only — no individual response is ever attributed or quoted |
| 1:1 cadence nudge (reminder that a manager/report pair is overdue) | `one_on_one_nudge` | L0 | Nudge only — no 1:1 conversation content is ever agent-visible, agent-summarized, or agent-authored |
| Review-cycle orchestration (process: reminders, deadline tracking, form distribution) | `review_cycle_reminder` | L0 | **Process only.** The agent runs the calendar/checklist; a human writes every word of review content (master PRD §4 row 5) — see the hard-deny row below |
| Peer feedback relay (delivering human-authored feedback text between parties) | `peer_feedback_relay` | L0 | Per-instance content is human-authored, not agent-composed — do not propose above L0 without an explicit human decision regardless of rate, same reasoning as recruiting's `outreach_send` |
| Anniversary recognition (shoutout draft, milestone tracking) | `anniversary_message` | L0 | Draft only, same approval gate as every channel |
| Offboarding checklist tracking | `offboarding_checklist_nudge` | L0 | Checklist/process only |
| Exit-interview scheduling (logistics only) | `exit_interview_invite` | L0 | Scheduling only — see the hard-deny row below for the content itself |
| **Review-cycle content** (writing, editing, or summarizing actual review text/ratings) | n/a | **NEVER DELEGATED (scope-specific)** | Humans write reviews; the agent runs the process, full stop (master PRD §4 row 5). This restates `command-policy.md` §4's "performance judgments" line as a standing scope rule, not a new exception to it |
| Exit-interview transcript delivery (private, one-directional handoff of the verbatim transcript to the accountable human) | `exit_interview_transcript_delivery` | L0, permanently | Not evidence-eligible and never promoted: it is a private handoff, not a routine send whose speed a promotion would improve. Delivering it faster without a human reading it is the failure, not the goal. |
| **Exit-interview content** (interpreting, summarizing, or acting on transcript substance) | n/a | **NEVER DELEGATED (scope-specific)** | Structured intake only; **a human reviews every transcript** (master PRD §4 row 5). The agent may prepare the structured question list and handle scheduling logistics — it never reads a transcript's substance and reports or acts on it |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | NEVER DELEGATED | Hard deny, `command-policy.md` §4, all postures, all levels |

## Accountable human

Founder — reviews this agent's PRs, drafts, and incidents until a People Lead is hired (master PRD §5).

## Memory / knowledge sources

- `brain/` — company policies, decisions, and the culture/growth playbook mirrored per ADR-003
- The Culture & Growth agent's own pack config (identity, goals, trust-ladder mirror) — not yet built as of this writing; see "Packs imported" above
- `platform/evidence/` — the weekly rollup files this scope's own promotion path reads (ADR-008)

## Gates outstanding

- TODO(gate): agent public name — who: Founder (gate G8, `docs/gates.md`)
- TODO(gate): Notion Employees DB creation + machine-user grant — who: Founder (gate G16, `docs/gates.md`)
- TODO(gate): pulse-survey tooling decision — who: Founder (gate G24, `docs/gates.md`)
- TODO(gate): this agent's own mailbox/Slack bot handle/GitHub account — who: CTO. No existing gate row names this distinctly (G5/G6/G9 are worded specifically for the `recruiter` scope's identity) — flagged as a gap in the phase report rather than assigned a fabricated ID here, same convention `onboarder.md`/`people-ops.md` already use
