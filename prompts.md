# 🤖 Master Prompt Guide: IEEE Finance Pro v3.0

This document contains individual, high-fidelity prompts for executing each phase of the project using **Gemini CLI** and **GitHub Copilot**. 

---

## 🔍 Phase 0: Deep Codebase Analysis
**Goal**: Establish total context and identify gaps in the v3.0 skeleton.

> **Prompt**:
> "Act as a Senior Software Architect. Conduct a deep analysis of the current `/client` and `/server` directories. 
> 1. Map all existing Prisma models in `schema.prisma` to their corresponding controllers and repositories. Identify any 'orphaned' models.
> 2. Compare the current route definitions in `client/src/App.tsx` against the 'MISSING_FEATURES_SPECIFICATION.md' and list exactly what is missing.
> 3. Analyze the current `verifyToken.ts` middleware and confirm if it correctly extracts `role` and `societyId` from Supabase user metadata for all 4 roles: MANAGEMENT, FACULTY_ADVISOR, SOCIETY_OB, and MEMBER.
> 4. Verify that the server's `errorHandler` and `logger` are correctly integrated into all existing routes.
> Provide a 'Gap Analysis Report' before we proceed."

### **Phase 0 Checklist:**
- [ ] Orphaned Prisma models identified.
- [ ] Missing frontend routes listed.
- [ ] RBAC metadata extraction verified.
- [ ] Error/Logger integration confirmed.

---

## 🏗️ Phase 1: Authentication & RBAC Foundation
**Goal**: Secure the identity layer and session management.

> **Prompt**:
> "Execute Phase 1: Authentication & RBAC. 
> 1. Complete the `useSupabaseAuth` hook in `client/src/context/AuthContext.tsx`. It must handle session persistence, profile fetching from PostgreSQL via `apiClient.get('/auth/me')`, and role-based state.
> 2. Implement the `ProtectedRoute` component to handle role-based redirection using the 4-tier mapping (e.g., only MANAGEMENT can access `/transactions`).
> 3. Update the `login` controller to ensure that upon successful Supabase sign-in, the user's PostgreSQL profile is returned and synced.
> 4. Ensure all auth-related errors are handled by the `AppError` class and logged via the structured `logger`."

### **Phase 1 Checklist:**
- [ ] `useSupabaseAuth` hook functional.
- [ ] Role-based `ProtectedRoute` verified.
- [ ] Supabase session correctly maps to Prisma `User` profile.
- [ ] Auth failures logged with `pino`.

---

## 🏗️ Phase 2: Core Backend API
**Goal**: Build the data isolation and transaction logic.

> **Prompt**:
> "Execute Phase 2: Core Backend API. 
> 1. Implement the `restrictTransactions` middleware. This middleware must check the user's role: if they are `FACULTY_ADVISOR` or `SOCIETY_OB`, they are BLOCKED from viewing individual transaction line-items (403 Forbidden). 
> 2. Create a `getBalance` endpoint in `transactionController.ts` that returns only a single `Prisma.Decimal` value for these roles.
> 3. Finalize all CRUD endpoints for Societies, Events, and Projects. Ensure every write operation is wrapped in a Prisma Transaction to maintain ACID integrity.
> 4. Apply strict Zod validation to all incoming request bodies, specifically ensuring `amount` values are handled as positive decimals and dates are validated."

### **Phase 2 Checklist:**
- [ ] Financial isolation (Line-items vs Balance) enforced.
- [ ] All write operations use Prisma Transactions.
- [ ] Zod validation applied to all POST/PUT routes.
- [ ] 100% of API endpoints return structured JSON.

---

## 🎨 Phase 3: Frontend Core & Shell
**Goal**: Implement the "Technical Brutalism" shell and Persona Aliases.

> **Prompt**:
> "Execute Phase 3: Frontend Core & Shell. 
> 1. Apply the 'Technical Brutalism' design system: Set background to Obsidian (#0A0A0C), use `Syncopate` for display headers and `JetBrains Mono` for all data points and labels.
> 2. Implement 'Persona Aliases': In the Header/Sidebar, if a user is `MANAGEMENT`, dynamically change their display title to 'Branch Counselor', 'Dean', or 'Director' based on their email suffix (as defined in `MISSING_FEATURES_SPECIFICATION.md`).
> 3. Build the responsive `Sidebar` with role-based link filtering. Ensure 0.5px hairline borders and monochromatic styling.
> 4. Add the 'Credential UI Tips' to the user management section, explaining the `{societyid}@ieee.org` email convention."

### **Phase 3 Checklist:**
- [ ] `Syncopate` and `JetBrains Mono` fonts active.
- [ ] Persona Aliases (Dean, Counselor, etc.) functional.
- [ ] Sidebar links filtered by `profile.role`.
- [ ] UI hairline borders (0.5px) and dot-grid backgrounds applied.

---

## 🎨 Phase 4: Feature Pages Implementation
**Goal**: Achieve parity for Dashboard, Societies, and Calendar.

> **Prompt**:
> "Execute Phase 4: Feature Pages.
> 1. **Dashboard**: Build the 4 KPI cards and the Monthly Flow Area Chart using `Recharts`. Ensure data is scoped via TanStack Query.
> 2. **Societies**: Implement the Society Card grid. Add the 'Compliance Badge' logic: Show Amber 'Action Required' if `logoUrl` or `advisorSigUrl` is missing.
> 3. **Communication Hub**: Build the timeline-style Announcement feed. Implement the 'Mailto Assembler' button logic to scrape member emails for BCC broadcasts.
> 4. **Calendar**: Build the monthly grid view. Implement color-coded badges for Proposed (Amber), Confirmed (Green), Completed (Blue), and Cancelled (Red)."

### **Phase 4 Checklist:**
- [ ] Dashboard KPI cards and Charts functional.
- [ ] Compliance badges (Amber/Green) active.
- [ ] Mailto Assembler generates correct BCC string.
- [ ] Calendar grid and status badges verified.

---

## 📄 Phase 5: AI & Documentation Engines
**Goal**: Finalize Gemini 1.5 Flash and Report Generation.

> **Prompt**:
> "Execute Phase 5: AI & Reporting.
> 1. **AI Auditor**: Wire the `gemini-1.5-flash` model into the Dashboard. Ensure it generates a 200-word financial analysis based on the society's current `balance` and `transactions`.
> 2. **jsPDF Engine**: Implement the professional Event Report PDF. It must include: institutional header, multi-speaker table, and a photo gallery from S3/Supabase.
> 3. **Financial CSV**: Build the server-side CSV generator. Ensure it includes the 'Confidential' preamble and institutional metadata in the first 3 rows.
> 4. **Print Styles**: Implement `@media print` CSS for the 'Quarterly Board Statement' to ensure professional physical copies."

### **Phase 5 Checklist:**
- [ ] Gemini 1.5 Flash insights live.
- [ ] Branded PDF exports verified (Headings/Gallery).
- [ ] CSV Preamble (Confidential/Institutional) present.
- [ ] Print view layout verified.

---

## ☁️ Phase 6: Testing & System Hardening
**Goal**: Finalize security, snapshots, and QA.

> **Prompt**:
> "Execute Phase 6: Testing & Hardening.
> 1. Implement `snapshotService.ts` to export the PostgreSQL database as a validated JSON file for portable backups.
> 2. Write integration tests for every role (MANAGEMENT, FACULTY_ADVISOR, SOCIETY_OB, MEMBER) trying to access the `/transactions` endpoint.
> 3. Conduct a security audit of Supabase Storage bucket policies: institution (read: auth, write: management), transactions (read/write: management only).
> 4. Verify that all currency operations use `Decimal` and there are no `any` casts in the financial logic."

### **Phase 6 Checklist:**
- [ ] JSON State Snapshot tool verified.
- [ ] RBAC isolation integration tests passing.
- [ ] Storage bucket policies verified.
- [ ] 0 `any` types in financial code.

---

## 🚀 Deployment Guide

### 1. Supabase (Database & Storage)
1. Create a new Supabase project.
2. In **Settings > Database**, copy the Connection String (Transaction mode).
3. In **Settings > API**, copy the `Project URL` and `service_role` key.
4. Run `npx prisma migrate deploy` in `/server`.

### 2. Railway (Backend)
1. Create a new Railway service and link your repository.
2. Set root directory to `/server`.
3. Add Variables: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `FRONTEND_URL`.
4. Build command: `npm run build`, Start command: `npm start`.

### 3. Vercel (Frontend)
1. Create a new project on Vercel and link your repository.
2. Set root directory to `/client`.
3. Add Variables: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Build command: `npm run build`.

---

## ✅ Final Master Checklist (Pre-Launch)
- [ ] **Data Integrity**: All money uses `Prisma.Decimal`.
- [ ] **Isolation**: `SOCIETY_OB` cannot see transaction line-items.
- [ ] **Branding**: University master logo appears in all PDF headers.
- [ ] **AI**: Gemini model name is correctly set to `gemini-1.5-flash`.
- [ ] **Communication**: Mailto BCC logic verified with 50+ test emails.
- [ ] **Backups**: JSON snapshot tool generates valid, restorable files.
- [ ] **Performance**: Lighthouse score for Accessibility & SEO is 90+.
- [ ] **Security**: No secrets or API keys are present in the frontend bundle.

---

## 📊 Phase 0: Gap Analysis Report

### **0. Spec File Availability Check**

- The prompt references `MISSING_FEATURES_SPECIFICATION.md`, but this file does not exist in the repository.
- Route comparison is based on `FEATURE_SPEC.md` (Phase 0.1 Route Implementation Matrix).

---

### **1. Prisma Model to Controller/Repository Mapping (Post-Fix)**

#### Models Analyzed: 11 Total

| Model | Repository | Controller | Status |
|---|---|---|---|
| `User` | ✅ `userRepository.ts` | ✅ `authController.ts` | ✅ Mapped |
| `Society` | ✅ `societyRepository.ts` | ✅ `societyController.ts` | ✅ Mapped |
| `Transaction` | ✅ `transactionRepository.ts` | ✅ `transactionController.ts` | ✅ Mapped |
| `Event` | ✅ `eventRepository.ts` | ✅ `eventController.ts` | ✅ Mapped |
| `Speaker` | ✅ `speakerRepository.ts` | ✅ `speakerController.ts` | ✅ Mapped |
| `Project` | ✅ `projectRepository.ts` | ✅ `projectController.ts` | ✅ Mapped |
| `CalendarEvent` | ✅ `calendarEventRepository.ts` | ✅ `calendarEventController.ts` | ✅ Mapped |
| `Announcement` | ✅ `announcementRepository.ts` | ✅ `announcementController.ts` | ✅ Mapped |
| `OfficeBearer` | ✅ `officeBearerRepository.ts` | ✅ `officeBearerController.ts` | ✅ Mapped |
| `Member` | ✅ `memberRepository.ts` | ✅ `memberController.ts` | ✅ Mapped |
| `AuditLog` | ✅ `auditLogRepository.ts` | ✅ `auditController.ts` (`/audit/logs`) | ✅ Mapped |

#### Status:
- **Orphaned models:** None.
- **Audit write path:** Added in `authController.ts` for login/register/role-change events.

---

### **2. Frontend Route Gap Analysis (`App.tsx` vs `FEATURE_SPEC.md`)**

#### Implemented in `client/src/App.tsx` (Post-Fix):
`/`, `/login`, `/transactions`, `/societies`, `/events`, `/calendar`, `/projects`, `/announcements`, `/communications`, `/admin/users`, `/admin/registry`, `/reports/financial`, `/reports/quarterly-print`

#### Missing from spec matrix:
- None.

---

### **3. `verifyToken.ts` RBAC Metadata Extraction Validation**

#### Verified behavior:
- Reads `role` and `societyId` from Supabase `user_metadata`.
- Validates role via `isRole(...)` guard and falls back to PostgreSQL profile.
- Sets `req.user = { id, email, role, societyId }` for downstream RBAC.

| Role | Metadata Parse | DB Fallback | Result |
|---|---|---|---|
| `MANAGEMENT` | ✅ | ✅ | ✅ Correct |
| `FACULTY_ADVISOR` | ✅ | ✅ | ✅ Correct |
| `SOCIETY_OB` | ✅ | ✅ | ✅ Correct |
| `MEMBER` | ✅ | ✅ | ✅ Correct |

---

### **4. `errorHandler` and `logger` Integration Verification**

#### Confirmed:
- `server/src/index.ts` uses `morgan` → `logger.info(...)` and mounts `app.use(errorHandler)` globally.
- Controllers route errors through `next(new AppError(...))`.
- `uploadController.ts` uses `AppError` for validation and failure paths.

#### Deferred to next phase (by instruction):
- **Global structured-logging standardization** across all controllers (uniform `actorId/resource/action/status`) is deferred, because this is directly aligned with the next-phase auth/logging hardening prompt.

---

## **Phase 0 Completion Checklist - Updated**
- [x] Orphaned Prisma models identified.
- [x] Missing frontend routes listed.
- [x] RBAC metadata extraction verified.
- [x] Error/Logger integration confirmed.

---

### **Phase 0 Remediation Done Now**
1. Added `userRepository.ts` and refactored `authController.ts` to use repository abstraction.
2. Added `speaker` API stack: repository + controller + `/api/speakers` routes.
3. Added `calendarEvent` API stack: repository + controller + `/api/calendar-events` routes.
4. Added `auditLogRepository.ts`, audit write-path in auth flows, and `/api/audit/logs` endpoint.
5. Added missing frontend routes/pages for calendar, communications, admin, and reports.
