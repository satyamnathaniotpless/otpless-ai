# Deploy Runbook — qm platform for OTPLESS

Everything an agent can't do alone lives here. Total human time: ~2–3 hours once.

## 1. Human-gated prerequisites (do these once)

Live status of every item below (owner, workaround, what's actually blocking): `docs/gates.md`. That table is the ledger; this list is the one-time reference.

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
| 11 | Node.js runtime **>= 24** on every machine that runs qm CLI commands (`bootstrap-qm.sh`, `deploy-qm` skill, any operator machine) | CTO | qm hard-refuses to run below Node 24 — this is a genuine blocker to `qm init`/`setup`/`check`/`plan`/`up`, not a footnote. Gate `G26` in `docs/gates.md` |

## 2. Stand up qm (agent-executable once #1 is done)

Run `platform/scripts/bootstrap-qm.sh` — it preflights every item in §1 (keyed to the gate ids in `docs/gates.md`, including the Node >= 24 check for G26), refuses to mutate anything if a check is missing, and only on `--apply` runs the sequence below.

No source checkout needed. Create an organization-owned deployment repository that depends on the published package:

```bash
gh repo create satyamnathaniotpless/qm-deploy --private && git clone git@github.com:satyamnathaniotpless/qm-deploy && cd qm-deploy
npm exec --yes --package=@yc-software/qm@latest -- \
  qm init . --org otpless --target fly
npm install
```

**Verified against `@yc-software/qm@0.1.4`** (see `docs/ADRS.md` "ADR-001 correction"): `qm init` materializes the real deployment-directory contract (`"contract": 1`) — `qm.config.jsonc` (`orgId`, `publicUrl`, `target`, `modelProvider`, `appPrefix`, `region`, `flyOrg`, `services[]`, `plugins[]`, `skills[]`, per-service `env`/`secretEnv`, `sandbox.app`), `sandbox/skills/<id>/SKILL.md`, `sandbox/tools/<id>/tool.json`, an optional `sandbox/Dockerfile`, the **`deploy-qm` agent skill** (`.codex/skills/deploy-qm/`), plus `.env.example`, `slack-app-manifest.yml`, `AGENTS.md`, `deployment.md`, `package.json`. **There is no `deploy/layers/` directory anywhere in this contract.**

Hand `deploy-qm` to the builder agent: it confirms the operator-owned account and billing before any mutation, configures email-gated web onboarding first, adds connectors and Slack, performs live checks, and returns the operational URLs. Initialization does not create deployment CI — deploys are agent/operator-driven by design.

Compile `platform/deploy-layer/otpless/org-config.md` and `command-policy.md` into `qm.config.jsonc` (exact field mapping, and what's still unverified, in `platform/deploy-layer/otpless/README.md` — do not copy the directory anywhere; it stays in this repo as the authored source). Security posture: **Auto** org-wide; People-Ops scope starts **Strict**. Load the command policy (trust ladder, ADR-004) before the first agent scope is created.

Then run the real qm workflow, in order, inside the deployment repo:

```bash
npm exec qm -- setup   # walks secrets into qm's own keychain
npm exec qm -- check   # validates config + sandbox, verifies credentials against providers
npm exec qm -- plan    # reports what `up` would do — no mutation
npm exec qm -- up      # pulls images, starts services, prints operational URLs
```

> **Do not point a Fly app at this repository or at the qm-deploy repo's source.** qm does not build from source — `qm up` selects immutable runtime image digests from its release manifest and orchestrates the Fly apps itself. Running `flyctl launch` against either repo fails with:
> ```
> Could not detect runtime or Dockerfile
> ```
> — correctly: neither repo contains a buildable service, and none is planned. Only `qm up` deploys.

**Later, only if we customize qm core** (custom tools in core, plugin changes): seed the private fork per ADR-001 (plain bare clone + mirror push, never GitHub's Fork button); `update-qm` / `upstream-pr` skills maintain the upstream boundary. There is no `deploy/layers/otpless/` destination to move anything into — the fork question is separate from where our deploy config lives.

## 3. Load our skill packs

Per the verified contract, qm does **not** import skill packs from a git URL — `skills[]` in `qm.config.jsonc` points at directories of `SKILL.md` mounted into the agent, alongside/inside `sandbox/skills/<id>/SKILL.md`. Point `skills[]` (or populate `sandbox/skills/`) at this repo's `packs/shared` and `packs/recruiting` directories. Exactly how a path living in this repo (`otpless-ai`, not the deployment repo) reaches `skills[]` — checked out as a build step, a mounted path, or copied in during `qm init`/CI — is **unverified**; `TODO(gate)`: confirm by running `qm check` against a config that references it, then record the real mechanism here and in `platform/deploy-layer/otpless/README.md`. Create scope `recruiter` with the identity kit from `packs/shared/identity` and config from `packs/recruiting/config/` (fill `user.md` from `user.md.example`).

## 4. Verification checklist (agent-executable)

Executable procedure (pass condition, synthetic fixture, and failure action per check): `platform/scripts/verify-deployment.md`.

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
