<!-- Purpose: contract between recruiting skills and Slack — notifications and digests — so no skill posts externally-visible content without the same draft-first gate as email. -->

# Contract: Slack

## Purpose

Internal notifications to #hiring: new-applicant summaries, urgent flags, digests, weekly reports (PRD §6).

## What we read

- `slack_read_channel` / `slack_read_thread`: check whether a scheduled post (e.g. morning digest) already went out this run before posting again.
- `slack_search_users` / `slack_read_user_profile`: resolve an interviewer or operator by name.
- `slack_read_canvas`: existing pipeline-report canvas content, if one exists, before updating it.

## What we write

- `slack_send_message_draft`: the default for any new-applicant summary, urgent flag, or digest — draft, not posted, pending the same approval gate as email (guardrail 1).
- `slack_send_message` / `slack_schedule_message`: only for an action-class that has earned L1+ per `command-policy.md` §3; today every Slack post to a human channel starts at L0 (§2 — "Slack DM/post to a human outside the agent team" requires explicit approval).
- `slack_create_canvas` / `slack_update_canvas`: the weekly pipeline report (F7).

## Field & name mapping

Channels: `#hiring` (recruiter scope), `#people` (cross-agent) — per `org-config.md` Surfaces table. Format: YC's 3-sentence recommendation (background + signal + recommendation + 👍-to-act), PII-minimized per `packs/shared/identity/SKILL.md` §8 (name + one factual one-liner only — no phone, comp, or full application content).

## Staleness & re-query semantics

Before posting a scheduled digest, re-read the channel's recent history to check it wasn't already posted this run (e.g. a cron retry after a partial failure) — a stale "not yet posted" assumption produces a duplicate.

"Not set" vs "unknown": if `slack_read_channel` fails, that is *unknown* whether the digest already went out — do not assume "not yet posted" and re-post; escalate instead of risking a duplicate.

## Write verification

After `slack_send_message`/`slack_schedule_message` fires (i.e. once an action-class is L1+ and actually sends), re-read the channel/thread to confirm the message landed before marking that task complete.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Slack unavailable | Do not retry-post blindly once it recovers (risk of duplicate); log and escalate |
| Rate-limited | Back off, retry once |
| Permission-denied (bot missing from channel/scope) | Halt, escalate as a Slack app/scope grant issue |
| Ambiguous result (`slack_search_users` returns multiple name matches) | Surface all matches to the operator; never guess which person |

## Capability gaps today

No reaction-read tool — the PRD's "👍-to-act" pattern (F2) implies detecting an operator's emoji reaction as an approval signal, but no available tool reads message reactions, only message/thread text. Until the MCP is extended with a reactions read, "👍-to-act" cannot be detected programmatically; the agent must fall back to reading an explicit reply instead.

**Deprecated server package.** `.mcp.json` currently pins Slack to `@modelcontextprotocol/server-slack`, which npm reports as deprecated/no longer supported. The concrete package must be confirmed (or replaced) when the deployment is actually wired — do not assume it works as-is. Tracked as gate G12, `docs/gates.md`, owner CTO.

## Credentials required

- Slack bot token for the recruiting agent's own bot identity, scoped to `#hiring` (and `#people`) — provided by: CTO (Slack workspace admin, app install/OAuth) — gate G6, `docs/gates.md`.
