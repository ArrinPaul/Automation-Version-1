# 🗺️ MASTER_PLAN.md: IEEE Finance Pro v3.0 (The Engine)

This is your primary executable guide. It contains the Roadmap, Todo List, and individual Prompts for implementation.

---

## 🏗️ Phase 3: Infrastructure & Auth (CURRENT)

### Task 3.1: Identity & Session Hook
- [ ] Complete the `useSupabaseAuth` hook in `client/src/context/AuthContext.tsx`.
- [ ] Wire `/api/auth/me` to fetch the Prisma `User` profile.
> **Copy/Paste Prompt**:
> "Execute Phase 3, Task 1: Identity Hook. 
> 1. In `client/src/context/AuthContext.tsx`, complete the `useAuth` hook to sync the Supabase `user.id` with the Prisma `User` profile. 
> 2. Implement a `fetchProfile` function that calls the `/api/auth/me` endpoint. 
> 3. Update `ProtectedRoute.tsx` to use the `profile.role` for access control. 
> 4. Ensure the loading state displays 'BOOTING_SYSTEM...' in `JetBrains Mono` font during session recovery."

### Task 3.2: Technical Brutalism Shell
- [ ] Apply fonts (`Syncopate`, `JetBrains Mono`) and "Obsidian" colors.
- [ ] Implement Persona Aliases (Dean, Counselor, etc.).
> **Copy/Paste Prompt**:
> "Execute Phase 3, Task 2: Brutalist Shell. 
> 1. Update `client/src/components/layout/Sidebar.tsx` and `Header.tsx`. 
> 2. Apply styling from `PROJECT_STANDARDS.md`: Obsidian background (#0A0A0C), 0.5px hairline borders, and `Syncopate` font for headers. 
> 3. Implement **Persona Aliases**: If `profile.role === 'MANAGEMENT'`, map specific emails (e.g., dean@, director@) to their professional titles ('Dean', 'Director') in the UI."

---

## 🎨 Phase 4: Feature Parity & UI (Part 1)

### Task 4.1: Financial Isolation Middleware
- [ ] Block transaction list for Faculty Advisor/OB.
- [ ] Create balance-only endpoint.
> **Copy/Paste Prompt**:
> "Execute Phase 4, Task 1: Financial Isolation. 
> 1. In `server/src/middleware/`, create `restrictTransactions.ts`. 
> 2. This middleware must return a `403 Forbidden` for transaction lists if the user is `FACULTY_ADVISOR` or `SOCIETY_OB`. 
> 3. Create a new `GET /api/societies/:id/balance` endpoint that returns ONLY the `Decimal` balance value."

### Task 4.2: Dashboard KPI Grid & Charts
- [ ] Implement 4-card KPI row and Monthly Area Chart.
> **Copy/Paste Prompt**:
> "Execute Phase 4, Task 2: KPI Dashboard. 
> 1. In `client/src/features/Dashboard.tsx`, implement the 4-card KPI grid: Total Balance, Income, Expenditure, and Utilization %. 
> 2. Use `Recharts` to build the **Monthly Financial Flow** Area Chart (Income vs Expense vs Balance)."

### Task 4.3: Communication & Mailto Assembler
- [ ] Build Announcement Feed + BCC broadcast logic.
> **Copy/Paste Prompt**:
> "Execute Phase 4, Task 3: Communication Hub. 
> 1. Build `AnnouncementsPage.tsx` with a vertical timeline layout. 
> 2. Implement the **Mailto Assembler**: Add a button to announcements that builds a BCC string from member emails via the backend."

---

## 📄 Phase 5: Documentation Engines (Part 2)

### Task 5.1: AI Auditor Integration
- [ ] Wire `gemini-1.5-flash` into Dashboard panels.
> **Copy/Paste Prompt**:
> "Execute Phase 5, Task 1: AI Auditor. 
> 1. Wire the `gemini-1.5-flash` model into the Dashboard. 
> 2. Ensure it generates a 200-word financial analysis based on the current `balance` and `transactions` fetched via Prisma."

### Task 5.2: PDF & CSV Automation
- [ ] Migrated branded jsPDF engine and CSV preambles.
> **Copy/Paste Prompt**:
> "Execute Phase 5, Task 2: PDF Automation. 
> 1. In `client/src/services/pdfService.ts`, migrate the `jsPDF` engine. 
> 2. Include: Grey institutional header, Speaker Table, and S3 Photo Gallery. 
> 3. Implement a backend CSV generator with the 3-row institutional preamble."

---

## ☁️ Phase 6: System Resilience

### Task 6.1: Cloud Sync & Snapshot
- [ ] Implement JSON export tool and functional Google Drive v3 sync.
> **Copy/Paste Prompt**:
> "Execute Phase 6, Task 1: Cloud Vault. 
> 1. Implement `snapshotService.ts` to export the PostgreSQL database as a validated JSON file. 
> 2. Replace the stubbed sync in `BackupPage.tsx` with a functional Google Drive v3 API sync."

---

## ✅ Step 4: Final Validation Checklist
- [ ] No floating point numbers for currency (Uses `Prisma.Decimal`).
- [ ] No `any` types in critical logic.
- [ ] isolation verified (Non-admins cannot see transaction details).
- [ ] Vercel/Railway CI/CD pipelines verified.
