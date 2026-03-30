---
created: 2026-03-30T21:58:00Z
title: Add React Router with protected page routing
area: ui
files:
  - App.tsx:364-438
  - index.tsx
  - components/Sidebar.tsx
---

## Problem

Navigation is currently tab-based via `useState('dashboard')` in App.tsx:31, with all pages rendered conditionally in a single component tree (App.tsx:364-438). There are no URL routes, no browser back/forward support, no deep-linking, and no route-level protection. This is not scalable for the MERN architecture and makes bookmarking or sharing specific pages impossible.

## Solution

1. Install `react-router-dom`.
2. Wrap app in `<BrowserRouter>` in `index.tsx`.
3. Create route definitions:
   - `/login` → Login page
   - `/dashboard` → Dashboard (default)
   - `/transactions` → TransactionsPage
   - `/societies` → SocietiesPage (+ `/societies/:id` for detail)
   - `/events` → EventsPage
   - `/projects` → ProjectsPage
   - `/calendar` → CalendarPage
   - `/announcements` → AnnouncementsPage
   - `/reports` → ReportsPage
   - `/repository` → RepositoryPage
   - `/sync` → BackupPage
   - `/admin/users` → UserManagementPage (Super Admin only)
4. Create `<ProtectedRoute>` wrapper that checks auth + role before rendering.
5. Redirect unauthenticated users to `/login`.
6. Update Sidebar/Header to use `<NavLink>` instead of `setActiveTab`.
7. Remove tab-based state management from App.tsx.
