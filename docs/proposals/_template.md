<!-- Purpose: the one-page brief that proposes a new agent or department — written when repeated manual work is observed, not when someone has an idea. -->

# Proposal — {agent or department name}

**Proposed by:** {agent or human} · **Date:** {YYYY-MM-DD} · **Status:** draft / under review / accepted / declined

## The observed work

{What repeated manual work triggered this? Be specific: where it was seen (Slack, Notion, a recurring meeting), roughly how often, and who is doing it today. A proposal without an observation behind it is an idea, and ideas do not justify an agent. If you cannot point at work someone is actually doing by hand, stop here.}

## Why an agent rather than a script or a form

{The honest version. Much repeated work is better solved by a form, a Notion template, a cron, or deleting the process. An agent earns its place when the work needs judgment-shaped handling of unstructured input, or when it spans systems that do not talk to each other. Say why those cheaper options do not fit.}

## What it would own

| Owns | Explicitly does not own |
|---|---|
| {the numbers/outcomes it is accountable for} | {the adjacent work a reader would assume it covers} |

## Never-delegated check

{Which of the six hard-denied classes — offers, compensation, terminations, performance judgments, post-interview rejections, policy changes — does this work sit next to? Every agent so far has been adjacent to at least one. Name the adjacency and how the design keeps the line, or say plainly that the work cannot be separated from a human judgment and therefore should not be an agent.}

## Cost to build

| Item | Detail |
|---|---|
| New pack | `packs/{name}/` — estimated skills |
| New scope | `platform/deploy-layer/otpless/scopes/{name}.md` (one file) |
| New contracts | {systems it touches that have no `platform/contracts/` file yet} |
| Changes to `packs/shared` | {expected: none — five agents have imported it unchanged. If this proposal needs a change here, that is the most interesting line in the document and needs its own justification} |
| Human gates created | {credentials, accounts, content, decisions — each with an owner} |

## What would make this a bad idea

{Argue the other side. Volume too low to justify the build, the underlying process is about to change, the data it needs does not exist, the guardrail cannot be made structural. A proposal that cannot state its own weakest point has not been thought through.}

## Recommendation

{Build now / build after {dependency} / do not build, and why. One paragraph.}
