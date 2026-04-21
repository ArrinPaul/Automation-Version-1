# 📋 Project TODO: IEEE Finance Pro v3.0

## 🏗️ Phase 3: Infrastructure, Auth & Core Security (CURRENT)
- [x] **Hardening Phase 1 & 2**: Implemented structured logging (Pino), Zod env validation, and global error handling.
- [ ] **Supabase Auth Hook**: Create a custom React hook `useSupabaseAuth` for session and role management in `client/src/context/AuthContext.tsx`.
- [ ] **RBAC Middleware**: Implement a server-side `restrictTransactions` middleware to enforce isolation for Society-scoped roles.
- [ ] **Zod Schema Refinement**: Ensure every controller (Transaction, Event, Society) has strict Zod validation matching the Prisma schema.
- [ ] **Persona Aliases**: Map admin emails to specific labels like "Branch Counselor," "Dean," and "Director" in the Header component.
- [ ] **Credential UI Tips**: Add the institutional email pattern tooltips to the User Management page.

## 🎨 Phase 4: Frontend Redesign & Feature Parity (Part 1)
- [ ] **Technical Brutalism UI**: Apply the `Syncopate` (display) and `JetBrains Mono` (data) typography globally.
- [ ] **Dashboard KPI Grid**: Implement the 4-card KPI row with balance, income, expenditure, and utilization progress bars.
- [ ] **AI Financial Audit Panel**: Integrate the Gemini 1.5 Flash service into the Dashboard with Global vs. Society views.
- [ ] **Activity Calendar**: Build the monthly grid view in `/client/features/Calendar` with color-coded status badges.
- [ ] **Mailto Assembler**: Implement the BCC email scraping logic for one-click broadcasts on the Announcement feed.
- [ ] **Branding Compliance Badges**: Add logic to display amber "Action Required" badges for missing society logos/signatures.

## 📄 Phase 5: Event Reporting & Financial Exports (Part 2)
- [ ] **jsPDF Engine v3**: Migrate the PDF report generator with automated institutional headers and S3 image support.
- [ ] **Speaker Management UI**: Create the dynamic sub-form for managing guest speaker profiles and topics.
- [ ] **Technical Projects UI**: Build dedicated category-specific views for Travel Grants, Scholarships, and Awards.
- [ ] **Financial CSV Service**: Build the server-side CSV generator with institutional preambles and timestamped headers.
- [ ] **Board Statement Print View**: Apply professional CSS print stylesheets for physical reporting.

## ☁️ Phase 6: System Resilience & Cloud Integration
- [ ] **Postgres JSON Snapshot**: Implement the relational-aware state export/import tool for offline backups.
- [ ] **Functional Cloud Sync**: Replace legacy stubs with functional Google Drive v3 API synchronization.
- [ ] **Auto-Sync Trigger**: Implement a "Background Sync" logic that triggers on critical financial updates.
- [ ] **Audit Log UI**: Create a Super Admin viewer for the `AuditLog` table.
- [ ] **Quality Assurance**: Achieve 80%+ test coverage across the repository and service layers using Vitest.

## 🚀 Phase 7: Deployment & Post-Launch
- [ ] **Production Supabase Setup**: Database migrations, bucket policies, and connection pooling.
- [ ] **Vercel/Railway Pipeline**: Environment variable sync and CI/CD verification.
- [ ] **UAT (User Acceptance Testing)**: Role-based walkthrough with real technical society chairs.
- [ ] **Final Security Audit**: Penetration test on transaction endpoints and S3 buckets.

---
*Derived from `MISSING_FEATURES_SPECIFICATION.md` | Last Updated: April 2026*
