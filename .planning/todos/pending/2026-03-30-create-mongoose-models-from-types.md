---
created: 2026-03-30T21:58:00Z
title: Create Mongoose models from existing TypeScript types
area: database
files:
  - types.ts
  - server/src/models/User.ts
  - server/src/models/Society.ts
  - server/src/models/Transaction.ts
  - server/src/models/Event.ts
  - server/src/models/Project.ts
  - server/src/models/CalendarEvent.ts
  - server/src/models/Announcement.ts
---

## Problem

All data types exist only as frontend TypeScript interfaces in `types.ts`. Per `arch.md` § 5, six MongoDB collections are needed: Users, Societies, Transactions, Events, Projects, Announcements. The current `types.ts` has additional entities (CalendarEvent, Member, OfficeBearer) that also need Mongoose schema representation. The `User` model must be extended from 2 roles (ADMIN, OFFICE_BEARER) to 4 roles (Super Admin, SB Treasurer, Society Admin, Viewer) per `arch.md` § 4.

## Solution

1. Map each interface in `types.ts` to a Mongoose schema.
2. Extend `UserRole` enum to include `SUPER_ADMIN`, `SB_TREASURER`, `SOCIETY_ADMIN`, `VIEWER`.
3. Add password hashing hooks (pre-save with bcryptjs) to User model.
4. Embed `OfficeBearer[]` and `Member[]` as sub-documents in Society schema.
5. Add `status` field (Pending/Approved) and `receiptUrl` to Transaction schema per `arch.md`.
6. Add indexes: `societyId` on Transactions, Events, Projects; `email` unique on Users.
7. Create seed script to load `constants.ts` mock data into MongoDB for development.
