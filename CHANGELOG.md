# Changelog

## v0.1.0 — 2026-08-01 · Commissioning build
- Platform docs: README, CLAUDE.md (operating manual), BOOTSTRAP_PROMPT (build + maintain prompts), PRDs, ADR-001..005, deploy runbook.
- packs/shared v1: identity, standup, retro, trust-ladder skills + agent config template.
- packs/recruiting v1: 9 skills (router, triage, review, outreach, reply, schedule, reject, pipeline, watch), playbook ported from yc-software/recruiting (Notion/IST/WhatsApp-adapted), 7 role playbooks + generic _template.
- brain/ seed: company facts, policy templates (DRAFT), hiring playbook pointer, decisions log.
- platform/deploy-layer/otpless: org config, command policy (trust-ladder enforcement), layer README.
- evals v1: structure + lint + rating fixtures — GREEN (0 failures, 46 structure checks, 8/8 fixtures).
- Built by: 1 orchestrator + 2 parallel builder agents (sonnet) + evaluator run; lint self-reference issue fixed by extracting banned list to evals/fixtures/banned-phrases.txt.
