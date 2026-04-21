# 🚀 Features Updation: IEEE Finance Pro v3.0

This document outlines the legacy features from v2.4 (MERN/SPA) that are currently missing, partially implemented, or pending migration to the new v3.0 (PERN/Supabase) architecture.

---

## 1. Planning & Scheduling
### **Activity Calendar (Phase 4)**
*   **Description**: An interactive monthly grid view that visualizes upcoming and past events across all 49 societies.
*   **Key Functionality**: 
    *   Color-coded badges for event status (Proposed, Confirmed, Completed, Cancelled).
    *   Click-to-add event functionality directly from a calendar cell.
    *   Admin-level filters to view schedules by society or council.

---

## 2. Communication Hub
### **Announcements & Broadcast System (Phase 4)**
*   **Description**: A centralized messaging board for official communications.
*   **Key Functionality**: 
    *   **Audience Targeting**: Broadcasts scoped to "Public," "Leadership Only," or "Specific Society."
    *   **Mailto Assembler**: Logic that scrapes relevant emails from the database and constructs a BCC string for one-click email broadcasts.
    *   **Timeline View**: A reverse-chronological feed of official notices with sender attribution.

---

## 3. Advanced Financial Controls
### **Quarterly Board Statement & Exports (Phase 5)**
*   **Description**: High-fidelity financial reporting tools for board-level audits.
*   **Key Functionality**:
    *   **Branded CSV Exports**: Generates ledger reports with an institutional preamble (University name, generation timestamp).
    *   **Print-Ready Statements**: Professional CSS print stylesheets for generating physical board statements with Counselor signature lines.
    *   **Budget Utilization Summaries**: Comparative analysis of initial vs. current balances across all technical units.

---

## 4. Event & Project Management
### **Event Report Automation (Partial Implementation)**
*   **Description**: The full migration of the jsPDF report generation engine.
*   **Key Functionality**:
    *   **Multi-Image Support**: Integration with Supabase Storage/S3 for high-resolution event photos.
    *   **Speaker Registry UI**: A dynamic table specifically for managing guest speakers, designations, and presentation topics.
    *   **Branding Watermarks**: Automatic embedding of Advisor signatures and society logos into generated PDFs.

### **Technical Projects & Grants Registry (Phase 5)**
*   **Description**: A dedicated module for tracking IEEE-sanctioned projects and member accolades.
*   **Key Functionality**:
    *   **Specific Category Scoping**: UI views specifically designed for Travel Grants vs. Scholarships vs. Technical Projects.
    *   **Status Lifecycle**: Tracking from "Proposed" to "Awarded/Completed."

---

## 5. Administrative UI
### **Member & Office Bearer Registry (UI Pending)**
*   **Description**: Frontend interfaces for the existing backend registry logic.
*   **Key Functionality**:
    *   **Member Database**: Management of IEEE IDs, grades, and contact details.
    *   **Leadership Management**: CRUD operations for Chair, Secretary, and Treasurer roles per society.

### **Branding Repository & Compliance (UI Pending)**
*   **Description**: An asset management panel for institutional and society branding.
*   **Key Functionality**:
    *   **Institutional Master Assets**: Dedicated section for uploading the University-wide master logo used in global headers.
    *   **Compliance Badge Logic**: A system that calculates and displays an amber "Action Required" status if a society is missing its logo or Advisor signature.
    *   **IEEE Portal Links**: Integration of direct deep-links to IEEE Global and IEEE Bangalore Section portals on society cards.

---

## 6. User & System Management
### **Credential Control Center (Phase 3)**
*   **Description**: Enhanced user management for the Branch Counselor.
*   **Key Functionality**:
    *   **Management Persona Aliases**: UI logic to display specific labels (e.g., "Branch Counselor," "Dean," "Director") based on admin email/profile roles.
    *   **Credential Patterning**: Instructional tooltips for the standard `{societyid}@ieee.org` email convention.

### **State Snapshot & Cloud Sync (Phase 6)**
*   **Description**: Moving from legacy "Stubbed" sync to a functional cloud-native backup system.
*   **Key Functionality**:
    *   **Google Drive Integration**: Automated document synchronization for receipts and reports.
    *   **JSON State Snapshot**: A tool to export/import the entire PostgreSQL/Supabase state as a single validated JSON file for portable offline backups.

---
*Last Updated: April 2026 | Priority: High*
