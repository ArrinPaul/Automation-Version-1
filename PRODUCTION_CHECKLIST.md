# IEEE Finance Pro Production Checklist

Date: 2026-04-29

## Code and Quality

- [ ] `server` build passes.
- [ ] `client` build passes.
- [ ] `server` unit/integration tests pass.
- [ ] `client` unit tests pass.
- [ ] Playwright smoke e2e test passes.
- [ ] No new TypeScript errors.
- [ ] No new ESLint errors.

## Security and RBAC

- [ ] Management-only transaction line-item access is enforced.
- [ ] Society-scoped roles are limited to balance-only financial access.
- [ ] Members cannot access restricted financial endpoints.
- [ ] Auth routes require valid Supabase session and server verification.
- [ ] Production secrets are stored outside the repository.

## Infrastructure

- [ ] PostgreSQL is reachable.
- [ ] Prisma migrations are applied.
- [ ] Supabase Auth is configured for production.
- [ ] Storage and upload credentials are valid.
- [ ] Email delivery credentials are valid.
- [ ] Gemini API credentials are valid if AI features are enabled.

## Deployment

- [ ] Client build artifacts deployed to the static host.
- [ ] SPA rewrite rules are active.
- [ ] Server is running the compiled `dist/` output.
- [ ] Health endpoint returns `ok` after deploy.
- [ ] Error logs are clean after startup.

## Smoke Validation

- [ ] `/api/health` returns `200`.
- [ ] Frontend login page loads.
- [ ] Protected routes redirect unauthenticated users.
- [ ] Management dashboard loads with an authenticated management profile.
- [ ] Restricted financial routes reject unauthorized roles.

## Operational Readiness

- [ ] Backups are enabled.
- [ ] Rollback steps are documented.
- [ ] Monitoring and alerting are enabled.
- [ ] Release owner is assigned.
- [ ] Version tag or release identifier is recorded.
