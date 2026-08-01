#!/usr/bin/env bash
# Purpose: staged, safe-before-credentials-exist deploy script — preflights every gate in
# docs/gates.md, refuses to mutate anything on a failed check, and runs RUNBOOK_DEPLOY.md §2
# only when preflight passes and --apply is given.
set -euo pipefail

# ---------------------------------------------------------------------------
# Usage / flags
# ---------------------------------------------------------------------------
APPLY=0
for arg in "$@"; do
  case "$arg" in
    --apply)
      APPLY=1
      ;;
    --dry-run)
      APPLY=0
      ;;
    -h|--help)
      cat <<'EOF'
bootstrap-qm.sh [--dry-run|--apply]

Default (no flags, or --dry-run): preflight only. Checks every env var / CLI
tool / auth state required by docs/gates.md, prints a PASS/MISSING table keyed
to gate IDs, and exits. Never mutates anything.

--apply: if and only if every required check passes, runs the RUNBOOK_DEPLOY.md
§2 sequence (create deployment repo, qm init, npm install), then stops and
prints the real follow-up sequence (compile config, qm setup/check/plan/up,
etc.) as manual/agent-driven next steps. Refuses to run (exits non-zero, no
side effects) if any preflight check is MISSING.

Reads all values from environment variables. Never echoes a value that could
contain a secret — only PASS/MISSING against variable NAMES.
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg (use --dry-run, --apply, or --help)" >&2
      exit 2
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Preflight checks — one row per gate in docs/gates.md
# Each check is: gate id | description | how it's verified
# We print PASS/MISSING for each; we never print the variable's value.
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORG_CONFIG_PATH="${SCRIPT_DIR}/../deploy-layer/otpless/org-config.md"

ALL_PASS=1
declare -a ROWS=()

check_env() {
  # check_env <GATE_ID> <description> <VAR_NAME...>
  local gate="$1" desc="$2"
  shift 2
  local missing=()
  for var in "$@"; do
    if [ -z "${!var:-}" ]; then
      missing+=("$var")
    fi
  done
  if [ "${#missing[@]}" -eq 0 ]; then
    ROWS+=("$gate|$desc|PASS|(all set)")
  else
    ALL_PASS=0
    local joined
    joined=$(IFS=,; echo "${missing[*]}")
    ROWS+=("$gate|$desc|MISSING|$joined")
  fi
}

check_cli() {
  # check_cli <GATE_ID> <description> <binary>
  local gate="$1" desc="$2" bin="$3"
  if command -v "$bin" >/dev/null 2>&1; then
    ROWS+=("$gate|$desc|PASS|($bin on PATH)")
  else
    ALL_PASS=0
    ROWS+=("$gate|$desc|MISSING|$bin not on PATH")
  fi
}

check_gh_auth() {
  # check_gh_auth <GATE_ID> <description>
  local gate="$1" desc="$2"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    ROWS+=("$gate|$desc|PASS|(gh authenticated)")
  else
    ALL_PASS=0
    ROWS+=("$gate|$desc|MISSING|gh not installed or not authenticated (gh auth login)")
  fi
}

check_node_version() {
  # G26 — Node.js runtime >= 24 (qm hard-refuses to run below it). Reports the
  # detected version; never treated as a plain CLI-presence check like TOOL rows.
  local gate="G26" desc="Node.js runtime >= 24 (qm requirement)"
  if ! command -v node >/dev/null 2>&1; then
    ALL_PASS=0
    ROWS+=("$gate|$desc|MISSING|node not on PATH")
    return
  fi
  local ver major
  ver="$(node -v 2>/dev/null || true)"
  major="${ver#v}"
  major="${major%%.*}"
  if [[ "$major" =~ ^[0-9]+$ ]] && [ "$major" -ge 24 ]; then
    ROWS+=("$gate|$desc|PASS|(detected $ver)")
  else
    ALL_PASS=0
    ROWS+=("$gate|$desc|MISSING|detected ${ver:-unknown}, need >= 24")
  fi
}

check_g8() {
  # G8 passes on EITHER the AGENT_PUBLIC_NAME env var OR a filled-in
  # "Agent public name" row (no longer containing TODO(gate)) in org-config.md.
  # docs/gates.md "How to close a gate" documents both routes as equally valid.
  local gate="G8" desc="Agent public name (founder-decided)"
  if [ -n "${AGENT_PUBLIC_NAME:-}" ]; then
    ROWS+=("$gate|$desc|PASS|(source: AGENT_PUBLIC_NAME env var)")
    return
  fi
  if [ -f "$ORG_CONFIG_PATH" ]; then
    local line
    line=$(grep -m1 "Agent public name" "$ORG_CONFIG_PATH" || true)
    if [ -n "$line" ] && ! grep -q "TODO(gate)" <<<"$line"; then
      ROWS+=("$gate|$desc|PASS|(source: org-config.md 'Agent public name' row)")
      return
    fi
  fi
  ALL_PASS=0
  ROWS+=("$gate|$desc|MISSING|AGENT_PUBLIC_NAME env var, or org-config.md 'Agent public name' row still has TODO(gate)")
}

# G1 — Cloud account: Fly.io org (or AWS)
check_env "G1" "Fly.io org + API token" FLY_ORG FLY_API_TOKEN

# G2 — Managed Postgres
# G2 is target-dependent. qm's own .env.example marks DATABASE_URL "Needed when the target
# is aws" — on Fly, `qm up` provisions Managed Postgres and private object storage itself,
# so demanding a connection string up front would block a deploy that never needed one.
if [ "${QM_TARGET:-fly}" = "aws" ]; then
  check_env "G2" "Managed Postgres connection string (aws target)" DATABASE_URL
else
  ROWS+=("G2|Managed Postgres|N/A|provisioned by 'qm up' on the fly target")
fi

# G3 — Anthropic API key + budget cap
check_env "G3" "Anthropic API key" ANTHROPIC_API_KEY

# G4 — GitHub org repo creation rights (gh CLI authenticated against the org)
check_cli "G4a" "gh CLI installed" gh
check_gh_auth "G4b" "gh CLI authenticated"

# G5 — Google Workspace OAuth client for Gmail/Calendar. Split into two legible
# sub-checks (both map to gate G5 in docs/gates.md) since the gmail and
# google-calendar MCP servers in .mcp.json each require their own three-var set.
check_env "G5a" "Gmail OAuth (gate G5)" GMAIL_OAUTH_CLIENT_ID GMAIL_OAUTH_CLIENT_SECRET GMAIL_OAUTH_REFRESH_TOKEN
check_env "G5b" "Calendar OAuth (gate G5)" GOOGLE_OAUTH_CLIENT_ID GOOGLE_OAUTH_CLIENT_SECRET GOOGLE_OAUTH_REFRESH_TOKEN

# G6 — Slack app bot token
check_env "G6" "Slack bot token" SLACK_BOT_TOKEN

# G7 — Notion internal integration token
check_env "G7" "Notion integration token" NOTION_TOKEN

# G8 — Agent public-name decision (not a credential; env var OR org-config.md row)
check_g8

# G9 — Web sign-in broker: Resend API key or SMTP creds
if [ -n "${RESEND_API_KEY:-}" ]; then
  ROWS+=("G9|Web sign-in sender (Resend)|PASS|(all set)")
elif [ -n "${SMTP_HOST:-}" ] && [ -n "${SMTP_USER:-}" ] && [ -n "${SMTP_PASS:-}" ]; then
  ROWS+=("G9|Web sign-in sender (SMTP)|PASS|(all set)")
else
  ALL_PASS=0
  ROWS+=("G9|Web sign-in sender (Resend or SMTP)|MISSING|RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS")
fi

# G10 — Provider decision: DECIDED (Fly.io). Nothing to check beyond G1's account.
ROWS+=("G10|Provider decision (Fly.io)|PASS|(decided 2026-08-01; see docs/gates.md)")

# G11 — Trust-ladder L1 promotion: not applicable pre-deploy, informational only.
ROWS+=("G11|Trust-ladder L1 promotion|N/A|not applicable before deploy is live")

# npm tooling required for qm init regardless of gates; node's presence AND
# version are checked together as gate G26 (qm hard-requires Node >= 24).
check_cli "TOOL" "npm installed" npm
check_node_version

# ---------------------------------------------------------------------------
# Print PASS/MISSING table
# ---------------------------------------------------------------------------
echo "== bootstrap-qm.sh preflight =="
printf '%-6s %-42s %-8s %s\n' "GATE" "CHECK" "STATUS" "DETAIL"
while IFS='|' read -r gate desc status detail; do
  printf '%-6s %-42s %-8s %s\n' "$gate" "$desc" "$status" "$detail"
done < <(printf '%s\n' "${ROWS[@]}")
echo "================================"
echo "Full gate definitions and owners: docs/gates.md"

if [ "$ALL_PASS" -ne 1 ]; then
  echo ""
  echo "PREFLIGHT FAILED: one or more required checks are MISSING."
  echo "Nothing has been mutated. Close the corresponding gate(s) in docs/gates.md, export the env var(s), then re-run this script."
  exit 1
fi

echo ""
echo "PREFLIGHT PASSED: all required checks are present."

if [ "$APPLY" -ne 1 ]; then
  echo "Dry run only (default). Re-run with --apply to execute RUNBOOK_DEPLOY.md §2."
  exit 0
fi

# ---------------------------------------------------------------------------
# Apply — RUNBOOK_DEPLOY.md §2 sequence. Only reached if preflight passed AND
# --apply was given.
# ---------------------------------------------------------------------------

: "${GH_ORG:?GH_ORG must be set to the GitHub org/user that owns the deployment repo (e.g. satyamnathaniotpless)}"
: "${DEPLOY_REPO_NAME:=qm-deploy}"
: "${DEPLOY_DIR:=./${DEPLOY_REPO_NAME}}"

echo ""
echo "== Applying: standing up qm deployment repo =="

if [ -d "$DEPLOY_DIR" ]; then
  echo "Refusing to proceed: $DEPLOY_DIR already exists. Remove it or set DEPLOY_DIR to a fresh path if you intend to re-init." >&2
  exit 1
fi

echo "-> gh repo create ${GH_ORG}/${DEPLOY_REPO_NAME} --private"
gh repo create "${GH_ORG}/${DEPLOY_REPO_NAME}" --private

echo "-> git clone git@github.com:${GH_ORG}/${DEPLOY_REPO_NAME} ${DEPLOY_DIR}"
git clone "git@github.com:${GH_ORG}/${DEPLOY_REPO_NAME}" "$DEPLOY_DIR"

(
  cd "$DEPLOY_DIR"
  echo "-> npm exec --yes --package=@yc-software/qm@latest -- qm init . --org otpless --target fly"
  npm exec --yes --package=@yc-software/qm@latest -- qm init . --org otpless --target fly

  echo "-> npm install"
  npm install
)

echo ""
echo "== Stand-up sequence complete. Stopping here — the following are NOT run by this script: =="
echo "  1. Compile platform/deploy-layer/otpless/org-config.md and command-policy.md into"
echo "     ${DEPLOY_DIR}/qm.config.jsonc, per the field mapping in"
echo "     platform/deploy-layer/otpless/README.md (some mappings, e.g. where command-policy.md"
echo "     lands, are marked unverified there — do not invent a field to fill the gap)."
echo "  2. Hand the deploy-qm skill (${DEPLOY_DIR}/.codex/skills/deploy-qm/) to the builder agent:"
echo "     it confirms operator-owned account/billing, configures email-gated web onboarding,"
echo "     adds connectors and Slack, performs live checks, returns operational URLs."
echo "  3. Run, in order, inside ${DEPLOY_DIR}:"
echo "       npm exec qm -- setup   # walks secrets into qm's own keychain"
echo "       npm exec qm -- check   # validates config + sandbox, verifies credentials"
echo "       npm exec qm -- plan    # reports what 'up' would do, no mutation"
echo "       npm exec qm -- up      # pulls images, starts services, prints operational URLs"
echo "  4. Load the command policy BEFORE creating the first agent scope (ADR-004)."
echo "  5. Create scope 'recruiter' with identity kit + config (RUNBOOK_DEPLOY.md §3)."
echo "  6. Run platform/scripts/verify-deployment.md checks before calling this live."
echo "None of the above are executed by this script — they require the deploy-qm skill,"
echo "human/CTO judgment, or come after this stage in the runbook."
