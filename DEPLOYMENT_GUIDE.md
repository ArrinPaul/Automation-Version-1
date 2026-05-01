# IEEE Finance Pro Deployment Guide

Date: 2026-04-29

## Purpose

This guide describes how to prepare, verify, and deploy IEEE Finance Pro in a production-like environment.

The current stack is split into:

- `client`: React + Vite frontend
- `server`: Express + Prisma backend
- PostgreSQL database
- Supabase Auth and storage integrations

## What Must Be True Before Deployment

- The server and client builds both pass.
- The server and client test suites both pass.
- The local smoke checks pass.
- The Playwright smoke e2e test passes.
- Environment variables are set for production, not the local placeholders from this workspace.
- PostgreSQL is reachable and migrated.
- Supabase Auth credentials are valid.
- Any required third-party services such as Resend, AWS/S3, and Gemini are configured.

## Local Verification Flow

Use this sequence before every production deployment candidate:

1. Install dependencies in `server/` and `client/`.
2. Run `npm run build` in both projects.
3. Run `npm test -- --run` in both projects.
4. Start the server and client locally.
5. Verify `GET /api/health` returns `{"status":"ok"}`.
6. Run the Playwright smoke test from the client project.

## Production Environment Variables

### Server

- `PORT`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `FRONTEND_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `RESEND_API_KEY`
- `GEMINI_API_KEY`

### Client

- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY` if used by the frontend runtime

## Suggested Deployment Model

### Client

- Build the client with `npm run build`.
- Deploy the generated `dist/` folder to the static host.
- Ensure the host rewrites all routes to `index.html`.

The current Vercel rewrite rule in [client/vercel.json](client/vercel.json) already does this.

### Server

- Build the server with `npm run build`.
- Run the Node process from the compiled `dist/` output.
- Point the server to a production PostgreSQL database.
- Apply Prisma migrations before or during release, depending on the release strategy.

The existing [server/Dockerfile](server/Dockerfile) is a valid starting point for container deployment.

## Docker Deployment Flow

1. Build the server image.
2. Supply production environment variables at runtime.
3. Run Prisma generation and migrations as part of the release process.
4. Start the container and confirm the health endpoint.

Important: the container must not use the local placeholder `.env` values that were added for workspace boot.

## Release Checks

Before marking a release complete:

- Confirm the server health endpoint responds successfully.
- Confirm the frontend loads without runtime errors.
- Confirm role-gated pages redirect as expected.
- Confirm Management-only financial surfaces remain blocked for restricted roles.
- Confirm the production logs do not show new startup errors or unhandled exceptions.

## Rollback Plan

If deployment fails:

- Roll back the client static asset release.
- Roll back the server release container or process version.
- Repoint the application to the previous stable database migration state if the schema changed.
- Re-run the smoke and RBAC checks after rollback.

## Notes

- The repository currently uses local placeholder `.env` files only for workspace verification.
- Those files are not a production configuration source.
- A secrets manager or deployment platform environment store should own all real credentials.
