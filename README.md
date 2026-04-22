# Skillz — AI Agent Skills Marketplace (MVP)

A working scaffold of an audited marketplace where users can publish, buy,
execute, and review AI agent **skills** — small, well-scoped capabilities that
run inside a sandbox and are validated through a multi-layer audit pipeline.

> Status: production-shaped MVP. Every module is wired end-to-end with real
> logic — not stubs — but the sandbox, static analyzer, and scenario engines
> are intentionally compact and meant as the foundation for hardening, not a
> finished security product.

---

## Repository layout

```
skillz/
├── backend/          NestJS API + Prisma + BullMQ
├── sandbox/          FastAPI sandbox + Docker-isolated runner
├── frontend/         Next.js 14 marketplace (App Router + Tailwind)
├── docker-compose.yml
└── .env.example
```

---

## Architecture

```
┌──────────┐  HTTPS  ┌──────────────┐  HTTP  ┌─────────────────────┐
│ Next.js  │ ──────▶ │  NestJS API  │ ─────▶ │ FastAPI sandbox svc │
└──────────┘         │ ─ Skills     │        │  ├─ /run            │
                     │ ─ Executions │        │  ├─ /analyze        │
                     │ ─ Reviews    │        │  ├─ /scenarios      │
                     │ ─ Audit      │        │  └─ /adversarial    │
                     │ ─ Logs (✛)   │        └──────────┬──────────┘
                     │ ─ Monitoring │                   │ docker run
                     │ ─ Kill switch│                   ▼
                     └──────┬───────┘        ┌────────────────────┐
                            │                │ skillz-runner img  │
                  ┌─────────┴────────┐       │ (no-network, ro,   │
                  ▼                  ▼       │  cap-drop=ALL,     │
              Postgres            Redis      │  pids/mem limits)  │
              (Prisma)           (BullMQ)    └────────────────────┘
```

**(✛)** Logs are append-only and **hash-chained** per execution
(`sha256(prevHash || payload)`), making tampering detectable without on-chain
storage. Plug in an L2 anchor for the optional blockchain feature.

---

## Modules implemented

| Module              | Where                                                          | Notes |
|---------------------|----------------------------------------------------------------|------|
| Skill registry      | `backend/src/skills`                                          | CRUD, slugs, versioning, fork |
| Execution engine    | `backend/src/executions`                                      | Permission validation + sandbox client |
| Sandbox + runner    | `sandbox/`                                                    | Docker isolation, no network, caps dropped |
| Static analyzer     | `sandbox/app/analyzer.py`                                     | AST + regex; flags wallet/obfuscation/prompt-injection |
| Scenario tests      | `sandbox/app/scenarios.py`                                    | Per-category oracles |
| Performance metrics | `backend/src/skills/skills.service.ts:refreshAggregates`      | Rolling success / latency / score |
| Adversarial probes  | `sandbox/app/adversarial.py`                                  | Prompt injection, exfil, code injection vectors |
| Certification       | `backend/src/audit/certification.ts`                          | Deterministic 5-tier ladder, auto-up/downgrade |
| Permission engine   | `backend/src/executions/permissions.ts` + runner harness      | Domain whitelist, action verbs, spend cap, wallet gate |
| Logging system      | `backend/src/logs` + hash chain in `executions.service.ts`    | Append-only, integrity-checkable |
| Ratings & reviews   | `backend/src/reviews`                                         | Anti-fake: must own a SUCCEEDED execution |
| Creator profiles    | `backend/src/creators`                                        | Skills, executions, audit pass rate, est. revenue |
| Free skills hub     | `frontend/src/app/free`                                       | `pricingModel=FREE` filter |
| Collaborative hub   | `backend/src/collaboration` + `skills.service.ts:fork`        | Forking + contribution % tracking |
| Continuous monitor  | `backend/src/monitoring`                                      | 60s scan: anomaly detection, auto-disable, periodic re-audit |
| Kill switch         | `backend/src/kill-switch` + `skills.service.ts:setKillSwitch` | Admin toggle, also auto-triggered by monitor |
| Marketplace UI      | `frontend/src/app/{page,browse,free,skills/[id],creators/[id],dashboard}` | Featured, browse, detail, dashboard |

### Certification ladder (auto-derived)

| Tier                     | Required evidence |
|--------------------------|-------------------|
| `UNVERIFIED`             | default |
| `FUNCTION_VERIFIED`      | static + sandbox passes |
| `PERFORMANCE_VERIFIED`   | + scenarios ≥ 80% pass + perf score ≥ 70 |
| `SECURITY_AUDITED`       | + adversarial passes + static risk < 30 |
| `BATTLE_TESTED`          | + ≥ 100 real executions + perf ≥ 85 |

Each new published version **resets cert to `UNVERIFIED`** and must be re-audited.

---

## Quick start

```bash
cp .env.example .env
# Build images (the runner-image service builds skillz-runner:latest then exits).
docker compose build
# Bring up postgres / redis / sandbox / backend / frontend.
docker compose up
# In another shell, once the backend logs "listening on :4000":
docker compose exec backend npx ts-node prisma/seed.ts
open http://localhost:3000
```

| Service   | URL                                  |
|-----------|--------------------------------------|
| Frontend  | http://localhost:3000                |
| API       | http://localhost:4000/api            |
| Swagger   | http://localhost:4000/api/docs       |
| Sandbox   | http://localhost:8000/health         |
| Postgres  | localhost:5432 (skillz/skillz/skillz)|

> The `sandbox` container needs the host Docker socket bind-mounted to spawn
> isolated runner containers. If you don't want that, the executor falls back
> to in-process mode automatically (`docker.from_env()` will fail and the API
> still responds — clearly less secure, useful for local CI).

---

## API (selected)

```
POST   /api/skills                         create skill (header x-user-id)
GET    /api/skills?category=&q=&sort=…     list & filter
GET    /api/skills/:id                     details + audits + contributors
POST   /api/skills/:id/versions            publish new version (re-audits)
POST   /api/skills/:id/fork                fork into your own skill
POST   /api/skills/:id/execute             run inputs through sandbox
GET    /api/skills/:id/audit               recent audit results
POST   /api/skills/:id/audit               run full pipeline (sync)
POST   /api/skills/:id/audit/async         queue an audit (BullMQ)
POST   /api/skills/:id/audit/reassess      re-derive cert from existing evidence
GET    /api/skills/:id/reviews             reviews
POST   /api/reviews                        create review (must own a SUCCEEDED execution)
GET    /api/skills/:id/logs                recent logs across executions
GET    /api/executions/:id                 execution + logs (chain integrity flag)
GET    /api/executions/:id/logs            logs only
GET    /api/creators/:id                   creator profile + stats
GET    /api/skills/:id/contributors        contributors
POST   /api/skills/:id/contributors        add contributor (owner only)
POST   /api/admin/kill-switch/:skillId     admin kill-switch toggle
```

Auth in this MVP is a header shim: `x-user-id: <user.id>` identifies the
caller; `User.isAdmin = true` gates admin endpoints. Swap in real OAuth/JWT
before shipping.

---

## Security model

* **Sandbox**: each execution is a fresh container with `network_disabled`,
  `read_only=true`, `tmpfs /tmp`, `cap_drop=ALL`, `no-new-privileges`,
  `pids_limit=64`, mem & CPU caps from the skill's permission manifest
  (clamped to global hard limits in `permissions.ts`).
* **Permission manifest**: `allowedDomains`, `allowedActions`,
  `maxApiCalls`, `maxSpendUsd`, `walletAccess`, `timeoutSec`, `memoryMb`.
  The runner harness enforces these — denied calls produce `BLOCKED` events
  recorded in `apiCalls`/`blocked` and surface to the audit pipeline.
* **Wallet access**: off by default. Inputs containing `walletKey` are
  rejected at the API boundary unless the skill explicitly declares
  `walletAccess: true`.
* **Logs**: hash-chained per execution. `GET /api/executions/:id/logs`
  returns `integrity: true|false`.
* **Anti-fake reviews**: a review requires an `executionId` that the caller
  owns and that finished `SUCCEEDED`.
* **Continuous monitoring**: every 60s the monitor scans the last 24h of
  executions per skill. > 5% `BLOCKED` → auto-disable + kill-switch on.
  Sub-50% success → reassess. Random 5% of certified skills get
  re-audited each tick.

---

## Testing the audit pipeline

After seeding:

```bash
# Find a seeded skill id
curl localhost:4000/api/skills | jq '.items[0].id'
# Run the full pipeline synchronously
curl -X POST localhost:4000/api/skills/<id>/audit | jq
```

You'll see entries for each stage (`STATIC`, `SANDBOX`, `SCENARIO`,
`PERFORMANCE`, `ADVERSARIAL`) and the derived `certification` tier.

---

## What's intentionally out of scope for this MVP

- Real auth / billing — stubbed at the boundary.
- Token incentives, on-chain reputation, decentralized exec nodes — see
  the **stretch features** in the spec; the log hash-chain is a hook for
  L2 anchoring.
- Multi-language runners (only Python today; the harness contract is
  trivial to port).
- Production-grade adversarial corpus — the `VECTORS` list is a starter set.

---

## Branch / dev

Develop on `claude/ai-skills-marketplace-mvp-yRW3p`.
