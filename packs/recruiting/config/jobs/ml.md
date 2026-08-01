# ML Engineer

## Posting

- **Role:** ML Engineer
- **Posting link:** OTPLESS careers page, role #6
- **Comp band:** ₹25–45L mid / ₹45–75L senior + ESOPs
- **Owner:** Satyam (Founder)

## Outreach hook patterns

- Reference a specific fraud/risk/abuse model they shipped to production: "saw you shipped {model} to prod against an adaptive adversary — exactly our problem."
- For Kaggle/OSS-ML candidates: name the rank or project.
- For notebooks-only backgrounds with strong theory: not an auto-advance signal — probe production experience directly.

## Candidate bar

**Hard requirements**
- Has taken ML to production end-to-end — trained, deployed, monitored. Not notebooks-only.
- Strong Python plus streaming/feature infrastructure; thinks in latency budgets.

**Strong signals**
- Has worked on fraud, risk, abuse, or identity problems; understands how attackers respond to models.
- Frames the problem before reaching for the model.
- Built own product / OSS contributor / identity-auth depth (universal preference, all roles).

**Auto-advance signals**
- Strong Q1 artifact — a real production model with measured lift, not a Kaggle-only submission.
- Strong Q4 identity/auth/fraud depth answer.

**Auto-reject signals**
- Notebooks-only background, no production deployment experience.
- Generic AI-written answers with no specifics about a real model or its failure modes.

## Work-sample brief

Bot detection on a synthetic auth-traffic dataset: frame the problem, design features and an evaluation harness, and produce a scored approach. 2–3 hours. Judged on framing and eval design, explicitly **not** on final accuracy. AI tools required.

## Role-specific Q&A

| Question | Answer |
|---|---|
| Is this judged on model accuracy? | No — judged on problem framing and evaluation design. |
| What's the latency constraint? | Inference happens in the milliseconds between tap and login — happy to detail in the debrief. |

## Evaluation emphasis

Problem framing and adversarial thinking over leaderboard accuracy. Reward candidates who design the eval harness before the model.
