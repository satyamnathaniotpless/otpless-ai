<!-- Purpose: the living ledger of every human-gated decision blocking or governing the platform — the single answer to "what is the founder/CTO blocking?" -->

# Human Gate Ledger

This is the live status of every item that cannot be closed by an agent — not because of a skill gap, but because the org's guardrails require a specific human to decide, credential, or authorize it. It is sourced from `docs/RUNBOOK_DEPLOY.md` §1, plus two standing gates that recur throughout the build (agent naming, trust-ladder promotions).

## Rules

1. **Agents never stall on a gate.** When work hits a gate, the agent records it here, stages the exact next step (command, config, or PR), and moves to the next item. A blocked step costs the operator one paste or one approval — never a redesign.
2. **Every gate names exactly one accountable human** (Founder or CTO per the runbook's assignment). Ambiguity here just means asking that person, not defaulting to "someone."
3. **A gate is closed only by that human** — an agent cannot self-approve a credential, an OAuth grant, a name, or a trust promotion, even if it has the technical means to fake it.
4. **This table is maintained continuously**, not just at deploy time — update status the moment a gate opens, is worked around differently, or closes.

## Gate table

| ID | Gate | Owner | Why it is human | What unblocks when it lands | Current workaround in the build | Status |
|---|---|---|---|---|---|---|
| G1 | Cloud account: Fly.io org (or AWS) | CTO | credential / spend | `bootstrap-qm.sh` can create the deployment repo and run `qm init --target fly` | Preflight in `bootstrap-qm.sh` checks for `FLY_ORG` / `FLY_API_TOKEN` (or AWS equivalent) and reports MISSING; nothing provisioned | OPEN |
| G2 | Managed Postgres (Fly Postgres / RDS) | CTO | credential / spend | qm's persistence layer can be wired during `qm init` | Preflight checks for a `DATABASE_URL`-shaped env var; deploy-qm skill will provision/attach once G1 is closed | OPEN |
| G3 | Anthropic API key + monthly budget cap | Founder | credential / spend | Platform model access for every scope | Preflight checks for `ANTHROPIC_API_KEY`; budget cap and 50/80% alert thresholds are config the agent can propose but the cap value itself is a spend decision | OPEN |
| G4 | GitHub org repo `qm-deploy` created | CTO | credential (org repo-create rights) | `bootstrap-qm.sh` step "create deployment repo" can run | Preflight checks `gh auth status` succeeds against the target org; script refuses to run `gh repo create` until this passes | OPEN |
| G5 | Google Workspace user `recruiting@otpless.com` + OAuth client (Gmail/Calendar), SPF/DKIM verified | CTO | OAuth / DNS-DKIM | Recruiter agent can draft (L0) and later send (L1) real email | Preflight checks for OAuth client env vars; all current email work runs against synthetic fixture threads only, never this mailbox | OPEN |
| G6 | Slack app (bot) created, added to #hiring and #people | CTO | OAuth / credential | @agent can respond in Slack, standup cron can post | Preflight checks for `SLACK_BOT_TOKEN`; token is never written to git, only read from env at deploy time | OPEN |
| G7 | Notion internal integration token, shared with Careers page and Applicants DB | Founder | credential / OAuth | Notion read/write round-trip (real Applicants DB) | Preflight checks for `NOTION_TOKEN`; verification checklist uses a synthetic applicant row in a scratch/test location, never the shared Applicants DB, until this lands | OPEN |
| G8 | Agent public-name decision | Founder | naming (explicitly reserved to founder per CLAUDE.md) | Mailbox display name, Slack handle, AI-disclosure line can be finalized | Internal/code references use the neutral scope name `recruiter`; no public-facing name is minted or guessed | OPEN |
| G9 | Web sign-in broker: admin email, verified sender, Resend API key or SMTP creds (or external IdP registration) | CTO | credential / DNS | qm's one-time sign-in link flow can be enabled | Preflight checks for `RESEND_API_KEY` (or SMTP vars) or, if external IdP, for the callback-URL registration; web UI check in verification checklist stays unchecked until then | OPEN |
| G10 | Provider decision: Fly.io, binding per deployment directory | CTO | spend / infra decision | — | **DECIDED 2026-08-01**: Fly.io, slug `otpless` (local, not globally unique). `bootstrap-qm.sh` targets `--target fly` unconditionally; org + billing (G1) still required to execute | DECIDED — G1 still open |
| G11 | Trust-ladder L1 promotion (recruiter agent, first action class) | Founder | trust-ladder promotion (ADR-004) | Recruiter can auto-send routine sends for that action class | Agent stays at L0 (drafts-only); promotion PR will be opened once ≥95% unedited-draft-acceptance evidence exists over the ADR-004 window, but the merge itself is a human act | NOT YET APPLICABLE (pre-deploy) |

Note on G10: this is the one row where the human decision itself is already closed (Fly.io, per RUNBOOK §1 item 10 and ADR-001 staging note) — what remains open is the credential/account underneath it (G1), not the choice.

## How to close a gate

**What the human does** (per gate):
- G1–G7, G9: obtain/create the credential or account, then set the corresponding environment variable(s) in the deployment environment (never commit them to git). `bootstrap-qm.sh --dry-run` (the default) lists the exact env var name(s) it expects for each gate.
- G8: the founder states the agent's public name; paste it into `platform/deploy-layer/otpless/org-config.md` (or hand it to the agent to do so) — this is the only gate whose output is text, not a credential.
- G11: the founder reviews the promotion PR the agent opens once evidence qualifies, and merges it (or doesn't).

**What the agent runs afterward**:
- After any of G1–G7, G9 land: re-run `platform/scripts/bootstrap-qm.sh` (no flags) to re-check preflight. Once all required vars for a given step show PASS, run it again with `--apply` to execute that stage.
- After G8 lands: update `platform/deploy-layer/otpless/org-config.md` with the name, propagate to Slack handle / mailbox display name / disclosure line, and re-verify per `platform/scripts/verify-deployment.md`.
- After G11 lands (PR merged): update the command policy (`platform/deploy-layer/otpless/command-policy.md`) to reflect the new autonomy level for that action class, and note the change in `brain/` per ADR-003 in the same commit.

## Status legend

- **OPEN** — blocking, no credential/decision provided yet.
- **DECIDED** — the human decision is made; a dependent credential/account may still be open (see G10).
- **NOT YET APPLICABLE** — gate exists but its preconditions (e.g. deploy live, evidence window elapsed) haven't been reached.
- **CLOSED** — human has provided the input; agent has verified and moved the corresponding runbook step from staged to executed.
