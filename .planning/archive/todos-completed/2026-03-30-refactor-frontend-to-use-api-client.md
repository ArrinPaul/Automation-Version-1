---
created: 2026-03-30T21:58:00Z
title: Refactor frontend from localStorage to API client
area: ui
files:
  - App.tsx:69-129
  - App.tsx:190-340
  - components/Login.tsx:15-43
  - services/googleDriveService.ts
  - src/services/apiClient.ts (new)
  - src/context/AuthContext.tsx (new)
---

## Problem

The entire frontend persists data via `localStorage.setItem('ieee_finance_data', ...)` in `App.tsx:118-128` and loads it on mount (lines 70-107). Login.tsx reads directly from localStorage and compares plaintext passwords (line 36). All CRUD operations (add/update/delete for transactions, events, projects, etc.) mutate in-memory state only. This architecture cannot support multi-user access, real-time collaboration, or data integrity. Per `todo.md` Phase 5, the frontend must be refactored to use `axios` API calls with JWT-based auth.

## Solution

1. Install `axios` and `react-router-dom`.
2. Create `src/services/apiClient.ts`:
   - Axios instance with `baseURL` pointing to Express backend
   - Request interceptor to inject `Authorization: Bearer <token>` from stored JWT
   - Response interceptor for 401 handling (redirect to login) and token refresh
3. Create `src/context/AuthContext.tsx`:
   - Manages JWT storage (secure httpOnly cookie or localStorage with XSS precautions)
   - Provides `login()`, `logout()`, `currentUser`, `isAuthenticated`, `hasRole()` methods
   - Wraps entire app
4. Replace ALL localStorage read/write in `App.tsx` with API calls via apiClient.
5. Replace `Login.tsx` password comparison with `POST /api/auth/login` call.
6. Convert all state mutation functions (addTransaction, updateEvent, etc.) to async API calls.
7. Add loading states and error handling for each API operation.
8. Remove `MOCK_USERS` import and plaintext password logic from frontend entirely.
