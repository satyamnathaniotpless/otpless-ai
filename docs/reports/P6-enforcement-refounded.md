<!-- Purpose: phase report — enforcement rebuilt on mechanisms qm actually has, what was verified by execution, and the one observation still outstanding. -->

# Phase report — P6 Enforcement Re-founded · 2026-08-03

**Status:** shipped. Evals green (13 check groups). Deployment layer **v8** live on Otto. One deliberate open item: the runtime behaviour of `approvals` is still unverified, and nothing is promoted on it.

## Why this phase existed

ADR-004 said agent autonomy was "encoded in qm's predeclared command policy and per-scope security posture." Neither exists in `@yc-software/qm@0.1.4` — zero occurrences of either term. That language came from the master PRD, written before anyone ran the software. Four phases of guardrail work had been resting on it, and every review passed, because reviewers compared our documents against each other and the documents agreed.

This is the third mechanism we documented and never executed against (`deploy/layers/`, then MCP, then this) and by far the most serious, because the other two were plumbing and this one was the safety story.

## What shipped

**`platform/deploy-layer/otpless/command-policy.md` — rewritten as a compilation source.** Policy now lives in machine-readable `<!-- policy-table -->` blocks with explicit `match_type`/`match_value` columns, so qm's `command` XOR `pattern` requirement is enforced by the schema's shape rather than by a runtime check. Prose tables elsewhere in the file are ignored by the compiler.

**`platform/scripts/build-tool-policy.mjs` — the compiler.** Turns those tables into qm `approvals[]` descriptor fragments. Currently emits **22 `deny` rules across six write tools that do not exist yet** (`gmail-send`, `notion-write`, `slack-send`, `calendar-invite`, `whatsapp-send`, `hrms-write`). It reports that staged-not-active status explicitly rather than presenting the rules as live enforcement.

**`platform/scripts/verify-live-layer.mjs` — the check we did not have.** Every check in this repo until now compared our documents to each other, which is precisely the process that produced three false mechanism claims. This one does a signed read of the **running** core and reports what is actually in force: layer status, runtime-vs-stored hash, every approval rule live on core, and any tool carrying none — named as explicitly *ungated*, because a tool with no matching rule is not "at L0", it is structurally identical to a fully promoted action. It also diffs local against live. Ran green against live core.

**`evals/run.mjs` §4 strengthened.** Runs the compiler, then re-runs it to a temp dir and confirms all six never-delegated classes appear as `deny` in the **compiled JSON**, not merely in the markdown. Verified red-when-broken by flipping a `deny` to `require_approval`: compiler exit 1, eval fails, restore byte-exact.

**`egress` corrected in seven places** — `platform/contracts/{hrms,whatsapp,bgv,gmail,README}.md`, `platform/deploy-layer/otpless/command-policy.md`, `docs/proposals/platform-agent.md`. All had described it as a platform-enforced host allowlist.

**Deployment layer v8 published** to live Otto, carrying the probe descriptor. Image digest unchanged — descriptors travel in the layer, not the image.

## Verified by execution, not by review

This is the part that matters. Each row was established by running something against the real package or the real deployment.

| Claim | How verified | Result |
|---|---|---|
| `approvals` reach core intact | Signed `GET /v1/deployment-layer` against live `otpless-core` | `status: applied`, `runtimeContentHash == contentHash`, both probe rules present **verbatim**. The mapping is real. |
| `egress[]` enforces nothing | Audit of every `egress` reference in `dist/src/` | Four hits: a type, a shape check, a URL rejection, and qm's own warning `egress is validated-only in contract v1`. No firewall/proxy code anywhere. |
| The pinned image contains the probe binary | `docker pull` the pinned digest, then run it | `/usr/local/bin/policy-probe` present; `policy-probe free` prints its expected line. |
| Core is pinned to that image | `printenv FLY_BASE_IMAGE` on `otpless-core` | Matches the published digest, `SANDBOX_BACKEND=sprites`. |
| The agent was not running that image | Compared PATHs | Image: `/opt/agent-venv/bin:/usr/local/sbin:/usr/local/bin:…`. Agent's shell: `/home/sprite/.local/bin:/.sprite/bin:…`. |
| Compiler and eval are red-when-broken | Mutated a `deny`, ran both, restored | Both fail; `git diff` clean after restore. |
| Evals green | `node evals/run.mjs` | 0 failures, 13 check groups. |

## Two things we had wrong, and the second is the useful one

**1. `egress` was described as a control.** It is not, and — this is the correction to ADR-010's own reasoning — **closing gate G27 will not change that.** There are two separate things: `SPRITES_EGRESS_PROXY_URL` is a blanket proxy for all sandbox traffic and is the only egress control that exists; a tool's `egress[]` list is validated-only and is not what that proxy is configured from. G27 stays load-bearing; the reason changes. Per-tool `egress[]` is documentation of intent, and is now labelled that way everywhere.

**2. The probe looked blocked, and the diagnosis of why was also wrong.** Scout reported `policy-probe: not found`, exit 127, and skipped the other two subcommands. Two rounds were then spent investigating the sandbox, on the theory that the test could not run until the binary was present.

That was wrong. The `free` arm has no approval rule, so executing it and getting 127 from the shell was correct behaviour and never a test of gating. And a `deny` decision must refuse an invocation *before* a shell runs — so `policy-probe never` is informative **whether or not the binary exists**: refused means the rule fired; exit 127 means it did not. The missing binary was never an obstacle to the test. The decisive observation cost one command the entire time.

The general lesson, now recorded in ADR-010's correction: a null result is not evidence about the thing you were testing until you have shown the test could have produced a positive — and when a test looks blocked, re-derive what each arm actually measures before going to fix the blocker.

## Also found and recorded

**A packaging trap.** With no `sandbox/Dockerfile`, qm generates `COPY tools/<dir>/<binary> /usr/local/bin/<binary>` per tool. With a custom one, it uses that file verbatim and appends *only* a presence check — the COPY lines are not added. Any custom Dockerfile must copy every binary itself. The appended `command -v` check fails the build, so it cannot ship silently broken, but the error names PATH rather than the missing COPY.

**Publishing does not retrofit.** `qm sandbox publish` reports the app "now **boots** sandboxes from `<image>`" — future tense. A sandbox that already exists keeps the image it was created with, and there is no `qm sandbox reset`. Both facts are now in `docs/RUNBOOK_DEPLOY.md` §4b.

## Still open

| Item | Why it is not closed | Blocking what |
|---|---|---|
| **Runtime behaviour of `approvals`** | Needs one command run by the live agent: `policy-probe never`. Refused → `deny` works. Exit 127 → the rule never fired and the compiler's target is wrong. Layer v8 carries a hint telling the agent not to skip it when the binary is missing. | Any trust-ladder promotion. Not blocking the compiler, which is cleared by the round-trip verification above. |
| **Sandbox staleness** | A real packaging defect: the agent's sandbox predates the image pin, or sprites never boot our image. Distinguishable by whether a freshly created sandbox has the binary. | Tool-mediated writes actually working. Not blocking the approval test. |
| **`qm rollback --to <digest>`** | Exists in the CLI. Never run. | Anything gaining deploy rights, including the proposed platform agent. |
| **G27 — sandbox egress proxy** | OPEN, CTO-owned. Now understood as the *only* egress control rather than one of two. | The first real candidate record (DPDP, master PRD §6). |
| **Three destructive actions have no tool to attach a rule to** | Self-merging a PR, editing the policy file, self-granting a credential are connector/GitHub/Admin actions, not tool invocations. No `approvals` entry can cover them. Stated plainly in `command-policy.md` §5b rather than papered over. | The platform-agent proposal, whose whole risk model depends on those three. |

## Human gates pending

No new gates. G27 is unchanged in status but its rationale is corrected in `docs/gates.md`. The one thing the operator can do that unblocks the most: **ask Scout to run `policy-probe never`** and report whether it was refused or returned "command not found". Those two answers mean opposite things and the distinction gates every promotion.
