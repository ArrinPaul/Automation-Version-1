# 🗺️ Project Roadmap: IEEE Finance Pro v3.0

This roadmap outlines the strategic phases to achieve full feature parity between the legacy v2.4 (MERN) and the modern v3.0 (PERN/Supabase) architecture.

---

## 🏗️ Phase 3: Infrastructure, Auth & Core Security (CURRENT)
**Goal**: Establish a rock-solid foundation for authentication, role management, and data integrity.

- **Auth Integration**: Fully wire Supabase Auth into the React frontend.
- **RBAC Hardening**: Implement server-side middleware to enforce strict data isolation for `SOCIETY_OB` and `FACULTY_ADVISOR` roles.
- **Validation Layer**: Use Zod for absolute type safety across all API requests and responses.
- **Administrative Persona**: Implement dynamic UI labeling for "Branch Counselor," "Dean," and "Director" roles.

---

## 🎨 Phase 4: Frontend Redesign & Feature Parity (Part 1)
**Goal**: Bring the "Technical Brutalism" aesthetic to the primary operational modules.

- **Dashboard Overhaul**: Implement KPI cards, area charts (Monthly Flow), and the Gemini 1.5 Flash Auditor UI.
- **Societies Module**: Add unit categorization (Technical vs. Affinity vs. Council) and the Branding Compliance badge system.
- **Communication Hub**: Build the timeline-based Announcement board and the **Mailto Assembler** for BCC broadcasts.
- **Interactive Calendar**: Implement the monthly grid view with color-coded status badges and quick-add functionality.

---

## 📄 Phase 5: Event reporting & Financial Exports (Part 2)
**Goal**: Migrate the heavy documentation and PDF/CSV generation engines.

- **jsPDF Automation**: Rebuild the professional PDF export engine with multi-image S3 support and automated branding.
- **Speaker Registry**: Implement dynamic speaker profile management within the event creation workflow.
- **Financial Exports**: Build the server-side CSV generator with institutional headers and the "Quarterly Board Statement" print view.
- **Projects & Grants**: Implement specialized UI views for Travel Grants, Scholarships, and Technical Projects.

---

## ☁️ Phase 6: System Resilience & Cloud Integration
**Goal**: Finalize data portability and cloud synchronization.

- **Google Drive Sync**: Replace legacy stubs with functional v3 API synchronization for cross-device persistence.
- **JSON State Snapshot**: Implement the relational-aware JSON export/import tool for portable PostgreSQL backups.
- **Audit & Analytics**: Build the Super Admin Audit Log viewer and finalize the "Auto-Sync" trigger logic.
- **Quality Assurance**: Reach 80%+ test coverage across repository and service layers.

---
*Created: April 2026 | Tech Lead: Jules*
