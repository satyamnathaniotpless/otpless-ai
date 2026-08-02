<!-- Purpose: exactly what a Claude Code session needs in order to run the deploy loop itself, what it still cannot do, and why. -->

# Agent deploy access

What the platform agent needs to build, publish, and verify the sandbox layer without a human relaying commands — established empirically on 2026-08-02 by doing it, and hitting the limits.

## The two credentials

Set both as **environment variables on the Claude Code environment**, not pasted into chat. Environment variables are injected when the container starts, so they take effect in the **next** session, not the one where you add them.

| Variable | Why | How to mint |
|---|---|---|
| `FLY_API_TOKEN` | Everything except the registry push: `fly secrets list` (how `qm up` verifies secrets), machine start/stop, logs, status, deploys | `fly tokens create org -o personal -x 24h` |
| `FLY_SANDBOX_API_TOKEN` | `qm sandbox publish` only. qm hard-requires this specific variable for Fly registry auth; an org token is **not** substitutable | `fly tokens create deploy -a otpless-sandboxes -x 24h` |

**An org token cannot mint the sandbox token** — `createLimitedAccessToken` is not authorized for it, so a human has to generate the second one. That is the single reason the agent could not complete a publish unaided.

Use short expiries. This runs in an ephemeral sandbox, and the org token can destroy apps.

## What the agent does NOT need

**None of the other 15 deployment secrets.** Verified by reading qm's source: `qm up` checks secrets by running `fly secrets list -a <app>` and comparing **names**, never values.

```js
function secretNames(app) {
  const out = fly(["secrets", "list", "-a", app], ...);
  return new Set([...out.matchAll(/^\s*\*?\s*([A-Z0-9_]+)\s/gm)]...);
}
const missing = required.filter((sec) => !existing.has(sec));
```

Anthropic, Resend, Sprites, and the signing keys stay on the Fly apps, where Fly keeps them write-only. Nobody reads them back, including the agent. Do not copy `.env` into the sandbox.

## What the agent still cannot do, and why

| Task | Blocker |
|---|---|
| Sign in to the portal | The broker emails a one-time link. The agent has no mailbox. |
| Test the agent's behaviour through the web UI | Requires a signed-in session. |
| Create the Notion integration, Slack app, or Resend DNS records | Browser OAuth and DNS control. |
| Decide the agent's public name (G8) | A judgment call reserved to the founder. |

So the split is: **the agent owns the deploy loop; the human owns anything behind a browser and anything that is a decision.**

Partial workaround for behaviour testing: `fly ssh console -a otpless-core` works with `FLY_API_TOKEN`, so core's API can be exercised from inside the machine. That is a debugging path, not a substitute for a human using the product.

## The loop, once credentialed

```bash
cd ~/otpless-ai && git pull
node platform/scripts/build-sandbox-layer.mjs --out /tmp/layer     # verifies; refuses to emit a broken layer
cp -r /tmp/layer/skills/. <deployment>/sandbox/skills/
cd <deployment>
npm exec qm -- check                                                # must list the expected skills
npm exec qm -- sandbox publish                                      # pushes a new deployment layer version
npm exec qm -- up                                                   # only when services or config changed
npm exec qm -- check --live
```

The deployment directory is reproducible from `qm init` plus four settings — `region: sin`, `flyOrg: personal`, `appPrefix: otpless`, and `SANDBOX_BACKEND: "sprites"` in `env.core`. It does not need to be the human's copy, and it does not need their `.env`.

## Two things about publishing that are easy to get wrong

**Skills are not in the Docker image.** The sandbox Dockerfile copies `tools/` only. Skills ship as a separate *deployment layer* — a JSON bundle pushed to core's API, capped at 1 MB, versioned independently. So a `sandbox publish` that changes only skills produces the **same image digest** and takes seconds. The signal to look for is the layer version:

```
· deployment layer: v2 2ae538b804ba
✓ otpless-core now boots sandboxes from registry.fly.io/otpless-sandboxes@sha256:…
```

An unchanged digest is correct. `v1 → v2` is the change.

**`qm up` does not republish skills.** It redeploys services. Only `sandbox publish` updates the layer. Running `up` after editing skills and expecting them live is the mistake to avoid.
