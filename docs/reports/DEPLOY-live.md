<!-- Purpose: report for the first live qm deployment — what is running, what it cost to get there, and what is still not deployed. -->

# Deployment report — qm live on Fly.io · 2026-08-02

**Status:** live and verified. `qm check --live` passes end to end.

```
✓ Fly live deployment check passed
· otpless-core, otpless-auth, otpless-portal, otpless-admin, otpless-web-ui — all healthy
· otpless-core: S3 put/get/delete round trip passed
· https://otpless-portal.fly.dev/healthz: HTTP 200
```

## What is running

| Component | Detail |
|---|---|
| Region | `sin` (Singapore) — `bom` has no Managed Postgres |
| Services | core, auth, portal, admin, web-ui |
| Core | Postgres-backed store and run-store, 16 workers, background work enabled |
| Persistence | Fly Managed Postgres (`otpless-pg`) + Tigris object storage (`otpless-data`) |
| Sandbox | Fly Sprites, image pinned by digest via `qm sandbox publish` |
| Model | Anthropic, key verified live by `qm doctor` |
| Sign-in | Built-in broker, one-time links via Resend |
| Portal | https://otpless-portal.fly.dev |

## What is *not* deployed

**Every skill this repository contains.** The sandbox runs qm's demo `greet` skill and `example-tool`. None of the 40 skills across the five packs are loaded, no connectors are wired (Notion, Gmail, Calendar, Slack), no scopes exist, no crons are scheduled, and the command policy has no named action-class rows. The building is standing; nobody has moved in.

## What the deployment actually taught

Every item below was hit for real. Full detail in `docs/RUNBOOK_DEPLOY.md` §4b.

**The one that mattered most: qm's fly scaffold cannot produce a healthy core without a manual fix.** `config.js` injects `SANDBOX_BACKEND=sprites` at render time for the fly target, but `secrets.js` decides whether `SPRITES_TOKEN` is required by reading `env.core.SANDBOX_BACKEND` — a field the scaffold never writes. The CLI therefore concludes the token is unnecessary, never collects or pushes it, and core crash-loops on `missing or insecure required core secrets: SPRITES_TOKEN`. The diagnostic signal is that `qm check` lists `SPRITES_TOKEN` in neither the required nor optional secrets. Fix: add `"SANDBOX_BACKEND": "sprites"` to `env.core`. Worth reporting upstream.

Others, briefly: Managed Postgres has no `bom` region. Sprites is a separate product with its own CLI and `sprite login` drops you into a remote shell. `AUTH_EMAIL_FROM` wants an address but its prompt reads like a display-name field. Fly parks a machine after 10 failed restarts, so a corrected config still needs an explicit start — and a plain restart does not apply staged secrets, only `qm up` does. The first core image pull took 83 seconds, long enough that a blue-green cutover leaves the machine in `created`.

**And a correction to our own docs.** ADR-001, the runbook, and the deploy-layer README all described copying our material into `deploy/layers/otpless/` "per qm's deployment-directory contract." No such contract exists. The real one is `qm.config.jsonc` plus a `sandbox/` layer, with packs mounted through the config's `skills[]`. That error survived four phases because nothing had executed against the real package — the exact failure mode the department playbook warns about, committed by the playbook's own authors.

## New gates from live observation

- **G27 — egress is fail-open.** Core logs `SANDBOX_BACKEND=sprites without SPRITES_EGRESS_PROXY_URL — sandboxes run with NO egress enforcement`. Agent sandboxes can reach any host. Tolerable today with a demo skill and no connectors; **must be closed before the first real candidate record enters the system** (DPDP, master PRD §6).
- **G28 — Resend sending domain unverified.** Running on `onboarding@resend.dev`, which only delivers to the Resend account owner, so the CTO cannot yet be usefully added to `AUTH_ALLOWED_EMAILS`.

## Next, in order

1. **Pack mounting.** Our skills reference config as `../config/playbook.md`, and both `packs/shared/` and `packs/recruiting/` contain a `config/` directory, so flattening into `sandbox/skills/` collides. This is the integration detail the repo has carried as explicitly unverified since P0, and it now blocks everything else.
2. **Notion connector (G7)** — highest-value first; without it the recruiting agent has no pipeline to act on.
3. **Create the `recruiter` scope**, compile per-action-class rows into the command policy (G19), resolve the agent's public name (G8).
4. **Close G27** before any real candidate data.
5. **Shadow mode** per `docs/RUNBOOK_DEPLOY.md` §5.
