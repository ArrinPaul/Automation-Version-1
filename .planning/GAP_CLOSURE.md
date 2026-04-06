# Gap Closure — Audit Fix Tracker

## Phase A — Critical (App Actually Works)
- [x] **A1**: Refactor App.tsx — uses AuthContext (`useAuth()`) instead of local currentUser
- [x] **A2**: Replace ALL localStorage CRUD with API calls (all handlers use `services/api.ts`)
- [x] **A3**: Fix Login.tsx ↔ App.tsx integration (Login uses `useAuth()`, no `onLogin` prop)
- [x] **A4**: Remove MOCK_USERS plaintext passwords from constants.ts (deleted entirely)
- [x] **A5**: Remove client-side Google Drive imports from App.tsx (replaced with server placeholder)
- [x] **A6**: Update Header.tsx to display all 4 roles properly (string-based role display)

## Phase B — Security
- [x] **B1**: Strip password field from User type (removed from `types.ts`)
- [x] **B2**: Ensure server/.env in root .gitignore (confirmed line 4)
- [x] **B3**: Add CORS production domain config (uses `FRONTEND_URL` env var, added to .env.example)

## Phase C — Routing & Structure
- [x] **C1**: Define React Router `<Routes>` for all pages (12 routes in App.tsx)
- [x] **C2**: Add ProtectedRoute wrapper with role checking (with `allowedRoles` prop)
- [x] **C3**: Update navigation to use useNavigate (setActiveTab → navigate, URL-derived activeTab)

## Cleanup (additional)
- [x] Delete dead `services/googleDriveService.ts`
- [x] Delete dead `components/Sidebar.tsx`
- [x] Remove mock data arrays from constants.ts
- [x] Fix tsconfig.json (exclude server/, add vite/client types)
- [x] Archive 10 completed todos
- [x] Frontend: 0 TS errors
- [x] Backend: 0 TS errors

## Status: ✅ ALL GAPS CLOSED
