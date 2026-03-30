---
created: 2026-03-30T21:58:00Z
title: Build Transactions API with approval workflow
area: api
files:
  - server/src/routes/transactionRoutes.ts
  - server/src/controllers/transactionController.ts
  - App.tsx:190-223
  - components/TransactionsPage.tsx
  - components/TransactionModal.tsx
---

## Problem

Transactions are currently stored in `localStorage` via `App.tsx` state. There is no approval workflow — any logged-in user can add/edit/delete transactions without authorization checks. The `arch.md` specifies a `status` field (Pending/Approved) and a `receiptUrl` (Google Drive link) per transaction that don't exist yet. Balance calculation happens entirely in-memory (`calculateBalances` in App.tsx:181-188) and would be lost on browser clear.

## Solution

1. Create REST endpoints:
   - `POST /api/transactions` — create with society-based validation (user can only create for their assigned society; admins for any)
   - `GET /api/transactions` — filtered by role/society; Viewers see read-only
   - `GET /api/transactions/:id` — single transaction detail
   - `PUT /api/transactions/:id` — update (creator or admin only)
   - `PATCH /api/transactions/:id/approve` — approval endpoint (SB Treasurer/Super Admin only)
   - `DELETE /api/transactions/:id` — soft-delete (admin only)
2. Add `status: 'PENDING' | 'APPROVED'` field with default `PENDING`.
3. Add `receiptUrl` field for Google Drive receipt links.
4. Recalculate society balance on transaction create/update/delete via Mongoose middleware.
5. Add pagination and date-range filtering.
