<!-- Purpose: HRMS connector facts (provider, scope, field names, cutoff dates) that people-ops skills read instead of hardcoding — never hardcode any of this in a SKILL.md. -->

# hrms.md — HRMS identifiers, scope, and payroll calendar

Source of truth for anything HRMS-shaped. The HRMS itself (not this file) remains the system of record for actual payroll/leave/compliance data (master PRD §6) — this file only tells skills where to look and what they're allowed to do there.

## Provider

TODO(gate): **Keka vs RazorpayX Payroll** — undecided (master PRD §11 open question 1, master PRD §2 non-goals, master PRD §4 row 3). Decision owner: Founder + CTO, by end of P1 per the roadmap; "API quality for agent integration is a first-class criterion." Nothing below can be filled with real values until this lands — every field is a placeholder.

| Field | Value |
|---|---|
| Provider | TODO(gate): Keka \| RazorpayX Payroll — not yet decided |
| Connector / MCP | TODO(gate): not yet built — depends on provider decision; until it exists, `../hrms-query` and `../payroll-prep` must report "HRMS not yet connected" rather than reading anything |
| API scope granted to this agent | Read-only, always, for P2 — no write scope is to be requested or granted until a written ADR supersedes `agent.md`'s "HRMS write of any kind: NOT IN SCOPE (P2)" row |

## Fields this agent reads (once connected)

| Field | Used by | Notes |
|---|---|---|
| Employee record (name, employee ID, designation, department, date of joining, employment status) | `../letters`, `../payroll-prep` | Never the source for compensation figures on a letter — see `../letters/SKILL.md` human-only-field rule |
| Leave balance (by leave type) | `../hrms-query` | A live accrual/usage figure — never derive this from `brain/people/leave-policy.md`'s stated entitlement; the two are different things (see `../hrms-query/SKILL.md`) |
| Attendance record | `../hrms-query` | |
| Expense claim status | `../hrms-query` | Status/state only (submitted / approved / reimbursed) — never the approval decision itself, which is a human action in the HRMS |
| Leave-without-pay days, new joiners, exits, approved reimbursements pending payroll inclusion | `../payroll-prep` | Read-only inputs to the packet; never written back |

TODO(gate): exact field/property names per provider — fill in once the provider is chosen and its API/export schema is known. Do not guess a field name; an incorrect field name silently returning nothing is worse than an explicit "not yet connected."

## Payroll calendar

| Field | Value |
|---|---|
| Payroll cutoff date | TODO(gate): e.g. "25th of each month" — not yet set; owner: Founder, once HRMS provider and payroll processor are confirmed |
| Lead time before cutoff `../payroll-prep` should start flagging outstanding inputs | TODO(gate): proposed default 5 business days — founder to confirm or override |

## Write policy (hard limit, not a trust-ladder level)

This agent has **no HRMS write path in P2**, at any trust-ladder level (`agent.md`). `../payroll-prep` prepares an input packet for a human (or the human operating the HRMS's own UI) to enter — it never calls a write API, even in draft form, even at a hypothetical future L2. This is a P2 scope limit, not a posture setting; revisit only via a written ADR once the provider is live and the master PRD's non-goals section is explicitly revisited.
