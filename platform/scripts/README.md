# platform/scripts/ — what's here and how the sandbox layer ships

## build-sandbox-layer.mjs

Assembles a qm-ready `sandbox/skills/` tree from this repo's packs (`packs/shared`,
`packs/recruiting` by default) and refuses to emit one that qm would reject or that ships a
dead reference, a leaked address, or an oversized bundle. Zero dependencies, Node 22.

```
node platform/scripts/build-sandbox-layer.mjs                                # dry run: verify + report, write nothing
node platform/scripts/build-sandbox-layer.mjs --out <dir>                     # write skills/** under <dir>
node platform/scripts/build-sandbox-layer.mjs --packs shared,recruiting --out <dir>
```

Non-zero exit on any verification failure; on failure, nothing is written (or, with `--out`, any
prior directory there is left untouched) — see the script's own header comment for what it
checks and why. `evals/run.mjs` §13 runs it in dry-run mode on every eval pass, so a pack change
that breaks the sandbox layer fails the suite the same day, not at deploy time.

## The three-command deploy flow

1. **Build the layer** — from this repo, against the packs you're shipping this deploy:
   ```
   node platform/scripts/build-sandbox-layer.mjs --packs shared,recruiting --out ./_sandbox-build
   ```
   Read the summary. A red here is a repo-content defect (see the script's report for exactly
   which reference, frontmatter, or PII check failed) — fix it before step 2, not after.

2. **Copy into the qm deployment directory** — the deployment directory is a separate checkout
   qm operates from (created per `docs/RUNBOOK_DEPLOY.md`), not this repo. Copy the built tree
   into its `sandbox/` folder, then fill in the one file the builder deliberately never ships:
   the real `packs/recruiting/config/user.md` (gitignored here by design — see the builder's
   "expected-missing (gitignored)" report rows). Copy `user.md.example` from this repo, fill it
   in with the real per-deployment operator/agent identity, and place it at
   `<deployment-dir>/sandbox/skills/recruit/config/user.md` before publishing.
   ```
   rm -rf <deployment-dir>/sandbox/skills
   cp -r ./_sandbox-build/skills <deployment-dir>/sandbox/skills
   cp packs/recruiting/config/user.md.example <deployment-dir>/sandbox/skills/recruit/config/user.md
   # then edit that file in place — never commit it back into this repo
   ```

3. **Publish and bring the deployment up**, from the deployment directory:
   ```
   qm sandbox publish
   qm up
   ```

## Other scripts here

- `bootstrap-qm.sh` — preflights every gate in `docs/gates.md` before the deployment directory
  is created; `--apply` runs the create/init sequence once preflight is clean.
- `verify-deployment.md` — the executable-by-agent read-back checklist run after `qm up`, before
  calling a phase's deployment done.
- `sync-agents.mjs` — materializes `agents/*.md` into `.claude/agents/` (this repo's own build
  team, unrelated to the qm sandbox layer above).
