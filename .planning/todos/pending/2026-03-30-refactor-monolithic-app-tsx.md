---
created: 2026-03-30T21:58:00Z
title: Refactor monolithic App.tsx into modular architecture
area: ui
files:
  - App.tsx (531 lines, 19811 bytes)
  - src/hooks/ (new)
  - src/context/ (new)
---

## Problem

`App.tsx` is a 531-line monolithic component managing 15+ pieces of state, 20+ handler functions, and routing for 12 pages. It handles everything: authentication, CRUD operations, modal management, sync, and state persistence. This violates separation of concerns, makes testing impossible, and will become unmanageable as the API layer is integrated. Each CRUD domain (transactions, events, projects, etc.) has its own set of add/update/delete functions embedded in App.tsx.

## Solution

1. Extract state management into custom hooks:
   - `useTransactions()` — add, update, delete, list
   - `useEvents()` — add, update, delete, list  
   - `useProjects()` — add, update, delete, list
   - `useSocieties()` — crud, budget, members, office bearers
   - `useCalendarEvents()` — crud
   - `useAnnouncements()` — crud
   - `useSync()` — sync state and handlers
2. Create context providers:
   - `AuthContext` — user session management
   - `ModalContext` — centralized modal state (currently 10 booleans in App.tsx)
3. Create a `<Layout>` component with Header + Sidebar + outlet.
4. Slim App.tsx to ~50 lines: providers wrapping Router with Layout.
5. Move each page's data fetching close to the page component (colocation).
