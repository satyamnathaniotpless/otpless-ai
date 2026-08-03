<!-- Purpose: contract between People-Ops/Onboarder skills and the HRMS — the payroll/leave/attendance/compliance system of record — written against the capability, not a vendor, because the provider (Keka vs RazorpayX Payroll) is undecided. -->

# Contract: HRMS

## Purpose

HRMS — the commercial system of record for payroll, leave, attendance, and compliance (master PRD §2 non-goal: "agents orchestrate around it," never replace or bypass it). Provider is **undecided** (Keka vs RazorpayX Payroll — master PRD §11 open question 1) — see "Credentials required" below for the gate. **P2 is read-only, full stop: no skill in `onboarder` or `people-ops` ever writes to the HRMS, and no skill ever bypasses it as the authoritative source for payroll/leave/attendance/compliance data, in any posture, at any trust level.**

## Mechanism

**Undecided**, and blocked behind the provider decision itself (gate G14) — neither Keka nor RazorpayX Payroll is one of qm's OAuth-provider connectors (confirmed live today: Google, Notion, Slack — `platform/contracts/README.md`). The two real candidates, per qm's actual mechanism set:

1. **A sandbox tool** — `sandbox/tools/<id>/tool.json` plus an executable in the sandbox image, with `egress` declaring the chosen provider's API host as intent (validated-only in contract v1 — ADR-010 correction §1; confinement comes from the G27 proxy, not this field), and `auth`/`approvals` fields making the read-only posture above platform-enforced rather than a skill-level promise.
2. **A plugin** — a prebuilt image running alongside the qm services, declared in `qm.config.jsonc`, if the chosen provider's integration needs its own long-running service rather than a callable tool.

Neither is chosen, and the choice cannot be made until the provider itself is chosen (gate G14).

## What we read

- Leave balance query (per employee): People-Ops leave/attendance Q&A (master PRD §4 row 3).
- Attendance record query (per employee, date range): People-Ops leave/attendance Q&A.
- Employee record (canonical HRMS-side fields — name, role, start date, employment status): cross-checked by Onboarder/People-Ops against the Notion Employees DB mirror (`platform/contracts/notion-employees.md`). The HRMS is authoritative for payroll/compliance fields; the Notion Employees DB is authoritative for lifecycle/coordination fields — this contract never lets a skill treat the Notion mirror as if it overrides an HRMS value, or vice versa, for the field each system owns.
- Payroll cutoff calendar: the recurring dates by which payroll inputs must reach the HRMS, read so People-Ops can schedule its own reminder crons (`crons.md`) ahead of each cutoff.

## What we write

**None.** This is the absolute rule this contract exists to state, not a default that erodes under a busy week. What master PRD §4 calls "payroll cycle coordination (inputs to Keka/RazorpayX by cutoff dates)" is a **drafted input packet** listing new joiners, leavers, and leave-balance deltas, delivered privately to the accountable human — email or an access-controlled document — who keys it into the HRMS's own input flow themselves. It is never posted to a Slack channel or DM: the packet carries per-employee compensation-adjacent detail, and a Slack surface (including a cron digest) gets counts and urgency only, never a name attached to a payroll change and never a figure (master PRD §6 Slack minimization; `packs/people-ops/payroll-prep/SKILL.md`). No skill calls an HRMS write/update/create endpoint, even if the eventually-chosen vendor's API exposes one, even once an action-class reaches L1/L2. Trust-ladder promotion for a "payroll input packet" action-class only ever promotes how fast the drafted packet reaches the human — never whether the write is agent-executed. A future HRMS-write action-class would be a distinct, newly-authored action-class requiring its own ADR and `command-policy.md` row; it does not inherit any evidence accumulated by the read-only classes above.

## Field & name mapping

Provider undecided (gate G14, `docs/gates.md`) — this contract is written against the capability (leave balance, attendance, employee record, payroll cutoff calendar), not a vendor's field names, per the brief that produced it. Once the provider is chosen, the real field/property names and endpoint shapes live in `packs/people-ops/config/hrms.md` (created then, per ADR-005 — data, not process); this contract file does not need to change when the vendor lands unless the chosen API's actual capability differs from the four reads listed above (e.g. no payroll-cutoff-calendar endpoint exists), in which case this file is amended to match reality.

## Staleness & re-query semantics

The HRMS is authoritative for leave/attendance/payroll state, and real employees and the accountable human edit it directly, constantly, through the vendor's own app — same split-brain rule as every other contract (PRD §8): re-query fresh before answering any leave/attendance question; never reuse a balance or attendance value read earlier in the same session.

"Not set" vs "unknown": a leave balance that reads as zero, or an attendance record with no punches for a given date, is a real, reportable state ("no leave remaining," "no attendance logged that day"). A query that fails, times out, or returns nothing because the connector isn't wired yet is *unknown* — the skill must say "HRMS: couldn't check" (or, pre-gate, "HRMS: not yet connected") and exclude that row from any count. An unreachable HRMS must never be silently rendered as a zero balance or an absent leave record.

## Write verification

Not applicable — this contract authorizes no writes (see "What we write" above). If a future ADR authorizes an HRMS-write action-class, that ADR must add a write-verification method here (re-read after write, following the pattern in `notion.md` / `notion-employees.md`) before any skill may call it. This section stays empty by design, not by oversight, until that day.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| System unavailable | Halt that section, report "HRMS: unreachable," never estimate a leave balance or attendance record from a prior session |
| Rate-limited | Back off, retry once; report partial results explicitly labeled incomplete |
| Permission-denied | Halt, escalate to the accountable human as a credential/grant issue |
| Ambiguous result (e.g. two employee records matching a name) | Present both to the accountable human; never guess which is authoritative, never average or merge their values |
| Connector not yet wired (pre-gate) | Every read in this contract degrades to "HRMS: not yet connected" — a distinct state from post-gate-unavailable, never rendered as "found nothing" |

## PII handling

HRMS carries the most consequential employee-financial data this platform reads: leave balances, attendance/punch records, loss-of-pay calculations, exit dates, and the payroll inputs derived from them. This is employee data, and employee PII is handled stricter than candidate PII everywhere on this platform (master PRD §6, DPDP) — nothing here inherits the looser candidate-data handling used in `notion.md` / `gmail.md`.

The channel rule already stated narrowly for the payroll packet in "What we write" is the general rule for every HRMS-derived fact: **a Slack surface — a channel post, a DM, or a cron digest — gets counts and urgency only, never a field value.** "3 leave requests pending this week" is fine; "{name}'s leave balance is -2 days" or "{name}'s LOP this cycle is ₹X" is not, on any channel, at any trust level, including a 1:1 DM to the accountable human — a DM is retained, exportable, and admin-readable, not a private line (`slack.md`). The one place a named figure is allowed to travel is the drafted payroll input packet itself, delivered privately (email or an access-controlled document) to the accountable human, exactly as "What we write" already describes.

No HRMS-sourced field value — a balance, a punch, an LOP amount, an exit date — ever enters git, a fixture, or a retro note; fixtures for this contract use synthetic employees only, never a real leave/attendance record. No skill stores or restates a leave/attendance/LOP value beyond the single read needed to answer the question in front of it that turn. An exit date or an LOP dispute is never an agent's judgment to resolve or explain to the employee — it routes to the accountable human, the same as every other HRMS interaction (see "What we write").

## Capability gaps today

No mechanism exists yet for either candidate provider, and none can be built until the provider decision (gate G14) lands (see "Mechanism"). This is the primary gap: once G14 lands, the fix is a sandbox tool (egress declared to that provider's API, per ADR-010 correction §1) or a plugin — never a raw HTTP call or a scraped export, per CLAUDE.md conventions and the pattern set by ADR-007 / `gmail.md`. Until then, every skill that depends on this contract runs against synthetic fixture data only — never a real employee's real leave balance — matching the pre-gate convention other contracts use (e.g. `notion.md`'s scratch-location rule). No push/subscribe mechanism is assumed either way; treat any future HRMS mechanism as poll-only until proven otherwise, and set cron cadence in `crons.md` accordingly once it exists.

## Credentials required

- HRMS provider decision (Keka vs RazorpayX Payroll) — provided by: Founder — gate G14, `docs/gates.md`. Blocks everything else in this contract.
- HRMS API credentials (OAuth/API key, scoped read-only where the chosen vendor's permission model supports scoping) for the People-Ops agent's own machine identity — provided by: Founder — gate G15, `docs/gates.md`. Never a human's own HRMS login.
