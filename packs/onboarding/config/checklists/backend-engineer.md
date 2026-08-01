<!-- Purpose: worked instantiation of checklists/_template.md for the Backend Engineer role — proves the template needs no skill change per hire type. -->

# Onboarding checklist: Backend Engineer

## Role

- **Role:** Backend Engineer
- **Level:** IC
- **Owner (accountable human for this hire's onboarding):** CTO — owns the Backend pipeline per `packs/recruiting/config/user.md`
- **Typical notice period for this hire pool:** 60–90 days (mid/senior backend engineers at Indian product companies commonly serve the long end of the range)

## Notice-period warmth

- **Cadence:** weekly (default, no override needed for this role)
- **Role-specific talking points:** which squad they're joining, one recent shipped feature relevant to their stack, an invite to an internal build-in-public channel if one exists
- **Known counteroffer risk factors for this role:** high — backend engineers with fraud/auth depth are scarce and courted; a silent week is the leading warning sign, treat any missed touchpoint as urgent, not routine

## Background verification (BGV)

- **Checks required:** employment history (all prior employers), education, criminal record, address verification
- **Vendor:** see `../vendors.md` — not yet selected/provisioned (gate)
- **SLA:** TODO(gate): confirm once a vendor is selected; assume 5–7 business days from initiation until then, for planning purposes only — do not commit this number to a hire

## Paperwork / documents required

- PAN card
- Aadhaar / address proof
- Previous employer relieving letter + last 3 months' payslips
- Highest education certificate
- Passport-size photo (for access badge, once badging exists)

## Device & account provisioning

- **Devices:** engineering-spec laptop (16GB+ RAM, per current IT standard — confirm with IT/Admin, not hardcoded here)
- **Accounts:** email, Slack, GitHub, Notion, staging environment access, CI/CD access
- **Access level:** prod-read only at day one; prod-write granted by the engineering manager post-ramp, never by this agent
- **Lead time before start date:** request by T-7 business days, verify ready by T-2

## Day-one plan

- 09:30 — welcome + logistics with manager
- 10:00 — buddy intro, dev environment setup pairing
- 11:00 — manager 1:1, first-week plan walkthrough
- Afternoon — first small PR: a low-risk, well-scoped fix to get CI/review flow working end to end

## Buddy

- **Selection criteria for this role:** same squad, joined within the last 12 months, has given positive onboarding feedback about their own ramp-up

## 30/60/90 check-ins

- **30-day focus:** dev environment fully ramped, shipped a small PR independently, comfortable with the on-call/incident process
- **60-day focus:** owns a small feature or service area end to end
- **90-day focus:** full productivity checkpoint — this agent only schedules the conversation and sends prep questions; the manager's assessment of performance is human, always
