<!-- Purpose: the onboarder qm scope — offer-accept → day 90, instantiated from scopes/_template.md per master PRD §4 row 2. -->

# Scope: onboarder

## Scope id

`onboarder` — order 2 in `org-config.md` Scopes table, P2 (timed to first joiners from the 7-hire sprint).

## Agent identity config pointer

`packs/onboarding/config/agent.md` — TODO(gate): agent public name, who: Founder (gate G8, `docs/gates.md`; same naming gate the recruiting agent's name is waiting on — PRD §11 open question 6). Filled from `packs/shared/config/agent.md.example`.

## Packs imported

1. `packs/shared` (identity, trust-ladder, retro, goals/standup — always first)
2. `packs/onboarding` — offer-accept → day-90 lifecycle skills: BGV orchestration, provisioning checklists, buddy assignment, 30/60/90 check-ins, notice-period warmth, paperwork/doc collection, day-one plan enforcement (master PRD §4 row 2)

## Connectors required

- Notion (Employees DB): `platform/contracts/notion-employees.md` — TODO(gate): Employees DB does not exist yet (gate G16, `docs/gates.md`)
- HRMS (read-only cross-check of employee record, once created): `platform/contracts/hrms.md` — TODO(gate): provider undecided, no credentials (gates G14, G15, `docs/gates.md`)
- Slack (#people handoffs, standup, nudges): `platform/contracts/slack.md`
- Google Calendar (buddy sessions, 30/60/90 check-in scheduling): `platform/contracts/calendar.md`
- Gmail (paperwork/notice-period-warmth touchpoints to a new hire's personal address before a company mailbox exists): `platform/contracts/gmail.md` — same draft-only, no-send-capability gap as the `recruiter` scope (ADR-007, gate G13)
- WhatsApp Business API: not yet wired (Phase 3, PRD §6) — same as `recruiter` scope; agent drafts message text for manual paste; no contract file yet
- BGV vendor (SpringVerify/OnGrid): **no contract file exists for this system** — vendor undecided (`packs/onboarding/config/vendors.md`, gate G18, `docs/gates.md`). Flagged as a capability/contract gap (a new `platform/contracts/bgv.md` is needed once a vendor is chosen), not worked around — every BGV-touching skill drafts a request for a human to submit through the vendor's own portal until then

## Security posture

**Auto** (org default) — per `command-policy.md` §7 ("`onboarder`, `analyst`, `culture` ... inherit org default"). Employee/new-hire-facing sends are still gated per the trust ladder regardless of posture — Auto affects content screening, not the trust ladder.

## Cron ids bound

- `onboard-watch-hire` (offer-accepted handoff leg)
- `onboard-notice-period-touchpoint` (weekly warmth cadence)
- `onboard-checkin-nudge` (30/60/90 nudges)
- `onboard-standup` (08:30 IST → #people)
- `onboard-evidence-rollup` (weekly promotion-evidence rollup)
- `onboard-retro` (weekly playbook-PR retro)

See `crons.md` for full schedule detail.

## Action-classes with current trust level

The slug column is the canonical action-class vocabulary — it must match this pack's `config/evidence.md` exactly, once that file exists, and it is what the evidence rollup and any promotion PR cite (`./_template.md`). **All seven slugs below were invented during this reconciliation pass**: `packs/onboarding/config/` has no `evidence.md` on disk at all (unlike every other pack's evidence config), so there was no existing vocabulary to reconcile against — see the phase report. Creating that file, using these exact slugs, is flagged there as follow-up work.

| Action-class | Slug | Current level | Notes |
|---|---|---|---|
| Notice-period touchpoint (weekly warmth message) | `notice_period_touchpoint` | L0 | Highest-volume class; candidate for L1 once 2 clean weeks of unedited-draft evidence exist (`packs/shared/metrics/SKILL.md`) |
| BGV initiation / nudge | `bgv_initiation_nudge` | L0 | Vendor account gate (G18) blocks any real send regardless of level — see `packs/onboarding/config/vendors.md` |
| Paperwork reminder | `paperwork_reminder` | L0 | |
| Provisioning request (devices/accounts to IT/Admin) | `provisioning_request` | L0 | |
| Day-one plan confirmation / #people post | `day_one_plan_confirmation` | L0 | Post-to-human-channel starts at L0 per `command-policy.md` §2 |
| Buddy assignment proposal | `buddy_assignment_proposal` | L0 | Proposes only; a human confirms which employee's time gets committed |
| 30/60/90 check-in scheduling | `checkin_scheduling` | L0 | |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | NEVER DELEGATED | Hard deny, `command-policy.md` §4, all postures, all levels — comp/offer questions raised during notice period are routed to a human, never answered |

## Accountable human

Founder — reviews this agent's PRs, drafts, and incidents until a People Lead is hired (master PRD §5; `packs/onboarding/config/agent.md`).

## Memory / knowledge sources

- `brain/` — company policies, decisions, and the onboarding playbook mirrored per ADR-003
- `packs/onboarding/config/agent.md` — identity, goals summary, trust-ladder mirror
- `packs/onboarding/config/vendors.md` — BGV/IT vendor pointers (no vendor named until gate clears, ADR-005)
- `packs/onboarding/config/checklists/<role>.md` — per-role onboarding checklist, instantiated from `checklists/_template.md`
- `packs/onboarding/config/goals.md` — scoreboard

## Gates outstanding

- TODO(gate): agent public name — who: Founder (gate G8, `docs/gates.md`)
- TODO(gate): Notion Employees DB creation + machine-user grant — who: Founder (gate G16, `docs/gates.md`)
- TODO(gate): HRMS provider decision — who: Founder (gate G14, `docs/gates.md`)
- TODO(gate): HRMS credentials — who: Founder (gate G15, `docs/gates.md`)
- TODO(gate): BGV vendor account (SpringVerify vs OnGrid) — who: Founder (gate G18, `docs/gates.md`)
- TODO(gate): this agent's own mailbox/Calendar OAuth, Slack bot handle, and GitHub account — who: CTO. No gate row in `docs/gates.md` currently names this distinctly (G5/G6/G9 are worded specifically for the `recruiter` scope's `recruiting@otpless.com`/`#hiring` identity) — flagged as a gap in the phase report rather than assigned a fabricated ID here
