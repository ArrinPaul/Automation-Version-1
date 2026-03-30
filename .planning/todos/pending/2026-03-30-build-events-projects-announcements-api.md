---
created: 2026-03-30T21:58:00Z
title: Build Events, Projects, and Announcements API endpoints
area: api
files:
  - server/src/routes/eventRoutes.ts
  - server/src/routes/projectRoutes.ts
  - server/src/routes/announcementRoutes.ts
  - server/src/controllers/eventController.ts
  - server/src/controllers/projectController.ts
  - server/src/controllers/announcementController.ts
  - components/EventsPage.tsx
  - components/ProjectsPage.tsx
  - components/AnnouncementsPage.tsx
---

## Problem

Events (`EventReport`), Projects, CalendarEvents, and Announcements are all managed in frontend state only. Per `arch.md` § 5, these need dedicated MongoDB collections and CRUD endpoints. Events have complex sub-structures (speakers, images, multi-field reports) that need schema design. Announcements need role-based broadcast targeting (`targetAudience: 'ALL' | 'LEADERSHIP' | 'SOCIETY'`). The `reportUrl` field in Events schema (arch.md) for Google Drive generated PDF reports is missing.

## Solution

1. **Events API**: Full CRUD with image upload support, speaker sub-documents, and `reportUrl` for generated PDF links.
2. **Projects API**: CRUD with status transitions (PROPOSED → ONGOING → COMPLETED/CANCELLED) and role-guarded updates.
3. **Calendar Events API**: CRUD with status management (PROPOSED/CONFIRMED/COMPLETED/CANCELLED).
4. **Announcements API**: Create (leadership+), List (filtered by targetAudience and user role), Delete (creator or admin).
5. All endpoints protected by auth + role middleware.
6. Add query filters: by society, date range, status.
