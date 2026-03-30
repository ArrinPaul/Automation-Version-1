---
created: 2026-03-30T21:58:00Z
title: End-to-end RBAC testing and validation
area: testing
files:
  - server/src/middleware/authMiddleware.ts
  - server/src/middleware/roleMiddleware.ts
  - server/tests/ (new)
---

## Problem

Per `todo.md` Phase 6, the 4-role RBAC system needs cross-testing to verify authorization boundaries. Specifically: Viewers must not create/edit/delete anything. Society Admins must only access their assigned society. SB Treasurers must not manage users. All permission escalation paths must be blocked. There are currently zero tests in the project.

## Solution

1. Setup test framework (Jest + Supertest for API tests).
2. Create test suites:
   - **Auth tests**: Register, login, invalid credentials, token expiry, refresh.
   - **RBAC matrix tests**: For each of the 4 roles, test every endpoint with both allowed and denied scenarios.
   - **Society scoping tests**: Verify Society Admin cannot access other societies' data.
   - **Approval workflow tests**: Only SB Treasurer/Super Admin can approve transactions.
3. Create a test database config (separate MongoDB instance or in-memory via `mongodb-memory-server`).
4. Add test runner to `package.json` scripts.
5. Validate Google Drive file upload integration (mock or sandbox Drive folder).
6. Test with large datasets (~1000 transactions) for scalability per `todo.md` Phase 6.
