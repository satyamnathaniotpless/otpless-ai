# Deploy Runbook — qm platform for OTPLESS

Everything an agent can't do alone lives here. Total human time: ~2–3 hours once.

## 1. Human-gated prerequisites (do these once)

| # | Item | Who | Notes |
|---|---|---|---|
| 1 | Cloud account: Fly.io org (recommended for speed) or AWS | CTO | qm deploys into OUR account; nothing is hosted by third parties |
| 2 | Managed Postgres (Fly Postgres / RDS) | CTO | qm's persistence layer |
| 3 | Anthropic API key (+ monthly budget cap) | Founder | Platform model access; set alerts at 50/80% |
| 4 | GitHub org repo: `satyamnathaniotpless/otpless-ai` (this repo — live). Deployment repo `satyamnathaniotpless/qm-deploy` created in step 2 | CTO | Private fork (`satyamnathaniotpless/qm-private`) is NOT needed for deploy — only later, if/when we customize qm core (ADR-001) |
| 5 | Google Workspace user for agent #1: `recruiting@otpless.com` + OAuth client for Gmail/Calendar | CTO | SPF/DKIM verified before any send |
| 6 | Slack app (bot) with handle, added to #hiring and #people | CTO | Token into qm keychain, never git |
| 7 | Notion internal integration token, shared with: Careers page `3af47713-0169-81a9-b42a-c168364504b5`, Applicants DB `collection://29905732-673c-4cf8-85c5-15f1aa2a1f7a` | Founder | Employees DB gets added in P2 |
| 8 | Agent public name decision | Founder | Goes into mailbox display name, Slack handle, disclosure line |
| 9 | Web sign-in (built-in `auth` broker): admin email address, a verified sender, and a Resend API key or SMTP credentials | CTO | qm emails one-time sign-in links; CLI wires the rest. (External IdP instead: drop `"auth"` from services and register `<publicUrl>/auth/callback` exactly) |
| 10 | Provider: **Fly.io — DECIDED (2026-08-01)**, binding per deployment directory | CTO | Create the Fly.io org + billing; slug `otpless` is local, not globally unique |

## 2. Stand up qm (agent-executable once #1 is done)

No source checkout needed. Create an organization-owned deployment repository that depends on the published package:

```bash
gh repo create satyamnathaniotpless/qm-deploy --private && git clone git@github.com:satyamnathaniotpless/qm-deploy && cd qm-deploy
npm exec --yes --package=@yc-software/qm@latest -- \
  qm init . --org otpless --target fly
npm install
```

`qm init` materializes `deployment.md` and a **`deploy-qm` agent skill** (`.codex/skills/deploy-qm/`). Hand that skill to the builder agent: it confirms the operator-owned account and billing before any mutation, configures email-gated web onboarding first, adds connectors and Slack, performs live checks, and returns the operational URLs. Initialization does not create deployment CI — deploys are agent/operator-driven by design.

Merge `platform/deploy-layer/otpless/` from this repo into the deployment directory (same shape `qm init` produces). Security posture: **Auto** org-wide; People-Ops scope starts **Strict**. Load the command policy (trust ladder, ADR-004) before the first agent scope is created.

**Later, only if we customize qm core** (custom tools in core, plugin changes): seed the private fork per ADR-001 (plain bare clone + mirror push, never GitHub's Fork button) and move the layer into `deploy/layers/otpless/` there; `update-qm` / `upstream-pr` skills maintain the upstream boundary.

## 3. Import skill packs

qm imports skill packs from git repos. Point the deployment at git@github.com:satyamnathaniotpless/otpless-ai.git — packs/shared and packs/recruiting. Create scope `recruiter` with the identity kit from `packs/shared/identity` and config from `packs/recruiting/config/` (fill `user.md` from `user.md.example`).

## 4. Verification checklist (agent-executable)

- [ ] Web UI reachable; founder + CTO sign in; scopes isolated
- [ ] Slack: @agent responds in #hiring; standup cron fires 08:30 IST
- [ ] Notion read/write round-trip on a synthetic applicant row
- [ ] Gmail draft created from a fixture thread — NOT sent (L0)
- [ ] Calendar event on agent calendar with human attendee, responseStatus readable
- [ ] Command policy: attempt an L1 action at L0 → blocked and logged
- [ ] Kill test: close all human sessions 48h → crons still fire, digest still posts
- [ ] `node evals/run.mjs` green in CI on a no-op PR

## 5. Cutover

Day 1–2 shadow mode (agent drafts, human does the work in parallel); day 3 the agent's drafts become the workflow; week 2 L1 promotion review per ADR-004 evidence.
