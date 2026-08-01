<!-- Purpose: turns RUNBOOK_DEPLOY.md §4's verification checklist into an executable-by-agent procedure — each check states the exact read-back that constitutes a pass, the synthetic fixture to use, and the failure action. -->

# Deployment Verification Procedure

Run this only after `platform/scripts/bootstrap-qm.sh --apply` has completed and the deploy-qm skill, connectors, and scopes are in place. Every check below requires a **read-back** — re-querying the live system and observing the actual state — never an assumption that a step "must have worked" because the command exited 0.

**Hard rule:** the Gmail, Notion, and Calendar checks touch **synthetic records only** — a fixture thread, a scratch/test row, a fixture calendar invite. Never a real candidate, employee, or production Applicants/Employees DB row. If a synthetic equivalent cannot be constructed for a check, stop and record that as a gate in `docs/gates.md` rather than substituting a real record.

For every check: if the pass condition is not observed, do not mark it done, do not retry silently more than once, and follow the stated failure action — usually "record in docs/gates.md and move on," never "report success anyway."

---

## Check 1 — Web UI reachable; founder + CTO sign in; scopes isolated

**Pass condition (read-back):** an HTTP request to the deployment's `publicUrl` returns 200 and renders the sign-in page; AND a sign-in attempt using the founder's and CTO's admin email addresses each completes the one-time-link flow and lands in a session scoped to only the scopes that account is authorized for (verify by reading the session's visible-scopes list back from the UI/API, not by assuming RBAC config is correct).

**Synthetic fixture:** none needed — this checks infra reachability and auth, not business data. Use the founder's and CTO's real admin emails (that's the sign-in identity, not a data record) but do not create or view any candidate/employee data during this check.

**On failure:** record which half failed (unreachable vs. sign-in vs. isolation) in `docs/gates.md` against the relevant gate (G9 for sign-in broker, G1/G10 for infra reachability). Do not mark the checklist item done partially.

---

## Check 2 — Slack: @agent responds in #hiring; standup cron fires 08:30 IST

**Pass condition (read-back):** post a message mentioning the agent's Slack handle in #hiring and read back an actual reply message (message ID + timestamp) from the bot user, not just "delivery succeeded." Separately, at or after 08:30 IST, read back a standup message actually posted by the bot in the target channel (check the channel history for a message with today's date and the bot's user ID as author).

**Synthetic fixture:** the Slack message itself should reference a synthetic candidate name (e.g. "Asha Test" — never a real candidate) if the standup content includes pipeline data.

**On failure:** if the bot doesn't reply, check G6 (Slack token) status in `docs/gates.md` first. If the cron doesn't fire, this is a qm scheduling issue, not a gate — file it as a build defect, not a human gate.

---

## Check 3 — Notion read/write round-trip on a synthetic applicant row

**Pass condition (read-back):** write a row to a Notion database using a synthetic applicant record (fabricated name, e.g. "Rahul Fixture", fabricated but plausible field values, clearly marked as a fixture — e.g. a name prefixed `ZZ_TEST_` or placed in a dedicated test database/view if one exists), then issue a separate read call and confirm the exact field values written come back unchanged. Do not consider a write "verified" from the write call's own success response alone — the read-back must be a distinct call.

**Synthetic fixture:** a fabricated applicant with no resemblance to a real person; never write to or read from the production Applicants DB (`collection://29905732-673c-4cf8-85c5-15f1aa2a1f7a`) for this test — use a scratch database/page instead, or a row explicitly tagged as test data if a scratch space doesn't yet exist.

**On failure:** if the Notion integration token isn't shared with the target database, record against G7. If the token works but read-back mismatches what was written, it's a build defect — file separately from the gate ledger.

---

## Check 4 — Gmail draft created from a fixture thread — NOT sent (L0)

**Pass condition (read-back):** using a synthetic fixture email thread (fabricated sender/subject, no real candidate address), create a draft via the agent's mailbox, then call the drafts-list/read API and confirm (a) the draft exists with the expected content and (b) it has NOT been sent — no corresponding message in Sent, no delivery to any external address. Absence-of-send is itself a pass condition to verify, not just presence-of-draft.

**Synthetic fixture:** a fixture thread with a synthetic "candidate" email address (e.g. a address you control or a clearly fake domain), never a real applicant's inbox.

**On failure:** if the mailbox/OAuth isn't provisioned, record against G5. If a draft somehow gets sent, this is a P0 command-policy defect (L0 boundary violated) — halt further Gmail checks, do not proceed to promotion review, and escalate immediately rather than logging it as a routine gate.

---

## Check 5 — Calendar event on agent calendar with human attendee, responseStatus readable

**Pass condition (read-back):** create a calendar event on the agent's own calendar with a synthetic attendee address (or a real internal team member who has explicitly agreed to be a test attendee — never an external candidate), then read the event back via the Calendar API and confirm the attendee's `responseStatus` field is present and reflects their actual state (`needsAction`/`accepted`/etc.), not a default/placeholder value.

**Synthetic fixture:** synthetic event title/description (e.g. "ZZ_TEST interview slot"); attendee is either a synthetic address or a consenting internal team member — never a candidate.

**On failure:** record against G5 (Calendar shares the OAuth client with Gmail) if the API call itself fails. If the event is created but `responseStatus` is missing/unreadable, that's a build/API-shape defect, not a gate.

---

## Check 6 — Command policy: attempt an L1 action at L0 → blocked and logged

**Pass condition (read-back):** deliberately invoke an action that requires L1 (e.g. "send" rather than "draft") while the scope's posture is L0, and confirm two things from the system's own records, not from the attempt's immediate response alone: (1) the action was **blocked** — no external side effect occurred (no message sent, no external state changed — verify via the same read-back method as Check 4's absence-of-send), and (2) a **log entry** exists recording the denial (policy engine log / audit trail showing the action class, the scope, the posture, and the deny decision). "Blocked" without a corresponding log entry is not a pass — the requirement is observed-as-blocked-and-logged, not merely not-attempted or silently no-op'd.

**Synthetic fixture:** use the same synthetic thread/attendee from Check 4/5 so the attempted send has nowhere real to go even if the policy somehow failed open.

**On failure:** if the action is not blocked (executes), this is a P0 command-policy defect — treat exactly as a Check 4 send-boundary violation: halt, escalate, do not proceed. If the action is blocked but unlogged, that's a policy-engine logging gap — file as a build defect; the missing audit trail itself is the failure, not merely cosmetic.

---

## Check 7 — Kill test: close all human sessions 48h → crons still fire, digest still posts

**Pass condition (read-back):** after all human web/Slack sessions are closed for 48 hours with zero human interaction, read back that scheduled crons (standup, any digest) still produced their expected output artifacts (Slack messages / Notion updates) during that window with correct timestamps, sourced from the same read-back methods as Checks 2/3 — not from assuming "the deploy is up so crons must have run."

**Synthetic fixture:** whatever fixture data the standup/digest normally summarizes should be synthetic per the above checks; this check specifically validates unattended operation, not new data.

**On failure:** record as a build defect (scheduling/worker liveness issue) rather than a human gate, unless the root cause traces to an expired credential from one of G1–G9 — in that case cross-reference the relevant gate.

---

## Check 8 — `node evals/run.mjs` green in CI on a no-op PR

**Pass condition (read-back):** open a no-op PR (e.g. whitespace-only or a comment addition) against the repo, observe the CI run triggered by that PR, and read back the CI job's actual conclusion (`success`) plus the eval runner's own summary output — not just "CI shows a green checkmark" without reading what the job executed. Confirm the eval run in CI executed the current fixture set (spot-check the fixture count/names in the CI log against `evals/`).

**Synthetic fixture:** none beyond the existing eval fixtures (which are already synthetic per CLAUDE.md's PII rule).

**On failure:** if CI fails, this blocks calling the deployment "verified" — fix the underlying eval failure before any other check counts as complete for this phase; do not report an overall pass with this check red.

---

## Reporting

After running all 8 checks, produce a table: check # | pass/fail | read-back evidence (message ID, page ID, log entry ID, CI run URL, etc.) | gate referenced if blocked. This table is what goes into the phase report per CLAUDE.md's build loop step 7 — never report a check as passing without the corresponding evidence identifier.
