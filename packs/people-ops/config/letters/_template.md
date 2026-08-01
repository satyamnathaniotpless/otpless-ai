<!-- Purpose: blank letter-type template (ADR-005: any new letter type = fill this one file, copy to letters/{letter-type}.md, no skill changes needed). -->

# letters/_template.md — letter-type template

Copy this file to `letters/{letter-type-slug}.md`, fill every `{brace}`, and `../../letters/SKILL.md` can draft that letter type immediately with no skill changes.

## Letter type

- **Name:** {e.g. "Employment verification letter"}
- **Requested when:** {e.g. "employee needs proof of employment for a bank/visa/apartment application"}
- **Typical requester:** employee (self-request) — {note if HR/manager can also request on an employee's behalf, and whether that changes anything}

## Fields sourced from the employee record (read-only, from HRMS/Employees DB once wired)

List every field this letter needs and where it comes from. Anything not on this list must not appear in the letter.

| Field | Source | Notes |
|---|---|---|
| {e.g. Full legal name} | HRMS employee record | |
| {e.g. Designation} | HRMS employee record | |
| {e.g. Date of joining} | HRMS employee record | |
| {add rows as needed} | | |

## Human-only fields (never populated by the agent)

Any field touching compensation, comp-band figures, or anything else on the never-delegated list (`platform/deploy-layer/otpless/command-policy.md` §4) is filled by the accountable human for this specific instance only, every time — the agent leaves it as an explicit `[TODO: {field} — {who} to fill]` placeholder, even if the figure is technically visible to it in the HRMS.

| Field | Who fills it | Why it's human-only |
|---|---|---|
| {e.g. CTC / salary figure, if the letter states one} | {e.g. Founder} | Compensation disclosure — never-delegated regardless of trust-ladder level |
| {add rows as needed} | | |

## Body template

```
{Full letter body text, with {placeholders} for every sourced field above. Plain, factual, no superlatives.}
```

## Signatory

- **Who signs:** {e.g. Founder, or "People Lead once hired"} — always a human; no trust-ladder level ever removes this.
- **Format issued:** {e.g. PDF on letterhead, signed and scanned} — the agent produces the draft text only, never the final signed artifact.

## Notes for agents

{Anything letter-type-specific an agent should know: what NOT to promise, what to say if a sourced field is missing, any jurisdiction-specific wording requirement.}
