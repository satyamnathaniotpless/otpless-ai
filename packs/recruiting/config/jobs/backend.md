# Backend Engineer

## Posting

- **Role:** Backend Engineer
- **Posting link:** OTPLESS careers page, role #4
- **Comp band:** ₹20–40L mid / ₹40–60L senior / ₹15–20L exceptional junior + ESOPs
- **Owner:** CTO

## Outreach hook patterns

- Reference a specific system they scaled and what broke: "saw you scaled {system} 10x — would love to hear what actually broke."
- For identity/payments/trust-infra backgrounds: lead with that domain match directly.
- For OSS infra contributors: name the project.

## Candidate bar

**Hard requirements**
- 3+ years on high-scale distributed systems in Java, Go, or Node.
- Knows queues, workers, retries, Redis, SQL beyond tutorial level.

**Strong signals**
- Has scaled something 10x and can narrate exactly what broke.
- Low ego, high ownership, taste for simple systems.
- Built own product / OSS contributor / identity-auth depth (universal preference, all roles).

**Auto-advance signals**
- Strong Q1 artifact — a real system with production traffic, incident write-up, or scaling story.
- Strong Q4 identity/auth/fraud depth answer.

**Auto-reject signals**
- No artifact, only tutorial-level or coursework projects.
- Generic AI-written answers with no specifics about what broke or what they owned.

## Work-sample brief

Design an OTP/auth service handling 10K RPS: idempotency strategy, rate limiting, and backpressure under multi-tenant load. 2–3 hours — design doc plus a partial implementation of the core idempotency path. AI tools required.

## Role-specific Q&A

| Question | Answer |
|---|---|
| What's the latency budget? | Double-digit milliseconds on the critical path; 99.99% availability target. |
| On-call expectations? | You own a core service end-to-end, including on-call — happy to detail rotation in the debrief. |

## Evaluation emphasis

Correctness under concurrency (idempotency, rate limiting) over raw feature scope. Reward candidates who can narrate failure modes, not just the happy path.
