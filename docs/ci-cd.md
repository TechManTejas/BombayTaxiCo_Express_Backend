# CI/CD Setup

This repository now has two GitHub Actions workflows:

- `CI` (`.github/workflows/ci.yml`)
- `CD` (`.github/workflows/cd.yml`)

## CI workflow

Triggers:

- push to `main`
- pull request targeting `main`

Steps:

- `npm ci`
- smoke test suites (selected stable F2P/P2P tests)
- advisory typecheck: `npm run build` (non-blocking)

## CD workflow

Triggers:

- push to `main`
- push tags matching `v*`
- manual run (`workflow_dispatch`)

Stages:

1. Build and push Docker image to GHCR (`ghcr.io/<owner>/<repo>`)
2. Optional SSH-based deploy for `main` branch

### Required repo secrets for SSH deploy

- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_USER`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_APP_PATH` (path on target server where `docker compose up -d` is run)

If SSH secrets are not provided, CD still publishes the image and skips server deployment.

## Important

This workflow expects a `Dockerfile` at repository root. If missing, add one before enabling CD.
