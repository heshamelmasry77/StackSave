# StackSave: working rules

These rules apply to everyone working on this repo: humans and AI agents.

## Branches and releases

- `main` is production. Every push to `main` auto-deploys to Railway.
- **Never commit or push directly to `main`.** GitHub branch protection enforces this.
- Start every change on a new branch from the latest `main`:
  ```bash
  git fetch origin
  git worktree add -b feature/<short-name> ../StackSave-<short-name> origin/main
  ```
  Branch prefixes: `feature/`, `fix/`, `chore/`, `docs/`.
- Open a pull request into `main` for every change. **A PR into `main` is a release.**
- Merge only after:
  1. CI (`npm run check`) is green.
  2. The PR author has reviewed their own diff, and any review comments are resolved.
  3. The project owner has explicitly approved the release.
- Squash-merge, then confirm the Railway deploy is healthy: `curl https://<app-url>/api/health`.

## Before opening a PR

```bash
npm run check   # typecheck + tests + production build
```

- Add or update tests for behaviour changes.
- Describe in the PR **what** changed, **why**, and **how it was verified**.
- Never commit secrets. Local secrets go in `.env` (git-ignored). Production secrets go in Railway variables.

## Architecture

One Node.js app serves the API and the React frontend from the same origin. See `README.md`.

- `client/`: React (Vite root). `server/src/`: Express. `shared/`: code used by both, imported as `@shared/...`.
- New API routes go in `server/src/routes/` and are mounted in `server/src/app.ts`.
- Authentication is passwordless: Google sign-in or an emailed magic link. Do not add password login.
