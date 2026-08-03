<!-- Purpose: the people-ops qm scope — steady-state HR operations, instantiated from scopes/_template.md per master PRD §4 row 3. -->

# Scope: people-ops

## Scope id

`people-ops` — order 3 in `org-config.md` Scopes table, P2. Performs **zero** HRMS writes today (`platform/contracts/hrms.md` — "What we write: None"); see Write/send enforcement below for what governs the day a write tool exists.

## Agent identity config pointer

`packs/people-ops/config/agent.md` — TODO(gate): agent public name, who: Founder (gate G8, `docs/gates.md`; same naming gate the recruiting agent's name is waiting on — PRD §11 open question 6). Filled from `packs/shared/config/agent.md.example`.

## Packs imported

1. `packs/shared` (identity, trust-ladder, retro, goals/standup — always first)
2. `packs/people-ops` — policy Q&A (citation-only), leave/attendance/expense-status HRMS queries, payroll-cutoff input packets, letters (drafts), vendor-renewal reminders (master PRD §4 row 3)

## Connectors required

- Notion (Policies wiki + Employees DB cross-reference): `platform/contracts/notion-employees.md` — TODO(gate): neither object exists yet (gates G16, G17, `docs/gates.md`); People-Ops is read-only against both
- HRMS (read-only leave/attendance/employee-record queries + payroll-cutoff calendar): `platform/contracts/hrms.md` — TODO(gate): provider undecided, no credentials (gates G14, G15, `docs/gates.md`). **No HRMS write action-class exists for this scope today; see Write/send enforcement below for what governs the day one is proposed.**
- Slack (#people): `platform/contracts/slack.md`
- Gmail (letters drafts — employment verification, address proof; a human signatory sends): `platform/contracts/gmail.md`
- Google Calendar: not bound yet — `packs/people-ops/config/agent.md` defers this ("add when a skill needs it"); no `people-ops` skill exercises Calendar in P2, so it is not listed as required here (ADR-005: don't bind a connector before a skill needs it)

## Write/send enforcement

There is no per-scope posture dial (`command-policy.md` §7 — "no posture, no knob"). In P2 this scope performs **zero** HRMS writes: its only HRMS interaction is read-only queries plus a drafted "payroll input packet" handed to the accountable human (`platform/contracts/hrms.md` — "What we write: None"). What actually protects this scope on the day an `hrms-write` tool exists: its destructive actions (record delete, record overwrite) are already staged as `deny` rules in `command-policy.md` §5a, and any other HRMS-write action-class this scope might propose starts at `require_approval` like every write action-class does (§2's L0 floor) until it earns L1 on measured evidence. That is already correct the day a write path appears — it does not default to permissive by omission. Every other action-class this scope performs (policy Q&A, HRMS reads, letters, vendor renewals) is draft-only today; no write/send tool has shipped for it yet.

## Cron ids bound

- `people-ops-payroll-cutoff-reminder` (payroll-cutoff input packet, cadence pending HRMS provider decision)
- `people-ops-vendor-renewal-reminder`
- `people-ops-standup` (08:30 IST → #people)
- `people-ops-evidence-rollup` (weekly promotion-evidence rollup)
- `people-ops-retro` (weekly playbook-PR retro)

See `crons.md` for full schedule detail.

## Action-classes with current trust level

The slug column is the canonical action-class vocabulary — it must match `packs/people-ops/config/evidence.md` exactly, and it is what the evidence rollup and any promotion PR cite (`./_template.md`). This scope's five tracked classes already matched 1:1 with `evidence.md`'s slugs — nothing invented or merged here.

| Action-class | Slug | Current level | Notes |
|---|---|---|---|
| Policy Q&A response (employee-facing) | `policy_qa_response` | L0 | Never answerable at all without a citation to a real Policies-wiki page (`platform/contracts/notion-employees.md`), regardless of level; candidate for L1 once 2 weeks of unedited-draft evidence exists |
| Leave/attendance/expense-status query response | `leave_attendance_query_response` | L0 | Read-only against HRMS; candidate for L1 as a routine, low-judgment class |
| Letter draft (employment verification, address proof, ...) | `letter_draft` | L0 | Always requires a human signatory regardless of level — promotion affects draft-to-signatory speed, never removes the signature step |
| Payroll input packet (to accountable human, ahead of HRMS cutoff) | `payroll_input_packet` | L0 (internal coordination, not an external send) | Never promotes to an HRMS write — P2 hard scope limit per `platform/contracts/hrms.md`; revisit only after the HRMS provider decision (gate G14) and a written ADR |
| Vendor renewal notice/reminder | `vendor_renewal_notice` | L0 | Any spend/contract commitment is a human gate (CLAUDE.md autonomy & human gates) regardless of trust-ladder level |
| HRMS write of any kind | n/a | **NOT IN SCOPE (P2)** | Not an action-class this scope performs at all, so no evidence accumulates — distinct from a never-delegated hard deny, which is a permanent policy rule rather than a pending-decision scope limit. **`command-policy.md` §5a's staged `deny` rules against `hrms-write`** are the standing backstop for the day a write path is ever proposed; revisit only when Keka vs RazorpayX is decided (gate G14) and a written ADR supersedes this line |
| Offers / comp / terminations / performance judgments / post-interview rejections / policy changes | n/a | NEVER DELEGATED | Hard deny, `command-policy.md` §4, all postures, all levels |

## Accountable human

Founder — reviews this agent's PRs, drafts, and incidents until a People Lead is hired (master PRD §5; `packs/people-ops/config/agent.md`).

## Memory / knowledge sources

- `brain/` — company policies (git-canonical per ADR-003), decisions, and the people-ops playbook
- `packs/people-ops/config/agent.md` — identity, goals summary, trust-ladder mirror
- `packs/people-ops/config/letters/` — letter templates (no PII, synthetic fixtures only per CLAUDE.md conventions)
- `packs/people-ops/config/goals.md` — scoreboard

## Gates outstanding

- TODO(gate): agent public name — who: Founder (gate G8, `docs/gates.md`)
- TODO(gate): Notion Employees DB creation + machine-user grant — who: Founder (gate G16, `docs/gates.md`)
- TODO(gate): Notion Policies wiki creation + machine-user grant — who: Founder (gate G17, `docs/gates.md`)
- TODO(gate): HRMS provider decision — who: Founder (gate G14, `docs/gates.md`)
- TODO(gate): HRMS credentials — who: Founder (gate G15, `docs/gates.md`)
- TODO(gate): this agent's own mailbox/Slack bot handle/GitHub account — who: CTO. No gate row in `docs/gates.md` currently names this distinctly (G5/G6/G9 are worded specifically for the `recruiter` scope's identity) — flagged as a gap in the phase report rather than assigned a fabricated ID here
