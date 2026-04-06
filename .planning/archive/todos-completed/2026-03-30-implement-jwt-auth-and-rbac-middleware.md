---
created: 2026-03-30T21:58:00Z
title: Implement JWT authentication and RBAC middleware
area: auth
files:
  - server/src/middleware/authMiddleware.ts
  - server/src/middleware/roleMiddleware.ts
  - server/src/routes/authRoutes.ts
  - server/src/controllers/authController.ts
  - types.ts:2-5
  - components/Login.tsx
---

## Problem

Authentication is entirely client-side — `Login.tsx` checks passwords by comparing plaintext strings against `MOCK_USERS` from `constants.ts` (line 36: `user.password === password`). Passwords are stored in plain text. There is no JWT, no session management, no server-side validation. The RBAC system only has 2 roles (ADMIN, OFFICE_BEARER) but `arch.md` § 4 requires 4 roles with distinct permission matrices. This is a critical security gap.

## Solution

1. Install `jsonwebtoken`, `bcryptjs`, `express-validator` in backend.
2. Create `POST /api/auth/register` (Super Admin only — protected by roleMiddleware).
3. Create `POST /api/auth/login` — validates credentials with bcrypt, returns signed JWT with `userId`, `role`, `societyId`.
4. Build `authMiddleware.ts`: verifies JWT from `Authorization: Bearer <token>`, attaches decoded user to `req.user`.
5. Build `roleMiddleware(['SUPER_ADMIN', 'SB_TREASURER'])`: checks `req.user.role` against allowed roles.
6. Add JWT refresh token rotation for session persistence.
7. Set JWT_SECRET and JWT_EXPIRY in `.env`.
8. Add brute-force protection (rate limiting on auth endpoints).
