<!-- Purpose: instantiates letters/_template.md for the employment verification letter type. -->

# Employment verification letter

## Letter type

- **Name:** Employment verification letter
- **Requested when:** an employee needs proof of current (or past) employment — bank account/loan applications, visa applications, rental agreements, or similar third-party verification requests.
- **Typical requester:** employee (self-request). A third party (bank, embassy, landlord) contacting People-Ops directly is treated as an exception, not a lookup — escalate to the accountable human rather than verifying employment to an outside party unprompted, per DPDP data-minimization (master PRD §6).

## Fields sourced from the employee record (read-only, from HRMS/Employees DB once wired)

| Field | Source | Notes |
|---|---|---|
| Full legal name | HRMS employee record | |
| Employee ID | HRMS employee record | |
| Designation / title | HRMS employee record | |
| Department | HRMS employee record | |
| Date of joining | HRMS employee record | |
| Employment status (current / former, and last working day if former) | HRMS employee record | Never state "currently employed" without re-querying fresh — HRMS is the source of truth, not session memory |

## Human-only fields (never populated by the agent)

| Field | Who fills it | Why it's human-only |
|---|---|---|
| CTC / salary figure (only if the requester specifically needs a salary-verification letter, not a plain employment-verification letter) | Founder | Compensation disclosure — never-delegated regardless of trust-ladder level (`command-policy.md` §4) |

## Body template

```
Date: {today's date, IST}

To Whomsoever It May Concern,

This is to certify that {Full legal name} (Employee ID: {Employee ID}) is / was employed with
OTPLESS as {Designation} in the {Department} department, since {Date of joining}
{, until {last working day}, if former employee}.

{If a salary figure was explicitly supplied by the accountable human for this instance:
Their current annual compensation is [TODO: CTC figure — Founder to fill].}

This letter is issued at the employee's request for verification purposes.

Sincerely,
{Signatory name and title}
OTPLESS

— Drafted by {AgentName}, OTPLESS's People-Ops agent (AI), working with {accountable human}.
  This draft requires human review and signature before issuance; it is not a valid document
  until signed.
```

## Signatory

- **Who signs:** Founder, until a People Lead is hired (`../agent.md` accountable-human row).
- **Format issued:** signed letter on company letterhead (PDF), issued by the signatory — the agent's output stops at the draft text above.

## Notes for agents

- If any sourced field is missing from the HRMS record, leave it as `[missing: {field}]` in the draft and flag it — never infer a designation or joining date from a policy doc, an org chart guess, or session memory.
- Never include a salary figure unless the accountable human has explicitly supplied it for this specific letter instance; a plain employment-verification letter (no salary) is the default and satisfies most bank/visa/landlord requests.
- This letter, once drafted, goes to email/document channels only — never post the filled draft (with employee ID, designation, dates) into Slack; per `packs/shared/identity/SKILL.md`, Slack gets at most the employee's name and a one-line status ("draft ready for signature"), never the letter body.
