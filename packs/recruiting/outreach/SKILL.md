---
name: outreach
description: |
  Draft personalized cold outreach to a candidate the operator hasn't contacted yet, using the
  role playbook's hook patterns and template. Use when the user says "reach out to X", "outreach
  to X", or "email X" for someone with no existing thread.
---

# Outreach (F3)

## Trigger

"reach out to X", "outreach to X", "email X" (new candidate, no prior thread).

## Inputs

- `../config/user.md` (operator identity, meet link, WhatsApp note)
- `../config/playbook.md` (tone, templates, disclosure signature)
- `../config/jobs/<role>.md` (hook patterns, comp band, candidate bar)
- Candidate profile (LinkedIn text/GitHub/resume paste), Gmail (check for existing thread first)

## Process

1. Check Gmail for any existing thread with this candidate. If one exists, stop and route to `../reply` instead.
2. Read `../config/jobs/<role>.md` for hook patterns and comp band.
3. Write one sentence hooking on something SPECIFIC the candidate built — never generic. Follow the role's hook patterns.
4. Draft using the role's template and `../config/playbook.md` tone rules: peer-builder tone, not recruiter tone. If the candidate stated a **logistics** preference (location, timeline), weave it in, never contradict it. **Comp is scoped out of that "never contradict" rule, deliberately:** always state the band from the role's job playbook straight, per `../config/playbook.md`'s comp Q&A row — even when it contradicts a candidate's stated expectation. Never soften, hedge around, or imply flexibility toward a number above the band; if the candidate's stated expectation exceeds the band, say the band plainly and flag the gap to the operator rather than papering over it in the draft. A comp commitment, implied or explicit, is never-delegated — this rule exists so "never contradict a stated preference" can't be read as license to create one.
5. Check Calendar for a proposable time within the default block (`../config/user.md`) before drafting a specific ask.
6. Present the draft with the standard action prompt (never send unapproved):
```
d) draft   s) send   e) edit — tell me what to change   ?) something else
```
7. On approval, create the Gmail draft/send in a new thread (no threadId — this is a new thread), or hand the WhatsApp text to the operator to paste if that's the preferred channel.
8. **Update the Notion row** (Source, Owner, Notes, Stage if applicable) after every action, then re-query to confirm.

## Output contract

One draft block per candidate, hook sentence highlighted, comp band untouched (state straight if included, no hedging). No superlative from the banned list (evals/fixtures/banned-phrases.txt) anywhere in the draft.

## Failure behavior

If the role playbook has no hook pattern that fits, say so and ask the operator for direction rather than inventing a generic template. Follow-up drafts at +3d and +7d silence are one line each — never resend the full pitch.
