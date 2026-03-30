---
created: 2026-03-30T21:58:00Z
title: Remove hardcoded credentials and security secrets
area: auth
files:
  - constants.ts:192-206
  - components/Login.tsx:36
  - services/geminiService.ts
  - index.html
---

## Problem

**Critical security issue.** Plaintext passwords are hardcoded in `constants.ts` lines 192-206 (e.g., `password: 'admin'`, `password: 'office'`). The Login component compares passwords in plaintext (Login.tsx:36). The `geminiService.ts` likely contains or references an API key. The `index.html` may load external scripts (GAPI) with hardcoded client IDs. Per `arch.md` § 6 and `todo.md` Phase 6, zero secrets should exist in the codebase.

## Solution

1. Remove ALL password fields from `MOCK_USERS` in `constants.ts`.
2. Remove plaintext password comparison from `Login.tsx`.
3. Move all API keys (Gemini, Google OAuth) to backend `.env` file.
4. Audit `geminiService.ts` for exposed keys — move to server-side proxy endpoint.
5. Remove `googleClientId` from frontend `SyncSettings` — handle auth server-side.
6. Add `.env` to `.gitignore` (verify it's not tracked).
7. Create `.env.example` files for both frontend and backend with placeholder values.
8. Run `git log` audit to ensure no secrets were committed historically; if so, rotate them.
