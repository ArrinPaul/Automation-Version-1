# Gap Closure — Audit Fix Tracker

## Phase A — Critical (App Actually Works)
- [ ] **A1**: Refactor App.tsx — use AuthContext instead of local currentUser
- [ ] **A2**: Replace ALL localStorage CRUD with API calls  
- [ ] **A3**: Fix Login.tsx ↔ App.tsx integration (remove onLogin prop)
- [ ] **A4**: Remove MOCK_USERS plaintext passwords from constants.ts
- [ ] **A5**: Remove client-side Google Drive imports from App.tsx
- [ ] **A6**: Update Header.tsx to display all 4 roles properly

## Phase B — Security
- [ ] **B1**: Strip password field from MOCK_USERS entirely
- [ ] **B2**: Ensure server/.env in root .gitignore
- [ ] **B3**: Add CORS production domain config

## Phase C — Routing & Structure
- [ ] **C1**: Define React Router `<Routes>` for all pages
- [ ] **C2**: Add ProtectedRoute wrapper with role checkingj
- [ ] **C3**: Update navigation to use NavLink/useNavigate

## Session Log
- Starting gap closure from audit_report.md
