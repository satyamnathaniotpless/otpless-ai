<!-- Purpose: proposal for an agent that maintains and extends Otto itself — the highest-privilege agent we would run, and why that changes the guardrails. -->

# Proposal — Platform agent (working name: the sixth pack)

**Proposed by:** platform team (Claude) · **Date:** 2026-08-02 · **Status:** draft, awaiting founder decision

## The observed work

This is not speculative. On 2026-08-01/02, getting Otto live and loaded took, by hand:

- **6 sandbox-layer publishes**, each: rebuild from the repo, verify, copy into the deployment, `qm check`, `qm sandbox publish`, confirm the layer version incremented, confirm core picked it up.
- **3 corrections where our documentation described a mechanism that did not exist** — the `deploy/layers/` directory contract, MCP as the integration path, and a command policy qm does not have. Each was found by executing against the real package, not by review.
- **Continuous gate-ledger maintenance** — 28 gates, several of which changed status, one (G12) turned out to be obsolete rather than open, and one (G2) was demanding a credential the Fly path never needed.
- **Eval maintenance** — the harness grew from 3 check groups to 13, and twice the harness itself was the defect (a cross-reference check that silently stopped looking after a code fence; a PII guard blind to `.md.example` files).

That work does not stop. Every skill change needs a publish. Every upstream release needs evaluating. Every gate that closes needs the ledger updated, and every claim in our docs decays as the platform moves.

## Why an agent rather than a script or a form

**Most of it should be a script, and already is.** `platform/scripts/build-sandbox-layer.mjs` does the build and verification deterministically. The publish sequence is six commands. A CI job could run evals on every push. If the proposal were only "automate the publish loop," the honest answer would be: write the script, add CI, do not build an agent.

The agent-shaped part is narrower and real:

- **Deciding whether a red eval is a bug in the check or in the thing being checked.** Twice it was the check. A script cannot tell the difference; it can only fail.
- **Reading an upstream release and judging whether the bump is safe** — what changed, does it touch a contract we depend on, does our config still validate.
- **Noticing that a document has quietly become false.** Nothing detects "this contract describes a mechanism that no longer exists." A reader does.
- **Writing the correction, with the reasoning**, so the next person understands why rather than just what.

That is the case for an agent. It is a genuine case, but it is smaller than "maintain the platform" sounds, and the proposal should be judged on it rather than on the volume of mechanical work it would also absorb.

## What it would own

| Owns | Explicitly does not own |
|---|---|
| Building and publishing the sandbox layer when packs change | Merging its own PRs, ever |
| Running evals, fixing reds, extending the harness | Deciding whether a failing guardrail may be relaxed |
| Monthly `@yc-software/qm` bump: read the release, validate, open a PR | Applying the bump to production unattended |
| Keeping `docs/gates.md`, `brain/`, and CHANGELOG true | Closing a gate — only the accountable human closes one |
| Proposing new agents and departments when it observes repeated manual work | Creating them |
| Verifying deployment health, reading logs, triaging failures | Any change to enforcement config |

## Never-delegated check

This is the crux, and it is different in kind from every other agent we have proposed.

Scout can draft an email. The worst outcome is a bad message a human sent. **The platform agent can change the rules that constrain Scout** — including, in principle, the never-delegated list itself. It is the only agent whose failure mode is *other agents becoming unsafe*.

Concretely it must never, at any trust level:

- Modify enforcement configuration — whatever mechanism the re-founding lands on (tool `approvals`, `egress`, `securityScreen`)
- Modify the never-delegated list, or any file that compiles into it
- Merge any pull request, including a trivial one
- Grant itself or any scope a credential, a token, or a broader connector scope
- Deploy without a verified rollback path

The first two are not "high-trust actions requiring approval." They are actions it must be structurally unable to take — which, per ADR-009, is now expressible: a tool with `approvals: [{ pattern: "...", decision: "deny" }]` cannot be argued into compliance the way a paragraph in a SKILL.md can.

## Cost to build

| Item | Detail |
|---|---|
| New pack | `packs/platform/` — roughly 6 skills: publish-layer, eval-watch, update-qm, gate-sweep, propose, platform-status |
| New scope | `platform/deploy-layer/otpless/scopes/platform.md` (one file) |
| New contracts | GitHub (PR creation, no merge). Fly is already contracted implicitly via the deploy scripts and should be written up properly. |
| Changes to `packs/shared` | Expected none — five agents have imported it unchanged. If this one needs a change, that is the most interesting line in this document. |
| Human gates created | Its own GitHub account (PRD §12.1); Fly tokens scoped to publish only, in Otto's keychain; a verified `qm rollback` path |

## What would make this a bad idea

Four things, and the first two are current blockers rather than objections:

1. **The enforcement model is unimplemented.** ADR-004 describes a command policy qm does not have. Building a self-modifying agent on top of a safety model we have just discovered is prose would be exactly backwards. **This must land first.**
2. **Rollback is unproven.** `qm rollback --to <digest>` exists in the CLI. Nobody has run it. An agent with deploy rights and an untested undo is a bad trade at any volume.
3. **The volume may not justify it.** Six publishes happened during a commissioning push. In steady state it might be one a week, which a human does in five minutes. The honest test: after a month of normal operation, count the publishes. If it is fewer than three a week, this is a script and a cron, not an agent.
4. **It concentrates risk.** Today, platform changes require a human in the loop by construction — there is no other path. This proposal removes that property deliberately. That is the trade being made, and it should be made consciously rather than as a side effect of wanting convenience.

## Recommendation

**Build it, but not yet, and not first.**

Order: land the enforcement re-founding; prove `qm rollback` against a deliberately broken layer; then build this pack starting at L0 on every action-class, PR-only, with the never-delegated additions above expressed as `deny` rules rather than instructions.

If after a month the publish volume is low and the eval reds are rare, do not build it — take the script and the cron, and keep the human. The strongest version of this proposal is the one willing to conclude that.
