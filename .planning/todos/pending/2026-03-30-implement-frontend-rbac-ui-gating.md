---
created: 2026-03-30T21:58:00Z
title: Implement frontend RBAC UI gating for 4-role system
area: ui
files:
  - types.ts:2-5
  - App.tsx:433-438
  - components/Header.tsx
  - components/Sidebar.tsx
  - components/Dashboard.tsx
  - components/TransactionsPage.tsx
  - components/UserManagementPage.tsx
---

## Problem

The current RBAC is binary — the frontend only distinguishes `ADMIN` and `OFFICE_BEARER` (types.ts:2-5). The only UI gating is `currentUser.role === UserRole.ADMIN` to show the Users tab (App.tsx:433). Per `arch.md` § 4, there must be 4 roles with distinct UI behaviors:
- **Super Admin**: Sees everything, manages all societies and users.
- **SB Treasurer**: Financial focus — views/modifies all transactions, approves budgets, generates branch-wide reports.
- **Society Admin**: Manages their specific society only — events, members, transactions scoped to their unit.
- **Viewer**: Read-only dashboards and reports for assigned society.

The Sidebar, Header, modals, and all pages need conditional rendering based on the expanded role system.

## Solution

1. Extend `UserRole` enum: `SUPER_ADMIN`, `SB_TREASURER`, `SOCIETY_ADMIN`, `VIEWER`.
2. Create a `<ProtectedRoute>` or `<RoleGate role={[...]}>{children}</RoleGate>` component.
3. Update navigation (Header.tsx, Sidebar.tsx) to show/hide tabs per role.
4. Hide create/edit/delete buttons in TransactionsPage, EventsPage, ProjectsPage for Viewers.
5. Show "Approve" action on transactions only for SB Treasurer / Super Admin.
6. Scope Society Admin views to their assigned `societyId` only.
7. Disable UserManagementPage for non-Super Admin.
8. Add visual role badges to the Header (e.g., "SB Treasurer" chip).
