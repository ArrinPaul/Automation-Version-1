---
created: 2026-03-30T21:58:00Z
title: Deployment readiness and documentation
area: general
files:
  - README.md
  - .env.example (new, both frontend and backend)
  - docker-compose.yml (new, optional)
  - netlify.toml
---

## Problem

Per `todo.md` Phase 7, the project needs deployment preparation. The current `README.md` is minimal (573 bytes). The `netlify.toml` suggests the frontend was deployed to Netlify but the backend has no deployment config. No Docker setup exists for local development. Environment variable documentation is missing. The project needs clear setup instructions for new developers.

## Solution

1. Create `.env.example` for backend: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRY`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `PORT`, `NODE_ENV`.
2. Create `.env.example` for frontend: `VITE_API_BASE_URL`.
3. Update `README.md` with:
   - Project overview and screenshots
   - Prerequisites (Node.js, MongoDB, Google Cloud Service Account)
   - Setup instructions for both frontend and backend
   - Environment variable documentation
   - Available scripts and how to run
   - RBAC role descriptions and default credentials for dev
   - Architecture diagram
4. (Optional) Create `docker-compose.yml` with services: MongoDB, backend (Node), frontend (Vite dev).
5. Update `netlify.toml` or add proxy config for API routing in production.
6. Add Helmet security headers verification in production build.
