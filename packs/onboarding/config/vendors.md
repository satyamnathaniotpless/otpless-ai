<!-- Purpose: third-party vendor accounts this pack orchestrates around, never into — a vendor name is data (ADR-005), so no SKILL.md may hardcode one. -->

# vendors.md — vendor contracts this pack consumes

## Background verification (BGV)

| Field | Value |
|---|---|
| Vendor | TODO(gate): SpringVerify or OnGrid — which one, plus contract/account setup — who: Founder + CTO. Master PRD §4 names both as candidates; neither is selected or provisioned yet. |
| Account / API access | None. Until this gate clears, no skill in this pack may call a vendor API — BGV initiation is always a drafted request handed to a human to submit through the vendor's own portal (see `../bgv/SKILL.md`). |
| Typical SLA | TODO(gate): confirm with whichever vendor is selected — do not quote a number to a hire before then. |
| Checks per role | See the role's own `checklists/{role}.md`. |

Do not name a specific vendor inside any `SKILL.md` in this pack — every BGV-touching skill reads this file instead. When the gate clears, fill this table in place; no skill needs to change.

## IT / device provisioning

| Field | Value |
|---|---|
| Vendor/process | TODO(gate): internal IT/Admin process for laptop procurement and account creation — owner and ticketing system not yet documented for this pack. Until named, `../provisioning/SKILL.md` drafts a request to the accountable human (see `agent.md`) rather than to a named system. |
