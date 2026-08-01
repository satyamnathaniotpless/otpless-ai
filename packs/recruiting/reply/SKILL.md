---
name: reply
description: |
  Draft an in-thread reply to a candidate — scheduling, Q&A, advancement, or general
  correspondence — using standard answers from config. Use when the user says "reply to X",
  "draft for X", or "email X" for someone with an existing thread.
---

# Reply & Candidate Q&A (F4)

## Trigger

"reply to X", "draft for X", "email X" (existing thread), candidate asked a question.

## Inputs

- `../config/playbook.md` (standard Q&A table, tone, disclosure signature)
- `../config/jobs/<role>.md` (comp band, role-specific Q&A)
- Gmail thread (fresh — check for an email-address-change request before drafting)

## Process

1. Re-query the Gmail thread fresh (split-brain rule — the operator may have already replied outside this session).
2. Scan the thread for a request to use a different email address; if found, TO the new address and CC the old one.
3. Classify the question: onsite policy, AI-in-interview policy (required, bring your own stack), process/timeline (5 business days), comp (state the band straight from the role playbook), work-sample WhatsApp group — or role-specific, from `../config/jobs/<role>.md`.
4. Draft the reply using the standard answer, in-thread (use the existing threadId, never a new thread).
5. **Flag instead of answering:** visa questions, legal questions, or anything not covered by the standard table — surface to the operator directly rather than guessing.
6. Present with the standard action prompt:
```
d) draft   s) send   e) edit — tell me what to change   ?) something else
```
7. On approval, create the in-thread Gmail draft/send. **Update the Notion row** (Notes, Stage if the reply changes it) after the action, then re-query to confirm.

## Output contract

One reply per candidate, headed by the question being answered and the source of the answer (standard table vs. role playbook vs. flagged-to-operator). Never invent an answer not sourced from config.

## Failure behavior

If a question doesn't map to any standard or role-specific answer, do not guess — flag it to the operator with the exact question quoted. Never re-open an old thread topic the candidate didn't ask about.
