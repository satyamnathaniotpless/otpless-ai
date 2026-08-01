<!-- Purpose: the vendor-renewal register `../vendor-renewals/SKILL.md` reads — one row per vendor contract this agent tracks. Config = data (ADR-005); add a vendor by adding a row, never by editing the skill. -->

# vendors.md — tracked vendor contracts and renewal windows

No real vendor data has been supplied yet — every row below is a placeholder category, not a confirmed contract. Do not treat any row as a real renewal date until the accountable human fills it in. `../vendor-renewals/SKILL.md` must report a data gap for any row with a TODO field, never assume evergreen or invent a date.

| Vendor / category | Purpose | Contract term end | Renewal notice lead time | Owner | Notes |
|---|---|---|---|---|---|
| TODO(gate): HRMS/payroll platform | Payroll processing, leave/attendance system of record | TODO(gate) | TODO(gate) | Founder | Same provider decided in `hrms.md` — fill both together |
| TODO(gate): Group health insurance | Employee health cover | TODO(gate) | TODO(gate) | Founder | |
| TODO(gate): Background verification vendor | BGV for new joiners | TODO(gate) | TODO(gate) | Founder | Primarily the Onboarder agent's concern (master PRD §4 row 2); tracked here only if People-Ops owns the vendor relationship/renewal |
| TODO(gate): Notion (People workspace) | Policies wiki, Employees DB (ADR-003) | TODO(gate) | TODO(gate) | CTO | |

## Adding a vendor

1. Add a row above with real values, or `TODO(gate)` for anything not yet known — never a guessed date.
2. Set a realistic renewal notice lead time (how long before contract end a human needs to decide renew/renegotiate/cancel).
3. `../vendor-renewals/SKILL.md` flags any row whose notice-lead window has opened; it never executes a renewal, only surfaces the decision and drafts the communication.
