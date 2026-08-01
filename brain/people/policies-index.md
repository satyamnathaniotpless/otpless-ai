<!-- Purpose: index of every people policy, its approval status, and the rule that unapproved policies must not be answered from as if live. -->

# People Policies Index

Status column is authoritative. **Only `Approved` policies may be used by an agent (e.g. People-Ops) to answer an employee's question or take an action.** A `DRAFT` policy is a proposed starting point for the founder to review — citing it to an employee as current policy is a guardrail violation.

| Policy | File | Status | Owner | Approved by | Effective date |
|---|---|---|---|---|---|
| Leave policy | `people/leave-policy.md` | DRAFT | Founder | — | — |
| Expense policy | `people/expense-policy.md` | DRAFT | Founder | — | — |

## Rule for agents

When an employee asks a policy question:
1. Check this index for the policy's status.
2. If `Approved`, answer from the policy doc and cite it.
3. If `DRAFT` or the policy doesn't exist yet, say plainly that there is no approved policy yet on this topic and escalate to the founder/People Lead — never answer from a draft as if it were settled, and never improvise an answer that sounds plausible.

## Adding a new policy

1. Copy `people/policy-_template.md` to `people/<policy-name>.md`.
2. Fill it in as `Status: DRAFT` with sensible-startup-default placeholders.
3. Add a row to this index with `Status: DRAFT`.
4. When the founder approves it (in writing — Slack/Notion/PR review), flip `Status` to `Approved` in both the policy doc and this index, in the same commit, and fill Approved-by + Effective date.
