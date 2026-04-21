# 📋 FEATURE_SPEC.md: IEEE Finance Pro v3.0 (The Requirements)

This document contains the functional requirements for all operational modules. Use this as a reference when building specific features.

---

## 1. AI Financial Auditor
- **Model**: `gemini-1.5-flash`.
- **Global Mode**: Analyze branch-wide health + 3 strategic recommendations.
- **Society Mode**: Analyze budget utilization + cost optimization tips.

## 2. Communication Hub (Notice Board)
- **Timeline Feed**: Reverse-chronological feed of broadcasts.
- **Mailto Assembler**: Logic to scrape member emails and construct a BCC string for one-click email broadcasts.

## 3. Automation Engines
- **jsPDF Engine**: Generates branded reports with institutional headers, speaker tables, and S3 photo galleries.
- **CSV Service**: Generates financial ledgers with a 3-row institutional preamble.
- **JSON Snapshot**: A tool to export the full PostgreSQL state as a portable JSON file.

## 4. Branding & Compliance
- **Compliance Badge**: Dynamic "Action Required" (Amber) vs "Compliance Met" (Green) indicators based on Logo/Signature presence.
- **Asset Manager**: Central registry for University-wide branding vs Society-specific logos.

## 5. UI Elements
- **Persona Aliases**: Display "Dean," "Counselor," or "Director" based on email patterns.
- **KPI Grid**: 4-card metric row (Balance, Income, Expenditure, Utilization).
- **Interactive Calendar**: Monthly grid with color-coded status badges and quick-add functionality.

---

## Phase 0.1 Route Implementation Matrix (Pre-Phase 1)

| Target Path | Component File (Proposed) | API Dependency | Notes |
|---|---|---|---|
| /societies | client/src/features/SocietiesPage.tsx | GET /societies, GET /societies/:id, PUT /societies/:id | Aligns with existing sidebar navigation and society management flow. |
| /events | client/src/features/EventsPage.tsx | GET /events, POST /events, PUT /events/:id, DELETE /events/:id | Core event operations currently exposed by backend routes. |
| /calendar | client/src/features/CalendarPage.tsx | GET /events, POST /events | Calendar view projection over event records with status badges. |
| /projects | client/src/features/ProjectsPage.tsx | New: /projects endpoints required | Prisma Project model exists, but backend API surface is not implemented yet. |
| /announcements | client/src/features/AnnouncementsPage.tsx | New: /announcements endpoints required | Required for timeline board and audience-scoped communication. |
| /communications | client/src/features/CommunicationHubPage.tsx | New: /announcements, /members, /office-bearers aggregation endpoints | Home for Mailto Assembler and broadcast workflow. |
| /admin/users | client/src/features/UserManagementPage.tsx | POST /auth/register, PATCH /auth/change-role, GET /auth/me | Credential Control Center and role/persona management. |
| /admin/registry | client/src/features/RegistryPage.tsx | New: /members and /office-bearers endpoints required | Frontend CRUD for member and office bearer registries. |
| /reports/financial | client/src/features/FinancialReportsPage.tsx | New: CSV export endpoints required | Branded CSV and budget-utilization outputs. |
| /reports/quarterly-print | client/src/features/QuarterlyStatementPage.tsx | GET /societies, GET /transactions (role scoped) | Print-target statement page with board formatting. |
