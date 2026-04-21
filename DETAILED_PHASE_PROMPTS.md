# 🎯 DETAILED_PHASE_PROMPTS.md: IEEE Finance Pro v3.0

Use these prompts one by one. Do not skip steps. **Always provide `PROJECT_STANDARDS.md` and `FEATURE_SPEC.md` as context to the AI before running these.**

---

## 🏗️ Phase 3: Infrastructure & Shell

### Sub-Phase 3.1: The Identity Hook & RBAC Foundation
> **Prompt**:
> "Act as a Full-Stack Engineer. Implement the identity layer using the rules in `PROJECT_STANDARDS.md`:
> 1. **Auth Context**: Complete the `useAuth` hook in `client/src/context/AuthContext.tsx`. Use `supabase.auth.onAuthStateChange` to monitor sessions and persist the user state.
> 2. **Profile Mapping**: Implement `fetchProfile` to call the `/api/auth/me` endpoint. Map the PostgreSQL `User` record (including `role` and `societyId`) to the React state.
> 3. **RBAC Shield**: Update the `ProtectedRoute` component to enforce the 4-tier security mapping:
>    - `MANAGEMENT`: Global access to all routes.
>    - `FACULTY_ADVISOR` / `SOCIETY_OB`: Scoped access to society-specific features.
>    - `MEMBER`: Access limited to Events and Calendar only.
> 4. **Error Handling**: Ensure auth failures are caught, logged via the server's logger, and displayed via a user-friendly toast or alert."

### Sub-Phase 3.2: Technical Brutalist Shell & Persona Aliases
> **Prompt**:
> "Act as a Frontend Designer. Apply the 'Technical Brutalism' style from `PROJECT_STANDARDS.md`:
> 1. **The Grid & Borders**: Update `Sidebar.tsx` and `Header.tsx` with Obsidian (#0A0A0C) backgrounds, 0.5px hairline borders, and a dot-grid background effect in CSS.
> 2. **Typography**: Use `Syncopate` for display headers and `JetBrains Mono` for all data labels, names, and roles.
> 3. **Persona Aliases**: Implement dynamic title logic in the Header. If `profile.role === 'MANAGEMENT'`:
>    - Email prefix `dean@` -> 'Branch Dean'.
>    - Email prefix `director@` -> 'Director'.
>    - Otherwise -> 'Branch Counselor'.
> 4. **Motion**: Add staggered Framer Motion reveal animations to the sidebar items and header profile section."

---

## 🎨 Phase 4: Feature Parity & UI

### Sub-Phase 4.1: Financial Isolation Middleware
> **Prompt**:
> "Act as a Backend Security Expert. Implement data isolation as per `PROJECT_STANDARDS.md`:
> 1. **Filtering Middleware**: Create `server/src/middleware/filterFinancialData.ts`. This must return a `403 Forbidden` if a `MEMBER` tries to access any transaction route.
> 2. **Line-Item Protection**: For `FACULTY_ADVISOR` and `SOCIETY_OB`, block access to individual transaction line-items (descriptions, categories) in the `/api/transactions` list.
> 3. **Balance Only Endpoint**: Create `GET /api/societies/:id/balance`. Ensure it returns ONLY the total `Decimal` balance for the society, providing the only financial data visible to society-scoped roles.
> 4. **Integrity**: Ensure all currency calculations use `Prisma.Decimal` (Decimal 12,2) and avoid any floating-point math."

### Sub-Phase 4.2: Dashboard KPI Grid & Monthly Flow
> **Prompt**:
> "Act as a Data Visualization Expert. Build the Dashboard in `client/src/features/Dashboard.tsx`:
> 1. **KPI Cards**: Build the 4-card metric row defined in `FEATURE_SPEC.md` (Total Balance, Income, Expenditure, Utilization %).
> 2. **Conditional Styling**: Ensure the 'Utilization %' progress bar turns Acid Green (#C1FF00) when healthy and RED when > 80%.
> 3. **Flow Chart**: Implement the 'Monthly Financial Flow' Area Chart using `Recharts`. Use Electric Blue (#00629B) for the fill and ensure data is fetched via TanStack Query, scoped by `societyId`."

### Sub-Phase 4.3: Announcement Feed & Mailto Assembler
> **Prompt**:
> "Act as a Full-Stack Engineer. Implement the Communication Hub:
> 1. **Timeline Board**: Build `AnnouncementsPage.tsx` with a vertical, reverse-chronological timeline of broadcast messages.
> 2. **Audience Scoping**: Implement a backend endpoint `GET /api/announcements/:id/recipients` that returns target emails based on the announcement's audience.
> 3. **Mailto Assembler**: Build the 'Broadcast Email' button. It must construct a `mailto:` link with all recipient emails in the BCC field to allow one-click branch-wide communication.
> 4. **Branding**: Use `JetBrains Mono` for the announcement metadata (Date, Author, Role)."

### Sub-Phase 4.4: Society Module & Compliance Badges
> **Prompt**:
> "Act as a Frontend Developer. Build the Society Management module:
> 1. **Card Grid**: Implement the `SocietiesPage.tsx` grid. Each card should show the society name, logo, and current compliance status.
> 2. **Compliance Logic**: Implement dynamic 'Compliance Badges'. If `logoUrl` or `advisorSigUrl` is missing, show an Amber 'Action Required' badge; otherwise, show a Green 'Compliance Met' badge.
> 3. **Deep Links**: Add external links to the IEEE Global and Bangalore Section portals as defined in the `FEATURE_SPEC.md` constants."

---

## 📄 Phase 5: Automation & Documentation

### Sub-Phase 5.1: AI Financial Auditor Integration
> **Prompt**:
> "Act as an AI Integration Specialist. Wire Gemini 1.5 Flash into the Dashboard:
> 1. **The Panel**: Build the AI Audit panel in `Dashboard.tsx`. Show a `BOOTING_AUDIT...` loader in `JetBrains Mono` during generation.
> 2. **Context-Aware Prompting**: Send society-specific transaction summaries to Gemini. 
>    - `MANAGEMENT`: Focus on branch-wide health and strategic growth.
>    - `SOCIETY_OB`: Focus on budget utilization and cost-cutting tips.
> 3. **Security**: Ensure no sensitive PII (names, specific transaction IDs) is sent to the AI model; send only anonymized aggregate data."

### Sub-Phase 5.2: jsPDF Engine & Photo Gallery
> **Prompt**:
> "Act as a Document Automation Expert. Implement the professional reporting engine:
> 1. **PDF Service**: Rebuild `server/src/services/pdfService.ts` using `jsPDF`. Use the grey institutional header and layout from `FEATURE_SPEC.md`.
> 2. **Multi-Image Gallery**: Implement a logic to fetch multi-image URLs from Supabase Storage and embed them into a 'Photo Gallery' page at the end of the PDF report.
> 3. **Signature Watermark**: Ensure the Faculty Advisor's signature is watermarked at the bottom of the last page for compliance."

### Sub-Phase 5.3: Branded CSV & Quarterly Print View
> **Prompt**:
> "Act as a Full-Stack Developer. Implement export and print features:
> 1. **CSV Service**: Build a backend utility to generate CSVs that include the mandatory 3-row institutional preamble (Name, Date, Confidentiality Label).
> 2. **Print Styles**: Implement a CSS `@media print` layout for the 'Quarterly Board Statement'. Hide all navigation elements and format the table for professional physical signatures."

---

## ☁️ Phase 6: System Resilience

### Sub-Phase 6.1: JSON Snapshot Tool
> **Prompt**:
> "Act as a Database Engineer. Build the portability tool:
> 1. **Export Logic**: In `server/src/services/snapshotService.ts`, implement a function that performs a full Prisma dump of all tables and packages it into a single, validated JSON file.
> 2. **Restoration**: Implement an 'Import' function that allows `MANAGEMENT` to restore the system state from a JSON snapshot (include a confirmation warning).
> 3. **Validation**: Use Zod to validate the JSON structure before attempting any database writes."

### Sub-Phase 6.2: Cloud Sync & Transaction Triggers
> **Prompt**:
> "Act as a Cloud Integration Expert. Implement automated backups:
> 1. **Google Drive Sync**: Replace the legacy stub in `BackupPage.tsx` with a functional Google Drive v3 API integration.
> 2. **Auto-Trigger**: Implement logic to trigger a cloud sync whenever a transaction is marked as 'APPROVED' by `MANAGEMENT`.
> 3. **Success Tracking**: Update the UI to show the 'Last Successful Sync' timestamp and any sync errors in `JetBrains Mono`."
