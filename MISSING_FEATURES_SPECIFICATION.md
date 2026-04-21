# 📋 Master Specification: Missing Features for IEEE Finance Pro v3.0

This document serves as the definitive list of all features from the legacy v2.4 (MERN/SPA) version that are currently missing, partially implemented, or require migration to the v3.0 (PERN/Supabase) architecture. **No legacy feature should be omitted during the migration.**

---

## 1. Financial Analytics & Dashboards
*   **KPI Metric Cards**: Implementation of the 4-card KPI row (Total/Available Balance, Total Income, Total Expenditure, Budget Utilization % with progress bar).
*   **AI Financial Auditor**: Full frontend integration of the `gemini-1.5-flash` service to provide strategic 200-word reports for both Global (Admin) and Scoped (Society) views.
*   **Administrative Bar Chart**: Top 10 societies by initial vs. current balance comparison.
*   **Society Pie/Donut Chart**: Expense category distribution (Venue, Publicity, Speaker Fees, etc.).
*   **Monthly Financial Flow**: Area chart showing a 12-month running balance, income, and expenditure trend for the current year.
*   **Global Society Selector**: Admin-only tool to toggle the entire dashboard view between different societies.

---

## 2. Financial Controls & Reporting
*   **ACID-Compliant Transactions**: Migration of all transaction logic to use `Prisma.Decimal` (12,2) to ensure 100% financial accuracy.
*   **Branded CSV Exports**: Server-side logic to generate CSVs that include institutional headers (University Name, School Name, Generated Timestamp, and Report Title).
*   **Budget Utilization CSV**: Admin-only comparative report of initial vs. current balances across all 49 technical units.
*   **Quarterly Board Statement (Print View)**: Dedicated CSS `@media print` stylesheets to generate professional physical statements with automated signature lines for the Branch Counselor.

---

## 3. Event Documentation & PDF Automation
*   **jsPDF Generation Engine**: Migration of the professional multi-page PDF export logic, including:
    *   **Automated Header**: Grey-themed institutional header with university branding.
    *   **Data Tables**: General info, Summary of Activity, and Outcome tables.
    *   **Speaker Registry**: Dynamic management of guest speakers (Names, Designations, Organization, and Profiles).
    *   **Photo Gallery**: Automatic embedding of event images (from Supabase/S3) into the PDF layout.
    *   **Watermark Signatures**: Embedding of Advisor signatures at the bottom of the last page.
*   **Event Status Lifecycle**: Logic to handle "Workshop," "Seminar," "Conference," etc., with participant type breakdowns.

---

## 4. Planning & Scheduling
*   **Interactive Activity Calendar**: Full monthly grid calendar with:
    *   **Color-Coded Badges**: Proposed (Amber), Confirmed (Green), Completed (Blue), Cancelled (Red).
    *   **Quick-Add Interaction**: Ability to click any date cell to open the pre-filled "Add Event" modal.
    *   **Status Legend**: Visual guide in the calendar header for event statuses.

---

## 5. Communication Hub
*   **Announcements Notice Board**: Timeline-style feed of broadcast messages.
*   **Audience Scoping Logic**: Filtered views for "Public Broadcast," "Leadership Only," and "Society Internal."
*   **Mailto Assembler**: Advanced logic to scrape relevant email addresses from the Member/Office-Bearer registry and assemble a BCC string for one-click email broadcasts.

---

## 6. Unit Management & Branding
*   **Unit Categorization**: Clear UI separation for "Affinity Groups," "IEEE Councils," and "Technical Societies."
*   **External Portal Links**: Direct deep-links to IEEE Global Society and IEEE Bangalore Section sites on each society card.
*   **Institutional Master Branding**: Admin-only module to manage the University's master logo for global reports.
*   **Branding Compliance Badges**: Automated "Action Required" (Amber) vs. "Compliance Met" (Green) indicators based on the presence of Logo and Advisor Signature assets.
*   **Member & Office Bearer Registries**: Full CRUD interfaces for managing the IEEE member database and leadership teams.

---

## 7. User & Access Control
*   **Credential Control Center**: Advanced user management table for Super Admins.
*   **Management Persona Aliases**: Logic to display specific professional labels (e.g., "Branch Counselor," "Dean," "Executive Admin") based on user profiles.
*   **Credential Patterning UI**: Instructional tooltips on the User Management page for the `{societyid}@ieee.org` email convention.
*   **Strict RBAC Enforce**: Finalizing the backend middleware that physically blocks `SOCIETY_OB` and `FACULTY_ADVISOR` roles from viewing raw transaction lists.

---

## 8. Data Integrity & Cloud Sync
*   **Google Drive Integration**: Real-time synchronization of the `ieee_finance_ledger.json` file for cross-device persistence.
*   **JSON State Snapshot**: A tool to export/import the entire PostgreSQL state as a single validated JSON file for portable offline backups.
*   **Auto-Sync Mechanism**: Trigger logic that initiates a cloud backup whenever significant financial changes occur.

---
*Generated: April 2026 | Reference: v2.4 Legacy Specification | Status: PENDING IMPLEMENTATION*
