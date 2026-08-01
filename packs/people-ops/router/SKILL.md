---
name: router
description: |
  People-Ops entry point. Routes to the right sub-skill — policy Q&A, HRMS query, payroll
  prep, letters, or vendor renewals — based on what's asked. Use when the user says
  "people-ops", "HR question", "policy question", or any people-ops request that doesn't name
  a specific sub-skill.
---

# People-Ops — router

Entry point for steady-state people operations. Does not do the work itself — dispatches to the sub-skill that does, then gets out of the way.

## Trigger

"people-ops", "HR question", any policy/leave/payroll/letter/vendor ask that doesn't clearly match one sub-skill below.

## Inputs

- The requester's question (free text) — may be an employee (policy/leave/letter questions) or an operator/human (payroll/vendor coordination).
- `../config/user.md` (accountable human, escalation contacts) and `../config/playbook.md` (priority order).

## Process

1. Read `../config/user.md` and `../config/playbook.md` once per session (skip if already read this session).
2. Match the request against the dispatch table below. If ambiguous, ask which the requester means rather than guessing — especially between `../policy-qa` (what does the rule say) and `../hrms-query` (what does my record say), which are easy to conflate but must never be answered by the wrong one (see `../hrms-query/SKILL.md` step 5).
3. Invoke the matched sub-skill. Do not duplicate its logic here — every sub-skill re-queries its own sources fresh and gates any output behind its own `d) draft  s) send  e) edit  ?) something else` prompt; the router never skips that gate on its behalf.

### Dispatch table

| Requester says | Route to |
|---|---|
| "what's the policy on X" / "how many leave days do I get" (the rule) / "can I expense X" (the rule) | `../policy-qa` |
| "how many leave days do I have left" / "was my attendance marked right" / "status of my expense claim" (my record) | `../hrms-query` |
| "can you waive X" / "can I get an exception to Y" | `../policy-qa` (handles exception detection and escalation — see its Process step 6) |
| "I need a letter" / "proof of employment" / "address proof" | `../letters` |
| "what's outstanding for payroll" / "are we ready for the cutoff" | `../payroll-prep` |
| "what vendor renewals are coming up" / "are we covered on {vendor}" | `../vendor-renewals` |
| bare "people-ops" / "go" with no specifics | list the categories above with counts where available, ask what to focus on |

## Output contract

A one-line statement of which sub-skill was invoked and why, then that sub-skill's own output. Never fabricates an answer, a figure, or a table here — that is always the matched sub-skill's job, after it re-queries its own sources.

## Failure behavior

If no sub-skill clearly matches, list the dispatch table and ask the requester to clarify — never silently guess between `../policy-qa` and `../hrms-query`, and never default to answering a policy-shaped question here directly instead of routing it (this router has no authority to cite a policy itself).
