<!-- Purpose: instantiates letters/_template.md for the address-proof letter type. -->

# Address proof letter

## Letter type

- **Name:** Address proof letter
- **Requested when:** an employee needs the company to confirm an address for KYC/verification purposes (e.g. bank account opening, government ID update) — either the company's registered office address as the employee's correspondence address, or a confirmation of the employee's residential address as declared to HR.
- **Typical requester:** employee (self-request).

## Fields sourced from the employee record (read-only, from HRMS/Employees DB once wired)

| Field | Source | Notes |
|---|---|---|
| Full legal name | HRMS employee record | |
| Employee ID | HRMS employee record | |
| Designation | HRMS employee record | |
| Date of joining | HRMS employee record | |
| Residential address on file (only if the letter type requested is specifically a residential-address confirmation, not a company-address letter) | HRMS employee record | This is the most sensitive field this letter type touches — see Notes below before including it |

## Human-only fields (never populated by the agent)

None for this letter type — no compensation figures involved. If a future variant needs one, add it here rather than improvising in the body template.

## Body template

```
Date: {today's date, IST}

To Whomsoever It May Concern,

This is to confirm that {Full legal name} (Employee ID: {Employee ID}) is employed with
OTPLESS as {Designation}, since {Date of joining}.

{Choose one, per what the employee actually requested — never both by default:
 (a) For a company-address confirmation: "The company's registered office address is
     {company registered address}, and this may be used as the employee's correspondence
     address for the stated purpose."
 (b) For a residential-address confirmation: "The employee's residential address on file
     with the company is {residential address on file}, provided at the employee's request
     for the stated verification purpose."}

This letter is issued at the employee's request for address-verification purposes.

Sincerely,
{Signatory name and title}
OTPLESS

— Drafted by {AgentName}, OTPLESS's People-Ops agent (AI), working with {accountable human}.
  This draft requires human review and signature before issuance; it is not a valid document
  until signed.
```

## Signatory

- **Who signs:** Founder, until a People Lead is hired.
- **Format issued:** signed letter on company letterhead (PDF).

## Notes for agents

- Ask which variant (company address vs. residential address) before drafting if the request doesn't say — never guess, and never include a residential address the employee didn't ask to have confirmed.
- A residential address is the most PII-sensitive field this pack handles. It goes into the drafted letter body only (email/document channel); it must never appear in a Slack message, a standup post, or any git-tracked file, per the employee-PII rule (master PRD §6, stricter than candidate PII) — this is stricter than the general Slack minimization rule, which would otherwise allow a one-line status.
- If the HRMS has no residential address on file, say so explicitly and ask the employee to provide it for this instance rather than leaving the field blank in a signed document.
