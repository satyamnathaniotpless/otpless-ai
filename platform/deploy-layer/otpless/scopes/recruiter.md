<!-- Purpose: the recruiter qm scope, filled from the PRDs — first scope created, per org-config.md load order. -->

# Scope: recruiter

## Scope id

`recruiter` — order 1 in `org-config.md` Scopes table, P0/P1.

## Agent identity config pointer

`packs/recruiting/config/agent.md` — TODO(gate): agent public name, who: Founder (gate G8, `docs/gates.md`; per PRD §11 open question 6 — never picked unilaterally). Filled from `packs/shared/config/agent.md.example`; mailbox/Slack handle/interviewer list from `packs/recruiting/config/user.md` (gitignored, template at `user.md.example`).

## Packs imported

1. `packs/shared` (identity, trust-ladder, retro, goals/standup — always first)
2. `packs/recruiting` — F1–F9 skills, job playbooks, Notion/Gmail/Calendar/Slack config

## Connectors required

- Notion: `platform/contracts/notion.md`
- Gmail: `platform/contracts/gmail.md`
- Google Calendar: `platform/contracts/calendar.md`
- Slack: `platform/contracts/slack.md`
- WhatsApp Business API: not yet wired (Phase 3, PRD §6) — until then, agent drafts message text for manual paste; no contract file yet, add one when it lands

## Security posture

**Auto** (org default) — per `command-policy.md` §7. Candidate-facing sends still gated per trust ladder regardless of posture (Auto affects content screening, not the trust ladder).

## Cron ids bound

- `recruit-watch-applicant` (F9, new-applicant leg)
- `recruit-watch-sla` (F9, SLA-breach leg)
- `recruit-triage-digest` (F1 digest, 08:30 IST → #hiring)
- `recruit-standup` (08:30 IST → #people)
- `recruit-pipeline-report` (F7, Monday 08:30 IST → #hiring)
- `recruit-retro` (weekly playbook-PR retro)

See `crons.md` for full schedule detail.

## Action-classes with current trust level

The slug column is the canonical action-class vocabulary — it must match `packs/recruiting/config/evidence.md` exactly, and it is what the evidence rollup and any promotion PR cite (`./_template.md`). Three rows below (`application_acknowledgment`, `followup_nudge`, `stage_advance`) and two slugs (`candidate_qa_reply`, `slack_digest_post`, `notion_record_write`) were reconciled against that file during this pass — see the phase report for what was invented vs. merged and why.

| Action-class | Slug | Current level | Notes |
|---|---|---|---|
| Outreach (new) | `outreach_send` | L0 | Never above L0 without a human review step per playbook (`command-policy.md` §3) |
| Candidate Q&A replies | `candidate_qa_reply` | L0 | |
| Scheduling confirmations | `scheduling_confirmation` | L0 | Candidate for L1 once 2 weeks of unedited-draft evidence exists |
| Application acknowledgment | `application_acknowledgment` | L0 | Auto-reply confirming a new application was received; candidate for L1, same G13 send-capability precondition as `outreach_send` |
| Outreach follow-up nudge (3-day / 7-day silence) | `followup_nudge` | L0 | Same G13 precondition as `outreach_send` before any promotion |
| Applied-stage rejection | `applied_stage_rejection` | L0 | Candidate for L2 per trust-ladder, not before a clean 4-week window |
| Stage-advance notification | `stage_advance` | L0 | Candidate-facing advance notice; L2-eligible at the earliest. Advance-to-onsite is excluded and stays human (PRD §12.3) |
| Post-work-sample/onsite rejection | n/a | NEVER DELEGATED | Post-interview rejection — hard deny, `command-policy.md` §4 |
| Slack digest/summary posts (#hiring, #people) | `slack_digest_post` | L0 | Post-to-human-channel starts at L0 per `command-policy.md` §2 until evidence-based promotion |
| Notion stage/flag/scorecard writes | `notion_record_write` | L0 (internal write, not send) | Not an external send, but still verified per `platform/contracts/notion.md` write-verification step |
| Offers / comp / terminations / performance judgments / policy changes | n/a | NEVER DELEGATED | Hard deny, `command-policy.md` §4, all postures, all levels |

## Accountable human

Founder — owns Founding Recruiter/Security/ML pipelines and all offers/comp/closes (`packs/recruiting/config/user.md`).

## Memory / knowledge sources

- `brain/` — company policies, decisions, and any recruiting playbook mirrored per ADR-003
- `packs/recruiting/config/notion.md` — Notion IDs/properties/stages
- `packs/recruiting/config/playbook.md` — interaction loop, priority order, templates, tone
- `packs/recruiting/config/jobs/<role>.md` — per-role bar, outreach hooks, work-sample brief, comp band
- `packs/recruiting/config/user.md` — operator/agent identity, logistics (gitignored)

## Gates outstanding

- TODO(gate): agent public name approval — who: Founder (gate G8, `docs/gates.md`)
- TODO(gate): Notion integration token/grant for the recruiting machine user — who: Founder (gate G7, `docs/gates.md`)
- TODO(gate): Gmail OAuth + SPF/DKIM DNS for `recruiting@otpless.com` — who: CTO (gate G5, `docs/gates.md`)
- TODO(gate): Google Calendar OAuth for the agent's own calendar — who: CTO (gate G5, `docs/gates.md`)
- TODO(gate): Slack bot token/app install scoped to `#hiring`/`#people` — who: CTO (gate G6, `docs/gates.md`)
- TODO(gate): Gmail MCP send capability — currently draft/label/read only (see `platform/contracts/gmail.md` capability gap, ADR-007); extending the MCP, not a workaround, is the fix — gate G13, `docs/gates.md`, owner CTO, before any send action-class can promote past L0
