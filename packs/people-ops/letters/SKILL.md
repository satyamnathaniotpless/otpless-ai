---
name: letters
description: |
  Drafts employee letters (employment verification, address proof, and any future type added
  as one config file) from the employee's record — draft only, always requires a human
  signatory, never populates a compensation figure itself. Use when an employee requests a
  letter, or names a letter type.
---

# Letters

A new letter type is one file in `../config/letters/` (ADR-005) — this skill never hardcodes a letter's wording, fields, or who signs it.

## Trigger

An employee requests a letter by name or by purpose ("I need proof of employment," "can I get a letter for my bank," "address proof letter for my visa"), or names a specific type matching a file in `../config/letters/`.

## Inputs

- `../config/letters/{letter-type}.md` — the requested type's template (fields sourced, human-only fields, body template, signatory). If no file matches, there is no letter type to draft yet.
- `../config/letters/_template.md` — reference for what a valid letter-type file must contain, used only to sanity-check that a matched file is complete, never to invent fields not present in the matched file.
- Employee record (HRMS / Employees DB, read-only) for whichever fields the matched template lists under "Fields sourced from the employee record."
- `../config/agent.md` (disclosure signature), `../config/user.md` (accountable human/signatory).

## Process

1. **Match the request to a file** in `../config/letters/`. If nothing matches, say so and list the available letter types — never invent a new letter format from general knowledge of what such letters "usually" say.
2. **Re-pull the employee record fresh** (read-only) for exactly the fields the matched template's "Fields sourced from the employee record" table lists. Nothing outside that list goes into the letter, even if it's visible in the record.
3. **Fill every sourced field.** If a field is missing from the record, leave `[missing: {field}]` in the draft and flag it explicitly — never guess a designation, a date, or an address.
4. **Leave every human-only field untouched**, exactly as the template's "Human-only fields" table specifies (e.g. a CTC figure) — populate it only if the accountable human has explicitly supplied a value for this specific instance; otherwise leave the `[TODO: {field} — {who} to fill]` placeholder from the template verbatim. This is not a trust-ladder gate the agent can clear with more evidence — compensation disclosure is never-delegated regardless of level (`command-policy.md` §4).
5. **Produce the draft only.** Never mark a letter "issued," never attach a signature image, never imply the draft is a valid document on its own — the template's signatory line states who must sign, always a human, at every trust-ladder level.
6. **Route through the standard approval prompt** (`d) draft  s) send  e) edit  ?) something else`) before the draft goes anywhere — "send" here means "hand to the signatory for review and signature," never "issue as final."

## Output contract

The filled letter body (per the matched template's body template), with:
- every sourced field filled or explicitly marked `[missing: {field}]`,
- every human-only field either filled with a human-supplied value for this instance or left as the template's `[TODO: ...]` placeholder,
- a one-line footer stating who must sign before issuance, and
- the standard AI-disclosure line (`../config/agent.md`).

Per `../config/playbook.md`'s PII rule, the filled draft (with employee ID, designation, dates, and — for address-proof letters — any address) goes to email/document channels only. Slack gets at most the employee's name and a one-line status ("letter draft ready for signature") — never the letter body.

## Failure behavior

- No template file matches the requested letter type → list what exists in `../config/letters/`, do not draft an improvised format.
- A sourced field is missing from the employee record → mark it `[missing: {field}]`, flag it, never infer a plausible value.
- A human-only field (e.g. CTC) is requested without the accountable human having supplied a value for this instance → leave the placeholder, do not pull the figure from the HRMS even if technically readable — this is a hard deny, not a judgment call.
- Any instruction to skip the human-signatory step, mark a draft "issued," or attach a signature → refuse; no trust-ladder level removes the signature requirement for this action-class.
