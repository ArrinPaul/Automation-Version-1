---
created: 2026-03-30T21:58:00Z
title: Build Societies CRUD REST API endpoints
area: api
files:
  - server/src/routes/societyRoutes.ts
  - server/src/controllers/societyController.ts
  - constants.ts:21-77
  - components/SocietiesPage.tsx
---

## Problem

Society data (40+ IEEE units including societies, affinity groups, and councils) is currently hardcoded in `constants.ts` as static arrays (`IEEE_SOCIETIES`, `AFFINITY_GROUPS`, `IEEE_COUNCILS`). There are no API endpoints to create, read, update, or delete societies. Budget updates happen directly in frontend state via `updateBudget()` in `App.tsx:225-233`. Office bearer and member management is also frontend-only.

## Solution

1. Create REST endpoints:
   - `GET /api/societies` — list all (filtered by role/society assignment)
   - `GET /api/societies/:id` — single society with populated office bearers and members
   - `POST /api/societies` — create (Super Admin only)
   - `PUT /api/societies/:id` — update budget, name, etc. (Super Admin, SB Treasurer)
   - `PUT /api/societies/:id/office-bearers` — manage team (Society Admin+)
   - `PUT /api/societies/:id/members` — manage members (Society Admin+)
   - `DELETE /api/societies/:id` — archive (Super Admin only)
2. Protect all routes with authMiddleware + roleMiddleware.
3. Seed the 40+ units from `constants.ts` into MongoDB on first run.
