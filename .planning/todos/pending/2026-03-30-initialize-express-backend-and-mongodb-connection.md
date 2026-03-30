---
created: 2026-03-30T21:58:00Z
title: Initialize Express backend and MongoDB connection
area: api
files:
  - server/ (new directory)
  - server/package.json
  - server/src/index.ts
  - server/src/config/db.ts
---

## Problem

The application is currently a client-only React SPA using `localStorage` for all data persistence. Per `arch.md` Phase 1, a Node.js/Express backend must be bootstrapped with MongoDB (Mongoose ODM) connectivity. No `/server` directory exists yet. This is the foundational prerequisite for all subsequent backend work.

## Solution

1. Create `/server` directory with `npm init`.
2. Install core deps: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `morgan`, `express-rate-limit`.
3. Setup TypeScript config for backend.
4. Create `src/config/db.ts` with MongoDB Atlas connection using Mongoose.
5. Create `src/index.ts` Express entry point with middleware chain (Helmet, CORS, Morgan, Rate Limiting).
6. Implement global error-handling middleware.
7. Add `.env.example` with `MONGO_URI`, `PORT`, `NODE_ENV` placeholders.
8. Verify connection to a test MongoDB instance.
