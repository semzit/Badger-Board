# @badger/infra

AWS CDK stack for Badger Board. Provisioned with TypeScript.

## What it deploys

- **Redis (ElastiCache)** — cache cluster for the API
- **ECS/Fargate service** — the Express API container behind an ALB
- **S3 + CloudFront** — hosts the built frontend from `apps/frontend/docs`

## Prerequisites

- AWS credentials configured for your target account
- Frontend built locally before deploying (the frontend is uploaded from `apps/frontend/docs`):
  ```bash
  pnpm --filter @badger/frontend build
  ```

## Configuration

Pass values via CDK context flags, or add them to `cdk.json` under `"context"`:

| Context / env                             | Description                                              |
| ----------------------------------------- | -------------------------------------------------------- |
| `-c domain=...`                           | Route 53 hosted zone domain                              |
| `-c subdomain=...`                        | Site subdomain (e.g. `www`)                              |
| `-c adminPassword=...` / `ADMIN_PASSWORD` | Secret for admin endpoints (empty disables admin routes) |

## Commands

```bash
pnpm --filter @badger/infra cdk synth   # emit CloudFormation template
pnpm --filter @badger/infra cdk diff    # compare deployed stack with local
pnpm --filter @badger/infra cdk deploy  # deploy the stack
pnpm --filter @badger/infra typecheck   # tsc type-check
```
