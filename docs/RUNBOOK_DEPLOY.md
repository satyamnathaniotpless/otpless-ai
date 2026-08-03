# Deploy Runbook — Otto, OTPLESS's agent platform (built on qm)

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

**Branding note on item 6:** qm exposes no display-name/brand config key, so the Otto name does not propagate automatically. `qm slack render` generates `slack-app-manifest.yml` with `name: qm`, `display_name: qm` every time it runs, so editing that file is not durable — rename the Slack app to Otto in Slack's own UI *after* creation instead. The portal/admin UI chrome is baked into qm's images and is out of scope for a rename without adopting the private fork (ADR-001); that trade-off is a deliberate non-goal, not a gap in this runbook.

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
- [ ] Enforcement: attempt a `deny`-ruled invocation → refused outright, with no inline approval offered; attempt a `require_approval` one → pauses for a human. (Not "command policy" — qm has none. The mechanism is `approvals[]` on tool descriptors; see ADR-010 and its 2026-08-03 correction.)
- [ ] Kill test: close all human sessions 48h → crons still fire, digest still posts
- [ ] `node evals/run.mjs` green in CI on a no-op PR
- [ ] `node platform/scripts/verify-live-layer.mjs --config <deploy>/qm.config.jsonc` green — the only check that reads the **running** deployment rather than comparing our documents to each other. It prints every approval rule live on core, and names any tool carrying none as explicitly ungated. Needs `flyctl` on PATH and `FLY_API_TOKEN`; takes ~60–90s.

## 4b. Observed on the first live deployment (2026-08-02)

Everything below was hit for real on the way to a green stack. Recorded so the next deployment does not rediscover them.

| Issue | What happens | Fix |
|---|---|---|
| **qm scaffold omits `SANDBOX_BACKEND`** | `config.js` injects `SANDBOX_BACKEND=sprites` at render time for the fly target, but `secrets.js` decides `SPRITES_TOKEN` is required by reading `env.core.SANDBOX_BACKEND` — which the scaffold never writes. So the CLI never collects or pushes the token, and core crash-loops on `missing or insecure required core secrets: SPRITES_TOKEN`. **`qm check` listing `SPRITES_TOKEN` under required secrets is the signal the fix took.** | Add `"SANDBOX_BACKEND": "sprites"` to `env.core` in `qm.config.jsonc`. Upstream bug — worth reporting. |
| **Sprites is a separate product with its own CLI** | `SPRITES_TOKEN` does not come from `flyctl`. On the fly target Sprites is the only sandbox backend (`sandbox.backend` accepts `"sprites"` or `"aws"`, and `"aws"` requires target `aws`). | `curl -fsSL https://sprites.dev/install.sh \| bash`, then `sprite login`, or generate at sprites.dev/account. Note `sprite login` drops you into a remote sandbox shell — `exit` to return. |
| **Managed Postgres is not in every region** | `bom` (Mumbai) is unavailable; `qm up` fails at cluster creation. Available at time of writing: ams dfw fra gru iad lax lhr nrt ord sin sjc syd yyz. | Use `sin` (Singapore) for an IST team. |
| **`AUTH_EMAIL_FROM` wants an address, not a name** | The setup prompt reads like a display-name field; entering a name makes auth refuse to boot with `must be a verified sender address`. | Use a bare address. `onboarding@resend.dev` works without domain verification but only delivers to the Resend account owner (gate G28). |
| **Machines park after 10 failed restarts** | Once a config error has crash-looped a machine, Fly stops retrying. It stays `stopped`/`created` even after the config is fixed. | `qm up` to apply staged secrets, then `fly machine start <id> -a <app>`. A plain restart does **not** apply staged secrets. |
| **First image pull is slow** | The core image took ~83s to pull, so the machine sits in `created` after a blue-green cutover and `check --live` reports `machine state is created instead of started`. | Start it; not an error. |
| **Egress is fail-open** | Core logs `SANDBOX_BACKEND=sprites without SPRITES_EGRESS_PROXY_URL — sandboxes run with NO egress enforcement`. | Gate G27. Close before any real candidate data. Note the proxy is the *only* egress control: per-tool `egress[]` lists are validated-only in contract v1 and enforce nothing (ADR-010 correction §1). |
| **Publishing a sandbox image does not retrofit existing sandboxes** | `qm sandbox publish` reports the app "now **boots** sandboxes from `<image>`" — future tense. A sandbox that already exists keeps the image it was created with, so a tool binary added today can be missing from an agent's shell tomorrow (`command not found`, exit 127) while being demonstrably present in the pinned image. | Confirm with `docker run --rm <pinned digest> sh -c 'command -v <binary>'` before blaming the layer. Getting the binary into an existing sandbox needs that sandbox recreated; there is no `qm sandbox reset`. |
| **A skills-or-descriptor-only change does not move the image digest** | Skills and tool *descriptors* travel in the versioned deployment layer; only tool *binaries* are baked into the image. Publishing a descriptor edit re-exports the identical digest. | The **layer version** is the signal (`deployment layer: v8 <hash>`), not the digest. Verify with `platform/scripts/verify-live-layer.mjs`. |
| **A custom `sandbox/Dockerfile` silently stops copying tool binaries** | With no custom Dockerfile, qm generates `COPY tools/<dir>/<binary> /usr/local/bin/<binary>` per tool. With one, qm uses it verbatim and appends *only* a presence check — the COPY lines are not added. | If you add a `sandbox/Dockerfile`, copy every tool binary in it yourself. The appended `command -v` check fails the build, so this cannot ship broken — but the error names PATH, not the missing COPY. |

Sequence that worked, end to end:

```bash
qm init . --org otpless --target fly     # in a directory that is NOT otpless-ai
npm install
# edit qm.config.jsonc: region, flyOrg, and add SANDBOX_BACKEND to env.core
fly apps create otpless-sandboxes --org <org>
qm setup
fly storage create -a otpless-core -n otpless-data
qm sandbox publish                       # needs Docker running
qm secrets push
qm up
qm check --live
```

## 5. Cutover

Day 1–2 shadow mode (agent drafts, human does the work in parallel); day 3 the agent's drafts become the workflow; week 2 L1 promotion review per ADR-004 evidence.
