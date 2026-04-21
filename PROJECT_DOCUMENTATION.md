# IEEE Finance Pro — Complete Project Documentation

**Project Name**: IEEE Finance Pro  
**Version**: 2.4.0  
**Architecture**: MERN Stack (MongoDB · Express · React · Node.js)  
**Institution**: CHRIST (Deemed to be University), Bangalore — School of Engineering and Technology  
**Last Updated**: April 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Status & Maturity](#3-project-status--maturity)
4. [System Architecture](#4-system-architecture)
5. [Frontend — Pages & Components (Detailed)](#5-frontend--pages--components-detailed)
6. [Frontend — State Management & Services](#6-frontend--state-management--services)
7. [Backend — API Routes & Controllers](#7-backend--api-routes--controllers)
8. [Role-Based Access Control (RBAC)](#8-role-based-access-control-rbac)
9. [Database Schema (MongoDB)](#9-database-schema-mongodb)
10. [All Features — Implemented & Planned](#10-all-features--implemented--planned)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Known Issues & Technical Debt](#12-known-issues--technical-debt)
13. [Quick Start Guide](#13-quick-start-guide)

---

## 1. Project Overview

**IEEE Finance Pro** is an enterprise-grade, full-stack financial management and event coordination platform designed specifically for IEEE Student Branch operations at CHRIST (Deemed to be University). It provides a centralised hub for managing the finances, events, projects, and memberships of over 40 IEEE technical societies, affinity groups, and councils under one Student Branch.

### Core Purpose

| Domain | Description |
|---|---|
| **Financial Ledger** | Track income and expenditures across all IEEE units with role-based approvals |
| **Budget Management** | Allocate and monitor budgets per society; visual utilization tracking |
| **Event Management** | Document conducted events with participant data, speakers, and outcomes for university submission |
| **Project Tracking** | Manage IEEE-sanctioned technical projects, travel grants, scholarships, and awards |
| **Member Registry** | Maintain IEEE member records with IDs, grades, and contact details |
| **Office Bearer Management** | Track all positions (Chair, Vice-Chair, Secretary, etc.) per society |
| **Activity Calendar** | Schedule and visualize events across all societies on an interactive calendar |
| **Announcements** | Broadcast official communications to all members, leadership, or specific societies |
| **Branding Repository** | Central store for society logos and advisor signatures used in official reports |
| **AI Financial Audit** | Gemini AI-powered financial analysis and strategic recommendations |
| **Reports & Export** | Generate branded CSV reports, formatted PDFs, and print-ready board statements |
| **Cloud Backup** | Google Drive integration for automated document sync and local JSON backup |

---

## 2. Tech Stack

### Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.0.0 | Core UI framework |
| **TypeScript** | 5.4.5 | Type-safe JavaScript |
| **Vite** | 5.2.11 | Build tool, dev server, HMR |
| **React Router DOM** | 7.13.2 | Client-side routing with `ProtectedRoute` |
| **TailwindCSS** | 3.4.3 | Utility-first CSS, dark-mode ready |
| **PostCSS + Autoprefixer** | 8.4.38 / 10.4.19 | CSS transformation and vendor prefixes |
| **Recharts** | 3.6.0 | Interactive charts (Bar, Area, Pie) |
| **Axios** | 1.14.0 | HTTP client with JWT interceptors |
| **jsPDF** | 2.5.1 | Programmatic PDF generation for event reports |
| **@google/genai** | 1.34.0 | Gemini AI integration for financial insights |

### Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 4.21.0 | HTTP web framework |
| **TypeScript** | 5.5.4 | Type-safe backend code |
| **ts-node-dev** | 2.0.0 | Hot-reload TypeScript dev server |
| **Mongoose** | 8.6.0 | MongoDB ODM with schema validation |
| **MongoDB** | 6 (Docker) / Atlas (cloud) | Primary database |
| **jsonwebtoken** | 9.0.2 | JWT access + refresh token generation |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Helmet** | 7.1.0 | Security HTTP headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **express-rate-limit** | 7.4.0 | API rate limiting (200 req/15 min) |
| **express-validator** | 7.2.0 | Input validation and sanitization |
| **Multer** | 1.4.5-lts | Multipart file upload handling |
| **Morgan** | 1.10.0 | HTTP request logging (dev only) |
| **googleapis** | 171.4.0 | Google Drive API for file storage |
| **dotenv** | 16.4.5 | Environment variable loading |

### Testing Stack

| Technology | Version | Purpose |
|---|---|---|
| **Jest** | 30.3.0 | Test framework and runner |
| **Supertest** | 7.2.2 | HTTP endpoint assertion library |
| **ts-jest** | 29.4.9 | TypeScript preprocessor for Jest |
| **mongodb-memory-server** | 11.0.1 | In-memory MongoDB (no external DB needed for tests) |

### DevOps & Infrastructure

| Tool | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration (MongoDB + Backend + Frontend) |
| **Netlify** | Frontend static hosting (configured but empty `netlify.toml`) |
| **MongoDB Atlas** | Production cloud database |
| **Google Drive API** | Cloud file storage via Service Account |

---

## 3. Project Status & Maturity

### Overall Health: **85% Complete — Well Done ✅**

| Area | Status | File(s) | Notes |
|---|---|---|---|
| **Frontend UI** | ✅ Complete | `components/`, `App.tsx` | 21 pages/components, full routing, role-gated views |
| **Auth (JWT)** | ✅ Complete | `context/AuthContext.tsx`, `server/src/routes/authRoutes.ts` | Login, refresh tokens, session restore |
| **RBAC** | ✅ Complete | `server/src/middleware/roleMiddleware.ts`, `context/AuthContext.tsx` | 4-tier permissions enforced both sides |
| **Backend API** | ✅ Complete | `server/src/routes/`, `server/src/controllers/` | 8 route modules, full CRUD |
| **Database** | ✅ Complete | `server/src/models/` | 7 Mongoose models with proper schemas |
| **Google Drive (backend)** | ⚠️ Partial | `server/src/services/googleDriveService.ts` | Service exists; needs `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` set |
| **Cloud Sync (frontend)** | ❌ Stubbed | `components/BackupPage.tsx` | Shows an alert instead of calling the API |
| **Gemini AI** | ⚠️ Broken | `services/geminiService.ts` | Wrong model name (`gemini-3-flash-preview`) |
| **Password Reset** | ⚠️ Incomplete | `components/PasswordResetModal.tsx` | UI exists; backend endpoint missing |
| **Tests** | ⚠️ Partial | `server/tests/` | Auth + RBAC tests only; no frontend tests |
| **CI/CD** | ❌ Missing | — | No `.github/workflows/` directory |
| **Linting / Formatting** | ❌ Missing | — | No ESLint, Prettier, Husky configured |
| **Netlify Config** | ❌ Empty | `netlify.toml` | No build command or SPA redirect |
| **Documentation** | ✅ Good | `README.md`, `arch.md`, `todo.md` | Thorough but some sections stale |
| **Seed Script** | ✅ Present | `server/src/scripts/seed.ts` | Creates test users and societies |
| **Containerization** | ✅ Dev Ready | `docker-compose.yml` | No production multi-stage Dockerfile |

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     BROWSER (React + TypeScript)                      │
│                                                                        │
│  ┌──────────────┐  ┌──────────────────────────────────────────────┐  │
│  │ AuthContext  │  │  Pages: Dashboard, Transactions, Events,      │  │
│  │ (JWT, roles) │  │  Projects, Calendar, Announcements, Reports,  │  │
│  └──────────────┘  │  Societies, Repository, Users, Backup         │  │
│  ┌──────────────┐  └──────────────────────────────────────────────┘  │
│  │ AppContext   │  ┌──────────────────────────────────────────────┐  │
│  │ (all CRUD)   │  │  Modals: Transaction, Budget, Event, Project, │  │
│  └──────────────┘  │  Calendar, OfficeBearers, Members, Password,  │  │
│  ┌──────────────┐  │  Announcement                                  │  │
│  │ apiClient.ts │  └──────────────────────────────────────────────┘  │
│  │ (Axios +     │                                                      │
│  │  JWT inject) │                                                      │
│  └──────────────┘                                                      │
└────────────────────────────↓ HTTPS/REST ↓──────────────────────────┘
                             
┌──────────────────────────────────────────────────────────────────────┐
│              BACKEND (Express + Node.js + TypeScript)                 │
│                                                                        │
│  Middleware: helmet · cors · rate-limit · authMiddleware · roleMiddleware │
│                                                                        │
│  Routes:                                                               │
│  /api/auth          → login, register, refresh                         │
│  /api/societies     → CRUD + office bearers + members                  │
│  /api/transactions  → CRUD + approve                                   │
│  /api/events        → CRUD                                             │
│  /api/projects      → CRUD                                             │
│  /api/calendar      → CRUD                                             │
│  /api/announcements → CRUD                                             │
│  /api/upload        → file upload via Multer → Google Drive            │
│  /api/health        → status check                                     │
└────────────────┬─────────────────────────┬───────────────────────────┘
                 │                         │
    ┌────────────▼──────────┐  ┌──────────▼──────────────┐
    │   MongoDB (Atlas /    │  │   Google Drive API        │
    │   Docker local)       │  │   (Service Account)       │
    │                       │  │                           │
    │  • users              │  │  • Receipt uploads        │
    │  • societies          │  │  • Event report PDFs      │
    │  • transactions       │  │  • Society documents      │
    │  • events             │  └───────────────────────────┘
    │  • projects           │
    │  • calendarEvents     │
    │  • announcements      │
    └───────────────────────┘
```

### Folder Structure

```
Automation-Version-1/
├── App.tsx                    # Root component, routing, modal orchestration
├── index.tsx                  # React entry point, Provider wrappers
├── index.html                 # Vite HTML template
├── types.ts                   # Global TypeScript types & interfaces
├── constants.ts               # IEEE societies list, categories, positions
├── vite.config.ts             # Vite config (Gemini API key polyfill)
├── tsconfig.json              # TypeScript compiler config
├── package.json               # Frontend dependencies
├── package-lock.json          # Lock file
├── netlify.toml               # Netlify config (EMPTY — needs fixing)
├── docker-compose.yml         # Dev environment: MongoDB + backend + frontend
├── .env.example               # Frontend env template (VITE_API_BASE_URL only)
│
├── components/                # 21 React page + modal components
│   ├── Login.tsx
│   ├── Header.tsx
│   ├── Dashboard.tsx
│   ├── TransactionsPage.tsx + TransactionModal.tsx
│   ├── SocietiesPage.tsx + BudgetModal.tsx + OfficeBearerModal.tsx + MembersModal.tsx
│   ├── EventsPage.tsx + EventModal.tsx
│   ├── ProjectsPage.tsx + ProjectModal.tsx
│   ├── CalendarPage.tsx + CalendarEventModal.tsx
│   ├── AnnouncementsPage.tsx + AnnouncementModal.tsx
│   ├── ReportsPage.tsx
│   ├── RepositoryPage.tsx
│   ├── UserManagementPage.tsx
│   ├── BackupPage.tsx
│   └── PasswordResetModal.tsx
│
├── context/                   # Global React state contexts
│   ├── AuthContext.tsx         # JWT session, user role, login/logout
│   └── AppContext.tsx          # All CRUD operations, data state
│
├── hooks/                     # Custom React hooks
│   └── useAppData.ts          # Data fetching + domain-specific mutation hooks
│
├── services/                  # API service layer
│   ├── apiClient.ts           # Axios instance with JWT interceptors + refresh
│   ├── api.ts                 # Domain API functions (societyApi, transactionApi, etc.)
│   └── geminiService.ts       # Gemini AI financial insights service
│
└── server/                    # Express backend (separate Node.js project)
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.js
    ├── src/
    │   ├── server.ts          # Entry point (DB connect + listen)
    │   ├── index.ts           # Express app factory (middleware + routes)
    │   ├── config/db.ts       # Mongoose connection
    │   ├── models/            # 7 Mongoose schemas
    │   ├── routes/            # 8 route files
    │   ├── controllers/       # Business logic
    │   ├── middleware/        # auth, role, error, upload
    │   ├── services/          # googleDriveService.ts
    │   └── scripts/seed.ts    # Seed database with test users + societies
    └── tests/
        ├── setup.ts
        ├── auth.test.ts
        └── rbac.test.ts
```

---

## 5. Frontend — Pages & Components (Detailed)

### 5.1 Login (`components/Login.tsx`)

The authentication entry point for the application.

- **What it does**: Presents a styled login form with email and password fields. On submit it calls `AuthContext.login()` which hits `POST /api/auth/login`, stores the JWT access token, refresh token, and user object in `localStorage`, and redirects to the dashboard.
- **RBAC**: Public route — not accessible after login.
- **Design**: Glassmorphism card on a gradient background, IEEE branding visible.

---

### 5.2 Header (`components/Header.tsx`)

The persistent top navigation bar visible on all authenticated pages.

- **What it does**:
  - Shows a dropdown navigation menu with all 10+ pages (Dashboard, Societies, Calendar, Announcements, Transactions, Event Reports, IEEE Projects, Reports, Repository, Cloud Sync, and conditionally User Access for admins).
  - Displays the current user's name and role label (Super Admin, SB Treasurer, Society Admin, Viewer).
  - Provides a "Change Password" button and "Sign Out" action within the dropdown.
  - Renders the "IEEE MANAGER" brand name and institution name.
- **RBAC**: The "User Access" menu item is only injected for `SUPER_ADMIN` and legacy `ADMIN` roles.
- **Design**: Sticky top bar, height 80px, responsive — collapses labels on mobile.

---

### 5.3 Dashboard (`components/Dashboard.tsx`)

The primary financial overview screen and the default landing page after login.

- **What it does**:
  - Shows 4 KPI metric cards: **Total/Available Balance**, **Total Income**, **Total Expenditure**, **Budget Utilization %** with a progress bar.
  - **AI Financial Audit Panel**: Calls the Gemini AI service on mount (and re-fetches when transactions change) to generate a 200-word strategic financial analysis. Includes a manual "Refresh Audit" button. Shows animated loading skeleton while waiting.
  - **For Super Admin / SB Treasurer** (global view): Renders a **grouped Bar Chart** comparing initial vs current balance for top 10 societies by allocation.
  - **For Society Admin** (society-scoped view): Renders two charts — a **Donut/Pie Chart** for expense category breakdown, and a **Bar Chart** for income vs expenditure ratio.
  - **Monthly Financial Flow Chart**: An **Area Chart** showing monthly income, expenditure, and running balance for the current calendar year. Admins can switch the society they're viewing via a dropdown; Society Admins see only their own society.
- **RBAC**: All roles see this page. Admins see branch-wide data; Society Admins see only their society's data.
- **Data source**: `AppContext` state (fetched from API on login).

---

### 5.4 Transactions Page (`components/TransactionsPage.tsx`)

The financial ledger showing all recorded income and expense entries.

- **What it does**:
  - Displays a tabular list of all transactions with columns: Date, Society, Description, Category, Amount (coloured green for income, red for expense), Actions.
  - Society Admins see only their own society's transactions; Admins see all.
  - Edit (pencil) and Delete (trash) action buttons are enabled only if the user belongs to that society or is an admin.
- **RBAC**: All roles can view. Edit/Delete restricted to owning society or Super Admin.
- **Companion modal**: `TransactionModal.tsx` — used for both adding new entries and editing existing ones (amount, type INCOME/EXPENSE, category from predefined lists, description, date, society selector for admins).

---

### 5.5 Societies Page (`components/SocietiesPage.tsx`)

The IEEE Units Management panel showing all societies, affinity groups, and councils.

- **What it does**:
  - Organises all units into three sections: **Affinity Groups** (WIE, YP, SIGHT, LM), **IEEE Councils** (Sensors, Biometrics, Nano, Systems, CEDA), and **Technical Societies** (40+ units like ComSoc, RAS, CS, PES, etc.).
  - Renders a card per society with: logo (or initial fallback), society name, IEEE Global portal link, IEEE Bangalore Section link, Initial Balance, Current Balance, a colour-coded availability percentage badge (red if < 20%), and a balance progress bar.
  - Each card has quick action buttons: **Manage Members**, **Manage Office Bearers**, and for admins: **Reset Password**, **Edit Budget**.
  - Income and Expense entry buttons on each card open the transaction modal pre-filled with that society.
  - A search bar filters societies by name or short name in real time.
- **RBAC**: Admins see all units; Society Admins see only their assigned society.
- **Companion modals**:
  - `BudgetModal.tsx` — allows admins to set the initial budget allocation for a society.
  - `OfficeBearerModal.tsx` — full CRUD for position holders (Chair, Vice-Chair, Secretary, etc.) with name, designation, email, phone.
  - `MembersModal.tsx` — full CRUD for IEEE member registry with IEEE ID, name, email, contact, grade.

---

### 5.6 Events Page (`components/EventsPage.tsx`)

The event reporting portal for documenting conducted activities.

- **What it does**:
  - Lists all event reports as cards with title, date, type, participant count, and action buttons.
  - Society Admins see only their society's events.
  - **PDF Export**: Each event card has an "Export PDF" button that generates a fully branded, multi-page PDF using jsPDF with:
    - Institutional header (university name, school name, logos embedded if uploaded to Repository)
    - General Information Table: title, date, time, venue, type, participants, organiser, collaboration
    - Summary of Activity
    - Outcome / Highlights / Key Takeaways
    - Follow-Up Plan
    - Speaker details table (name, designation, organisation, presentation title, profile)
    - Participant type breakdown
    - Embedded event images
    - Advisor signature watermark at the bottom
- **RBAC**: Society Admins can only add/edit/delete their own society's events.
- **Companion modal**: `EventModal.tsx` — rich form with all event fields: title, date, time, venue, type (Workshop/Seminar/Conference/etc.), participant count, participant type, description, outcome, highlights, takeaways, follow-up plan, organiser details, speakers list (add multiple), and image uploads.

---

### 5.7 Projects Page (`components/ProjectsPage.tsx`)

The IEEE Sanctioned Portals for tracking grants, projects, and accolades.

- **What it does**:
  - Organises records into 4 distinct sections:
    1. **Technical Projects** — IEEE-funded or sanctioned research and development projects.
    2. **Travel Grants** — Conference travel assistance records.
    3. **Scholarships** — Academic scholarship awards.
    4. **Recognition Awards** — Honours and accolades received by members.
  - Each record card displays: project ID, title, status badge (Proposed/Ongoing/Completed/Cancelled/Announced/Awarded), society badge, sanctioning body, sanctioned amount, effective date, and description snippet.
  - A search bar filters across title, sanctioning body, and society name.
  - Role-based add buttons are section-specific (e.g., "Register Travel Grants").
- **RBAC**: Society Admins see only their society's records; Admins see all.
- **Companion modal**: `ProjectModal.tsx` — fields: title, category, sanctioning body, sanctioned amount, start date, status, description, society (admin selects).

---

### 5.8 Calendar Page (`components/CalendarPage.tsx`)

An interactive monthly calendar for scheduling and visualising events across all societies.

- **What it does**:
  - Renders a full monthly grid calendar with day cells. Today's date is highlighted with a blue circle.
  - Events are rendered as coloured badges inside day cells, colour-coded by status: Proposed (amber), Confirmed (green), Completed (blue), Cancelled (red).
  - Clicking any valid day opens the Add Event modal pre-filled with that date.
  - Clicking an existing event badge opens the Edit Event modal.
  - Navigation: Previous Month, Today (jump to current), Next Month buttons.
  - Admins can filter events by society via a dropdown. Society Admins always see only their society's events.
  - A status legend is shown at the top right of the calendar header.
- **RBAC**: All roles can view; admins see cross-society filter.
- **Companion modal**: `CalendarEventModal.tsx` — fields: title, date, time, venue, description, status.

---

### 5.9 Announcements Page (`components/AnnouncementsPage.tsx`)

The official notice board and communications hub.

- **What it does**:
  - Displays announcements in reverse chronological order in a timeline layout with sender avatar (initial), full name, formatted date, and audience badge.
  - Three audience types: **Public Broadcast** (all members), **Leadership Only** (office bearers), **Society Internal** (specific society members).
  - **Send Mail button**: Generates a pre-filled `mailto:` link with BCC recipients automatically assembled from the relevant users/members/office bearers based on the target audience, allowing one-click email dispatch.
  - Senders and Admins can delete their own announcements.
  - Right sidebar shows a Communication Hub info panel explaining the audience scope.
- **RBAC**: All users can view relevant announcements (filtered by audience). Creating announcements depends on role.
- **Companion modal**: `AnnouncementModal.tsx` — title, message (multi-line), target audience selector, optional society scope.

---

### 5.10 Reports Page (`components/ReportsPage.tsx`)

The audit and export centre for generating official financial documentation.

- **What it does**:
  - **Financial Ledger CSV**: Exports all transactions (or society-scoped) as a branded CSV with preamble including institution name, report title, and generation timestamp. Columns: Date, Society, Description, Category, Type, Amount, Approved By.
  - **Budget Utilization Summary CSV** (Admins only): Cross-society comparison of initial vs current balance with utilization percentages.
  - **Activity Archive CSV**: Full export of all event reports with title, type, participants, description, and outcomes.
  - **Quarterly Board Statement Print Preview**: Triggers the browser's print dialog rendering a professionally formatted print stylesheet with institution branding, society info, and "Organized By" line. AI Auditor section is callable from here.
  - All export buttons show a spinner during the 0.8s generation delay.
- **RBAC**: Society Admins see only their own data in exports. Budget Utilization is admin-only.

---

### 5.11 Repository Page (`components/RepositoryPage.tsx`)

The branding asset manager for logos and advisor signatures.

- **What it does**:
  - **Institutional Branding Section** (Admins only): Upload, replace, download, or remove the university's master identity logo. This logo is automatically embedded in all PDF event reports at the header.
  - **Society Branding Records**: One card per society showing:
    - **Official Logo** — upload/replace/download/remove. Used in event PDFs.
    - **Advisor Signature** — upload/replace/download/remove. Rendered as a watermark at the bottom of event PDFs.
    - A **Compliance status badge** shows "Compliance Met" (green) if both logo and signature are uploaded, or "Action Required" (amber) if either is missing.
  - Images are stored as Base64 data URLs in state (and persisted via API).
  - A search bar filters societies by name (admin view).
- **RBAC**: Admins see all societies with search; Society Admins see only their assigned society.

---

### 5.12 User Management Page (`components/UserManagementPage.tsx`)

The Branch Counselor's credential control centre.

- **What it does**:
  - Shows a "Credential Control Center" header panel with counts of societies and admins.
  - Renders a table of all users with: Name, Portal Email (monospace), Access Level (Counselor/Executive for Admins, Office Bearer for Society users), and an "Override Key" button to trigger a password reset.
  - Left sidebar has search by name/email and filter buttons (All / Society / Admin).
- **RBAC**: Visible only to `SUPER_ADMIN` and `ADMIN` roles (conditionally added in the navigation menu).
- **Companion modal**: `PasswordResetModal.tsx` — allows setting a new password for the selected user (frontend UI exists; full backend endpoint integration is incomplete).

---

### 5.13 Backup Page (`components/BackupPage.tsx`)

The data management and cloud synchronisation panel.

- **What it does**:
  - **Cloud Sync Section**: Shows a Google Drive connection interface. When not connected, displays a form to enter a Google Cloud Client ID and a "Sign in with Google" button. When connected, shows account email, a "Sync Now" button, and an "Auto-Sync toggle". The sync timestamp is displayed. ⚠️ **Currently stubbed** — clicking "Sign in" shows an informational alert instead of calling the API.
  - **Local Backup Controls**:
    - **Export JSON**: Downloads the entire application state as a dated `.json` file for offline backup.
    - **Import JSON**: Uploads a previously exported `.json` file and restores state (with a confirmation dialog and basic format validation). Preserves the current user session and sync settings.
- **Status**: Cloud sync is intentionally disabled pending server-side Google Drive service account configuration.

---

### 5.14 Modal Components

| Modal | Purpose | Key Fields |
|---|---|---|
| `TransactionModal.tsx` | Add/Edit income or expense entry | Amount, type (Income/Expense), category, description, date, society (admin) |
| `BudgetModal.tsx` | Set initial budget allocation for a society | New budget amount input |
| `EventModal.tsx` | Full event report creation/editing | Title, date/time/venue, type, participants, description, outcome, speakers (list), images, organiser, highlights, takeaways, follow-up |
| `ProjectModal.tsx` | Register sanctioned projects/grants/awards | Title, category, sanctioning body, amount, start date, status, description |
| `CalendarEventModal.tsx` | Schedule an activity | Title, date, time, venue, description, status |
| `OfficeBearerModal.tsx` | Manage society office bearer team | Position, name, email, phone (add/edit/delete rows) |
| `MembersModal.tsx` | Manage IEEE member registry | IEEE ID, name, email, contact, grade (add/edit/delete rows) |
| `AnnouncementModal.tsx` | Create a broadcast message | Title, message, target audience, optional society scope |
| `PasswordResetModal.tsx` | Reset user password (admin action) | New password input for selected user |

---

## 6. Frontend — State Management & Services

### AuthContext (`context/AuthContext.tsx`)

Manages the entire authentication lifecycle:

- `login(email, password)` — calls `POST /api/auth/login`, stores JWT + refresh token + user in `localStorage`, sets React state.
- `logout()` — clears `localStorage` and resets state.
- `hasRole(...roles)` — utility to check if current user has one of the specified roles.
- Convenience booleans: `isSuperAdmin`, `isTreasurer`, `isSocietyAdmin`, `isViewer`.
- On mount, restores session from `localStorage` automatically.
- `UserRole` enum: `SUPER_ADMIN`, `SB_TREASURER`, `SOCIETY_ADMIN`, `VIEWER` (with legacy aliases `ADMIN` and `OFFICE_BEARER`).

### AppContext (`context/AppContext.tsx`)

Aggregates all domain-specific data and CRUD operations into a single context:

- Composed from 6 custom hooks (see below).
- Exposes: `state` (all data), `isDataLoaded`, `dataError`, `fetchAllData()`, and all CRUD methods.

### useAppData Hook (`hooks/useAppData.ts`)

Contains 7 custom hooks:

| Hook | Responsibility |
|---|---|
| `useAppData` | `fetchAllData()` — parallel fetch of all 6 collections; maps `_id` → `id` |
| `useTransactions` | `addTransaction`, `updateTransaction`, `deleteTransaction` — refreshes society balances on change |
| `useSocieties` | `updateBudget`, `updateOfficeBearers`, `updateMembers`, `updateSocietyLogo`, `updateAdvisorSignature` |
| `useEvents` | `addEvent`, `updateEvent`, `deleteEvent` |
| `useProjects` | `addProject`, `updateProject`, `deleteProject` |
| `useCalendarEvents` | `addCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent` |
| `useAnnouncements` | `addAnnouncement`, `deleteAnnouncement` |

### apiClient (`services/apiClient.ts`)

Axios instance with two interceptors:

1. **Request interceptor**: Reads JWT from `localStorage` and injects `Authorization: Bearer <token>` header on every request.
2. **Response interceptor**: On `401 Unauthorized`, automatically attempts token refresh via `POST /api/auth/refresh`. On success, retries the original request with the new token. On refresh failure, clears storage and redirects to `/login`.

### geminiService (`services/geminiService.ts`)

Calls Google's Gemini AI with a financial prompt:

- Global view: Generates a branch-wide report covering overall health, over/under-spending societies, and 3 actionable recommendations.
- Society view: Generates a society-specific report on budget utilization, activity suggestions, and cost optimization.
- ⚠️ **Known issue**: Model name `gemini-3-flash-preview` is incorrect and will cause runtime errors. Should be `gemini-1.5-flash` or a valid model name.

---

## 7. Backend — API Routes & Controllers

### Auth Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Validates email/password, returns JWT access + refresh tokens |
| POST | `/api/auth/register` | SUPER_ADMIN only | Creates a new user with specified role and societyId |
| POST | `/api/auth/refresh` | Public (with refresh token) | Issues new access token from valid refresh token |

### Society Routes (`/api/societies`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/societies` | Authenticated | Get all societies (scoped by role) |
| GET | `/api/societies/:id` | Authenticated | Get specific society |
| POST | `/api/societies` | SUPER_ADMIN | Create new society |
| PUT | `/api/societies/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Update society details / budget |
| PUT | `/api/societies/:id/office-bearers` | SUPER_ADMIN / SOCIETY_ADMIN | Update office bearers list |
| PUT | `/api/societies/:id/members` | SUPER_ADMIN / SOCIETY_ADMIN | Update members list |
| DELETE | `/api/societies/:id` | SUPER_ADMIN | Delete society |

### Transaction Routes (`/api/transactions`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/transactions` | Authenticated | Get transactions (SOCIETY_ADMIN gets own; others get all or filtered) |
| POST | `/api/transactions` | SUPER_ADMIN / SB_TREASURER / SOCIETY_ADMIN | Create new income/expense entry; updates society balance |
| PUT | `/api/transactions/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Update transaction fields |
| PATCH | `/api/transactions/:id/approve` | SUPER_ADMIN / SB_TREASURER | Mark transaction as approved |
| DELETE | `/api/transactions/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Delete transaction; restores society balance |

### Event Routes (`/api/events`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/events` | Authenticated | Get all event reports (role-scoped) |
| POST | `/api/events` | SUPER_ADMIN / SOCIETY_ADMIN | Create event report |
| PUT | `/api/events/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Update event |
| DELETE | `/api/events/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Delete event |

### Project Routes (`/api/projects`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Authenticated | Get all projects (role-scoped) |
| POST | `/api/projects` | SUPER_ADMIN / SOCIETY_ADMIN | Register new project/grant/award |
| PUT | `/api/projects/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Update project record |
| DELETE | `/api/projects/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Delete project record |

### Calendar Routes (`/api/calendar`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/calendar` | Authenticated | Get all calendar events (role-scoped) |
| POST | `/api/calendar` | SUPER_ADMIN / SOCIETY_ADMIN | Create calendar event |
| PUT | `/api/calendar/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Update calendar event |
| DELETE | `/api/calendar/:id` | SUPER_ADMIN / SOCIETY_ADMIN (own) | Delete calendar event |

### Announcement Routes (`/api/announcements`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/announcements` | Authenticated | Get announcements filtered by audience relevance |
| POST | `/api/announcements` | SUPER_ADMIN / SB_TREASURER / SOCIETY_ADMIN | Broadcast announcement |
| DELETE | `/api/announcements/:id` | SUPER_ADMIN / sender | Delete announcement |

### Upload Routes (`/api/upload`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/upload` | Authenticated | Upload file via Multer → streams to Google Drive; returns `fileId` and `webViewLink` stored in MongoDB |

### Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Returns API status, environment, and timestamp |

---

## 8. Role-Based Access Control (RBAC)

The system enforces a strict 4-tier permission hierarchy at both frontend and backend layers.

### Role Definitions

| Role | Scope | Key Permissions |
|---|---|---|
| **SUPER_ADMIN** | Full system | Create/delete users; manage all societies; view/modify all transactions; global approvals; system settings |
| **SB_TREASURER** | Branch-wide financial | View/approve all transactions; generate reports; manage branch finances; cannot modify user roles |
| **SOCIETY_ADMIN** | Society-specific | Create/edit transactions within own society; manage own members & office bearers; limited to assigned `societyId` |
| **VIEWER** | Read-only | View dashboards, announcements, and reports; cannot create or modify any data |

### How RBAC is Enforced

**Backend** (`server/src/middleware/`):
- `authMiddleware.ts` — verifies JWT on every protected route; attaches `req.user` (id, role, societyId).
- `roleMiddleware.ts` — accepts an array of allowed roles; returns `403 Forbidden` if `req.user.role` is not in the list.
- Example: `router.patch('/:id/approve', authMiddleware, roleMiddleware(['SUPER_ADMIN', 'SB_TREASURER']), approveTransaction);`

**Frontend** (`context/AuthContext.tsx`, `App.tsx`):
- `ProtectedRoute` wrapper in `App.tsx` checks `isAuthenticated` and optionally `hasRole(...allowedRoles)`.
- UI elements (buttons, sections, menu items) are conditionally rendered using `user.role` checks from `useAuth()`.
- Data fetched from API is already role-filtered server-side; frontend applies an additional layer for UI consistency.

### Seed Users (default password: `password123`)

| Email | Role |
|---|---|
| `admin@ieee.org` | SUPER_ADMIN |
| `treasurer@ieee.org` | SB_TREASURER |
| `cs@ieee.org` | SOCIETY_ADMIN (Computer Society) |

---

## 9. Database Schema (MongoDB)

### Users Collection

```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required, lowercase),
  password: String (bcrypt hashed, required),
  role: Enum['SUPER_ADMIN', 'SB_TREASURER', 'SOCIETY_ADMIN', 'VIEWER'],
  societyId: String (optional — links SOCIETY_ADMIN to their society),
  createdAt: Date (auto)
}
```

### Societies Collection

```typescript
{
  _id: ObjectId,
  societyKey: String (unique short identifier e.g. 'cs', 'ras'),
  name: String (full name),
  shortName: String (abbreviation e.g. 'IEEE CS'),
  budget: Number (initial allocation),
  balance: Number (current remaining balance — auto-updated on transactions),
  officeBearers: [{
    id: String, name, position, email, phone
  }],
  members: [{
    id: String, ieeeId, name, email, contactNumber, grade
  }],
  logo: String (URL or base64),
  advisorSignature: String (URL or base64)
}
```

### Transactions Collection

```typescript
{
  _id: ObjectId,
  societyId: String (indexed),
  amount: Number (positive),
  type: Enum['INCOME', 'EXPENSE'],
  category: String (from predefined lists),
  description: String,
  date: Date,
  status: Enum['Pending', 'Approved'] (default: Pending),
  approvedBy: String (User ID, optional),
  receiptUrl: String (Google Drive webViewLink, optional),
  createdAt: Date (auto)
}
```

### Events Collection

```typescript
{
  _id: ObjectId,
  societyId: String (indexed),
  title, date, time?, venue?, type, participants (Number),
  description, outcome, collaboration?,
  images: [String] (URLs),
  speakers: [{name, designation, organization, presentationTitle, profileText}],
  participantType?, highlights?, takeaways?, followUpPlan?,
  organizerName?, organizerDesignation?,
  createdAt: Date (auto)
}
```

### Projects Collection

```typescript
{
  _id: ObjectId,
  societyId: String,
  title, category: Enum['TECHNICAL_PROJECT','TRAVEL_GRANT','SCHOLARSHIP','AWARD'],
  sanctioningBody, amountSanctioned (Number), startDate,
  status: Enum['PROPOSED','ONGOING','COMPLETED','CANCELLED','ANNOUNCED','AWARDED'],
  description,
  createdAt: Date (auto)
}
```

### CalendarEvents Collection

```typescript
{
  _id: ObjectId,
  societyId: String,
  title, date (YYYY-MM-DD), time?, venue?, description,
  status: Enum['PROPOSED','CONFIRMED','COMPLETED','CANCELLED'],
  createdAt: Date (auto)
}
```

### Announcements Collection

```typescript
{
  _id: ObjectId,
  title, message, date,
  senderName: String,
  societyId: String (optional — origin society for SOCIETY-targeted),
  targetAudience: Enum['ALL','LEADERSHIP','SOCIETY'],
  createdAt: Date (auto)
}
```

---

## 10. All Features — Implemented & Planned

### ✅ Fully Implemented Features

#### Authentication & Security
- [x] JWT-based login with access + refresh token pair
- [x] Automatic token refresh on 401 responses (transparent to user)
- [x] Session persistence across page reloads via `localStorage`
- [x] Password hashing with bcryptjs (salt rounds: 12)
- [x] Helmet security headers (X-Frame-Options, HSTS, CSP, etc.)
- [x] Global rate limiting (200 requests per 15 minutes per IP)
- [x] CORS configured for `localhost:5173` (dev) and `FRONTEND_URL` (prod)
- [x] Input validation on all API endpoints using express-validator

#### Role-Based Access Control
- [x] 4-tier role system (SUPER_ADMIN, SB_TREASURER, SOCIETY_ADMIN, VIEWER)
- [x] Route-level role middleware on all protected API endpoints
- [x] Frontend `ProtectedRoute` wrapper for page-level access control
- [x] UI elements conditionally rendered by role
- [x] Society-scoped data isolation for SOCIETY_ADMIN

#### Financial Management
- [x] Record income and expense transactions with categories and descriptions
- [x] Automatic society balance updates on transaction add/delete
- [x] Transaction approval workflow (Pending → Approved) by Treasurer/Admin
- [x] Society budget allocation and editing (Admin only)
- [x] Budget utilization percentage tracking with progress bars
- [x] Transaction edit and delete (role-restricted)

#### Dashboard & Analytics
- [x] 4 KPI metric cards (Balance, Income, Expenditure, Utilization)
- [x] Bar chart: top 10 societies by budget allocation (admin view)
- [x] Pie chart: expense category breakdown (society view)
- [x] Bar chart: income vs expenditure ratio (society view)
- [x] Area chart: monthly financial flow for calendar year (all views)
- [x] Society selector for monthly flow chart (admin only)
- [x] AI-powered financial audit panel (Gemini AI — model name needs fix)

#### IEEE Units Management
- [x] 40 Technical Societies pre-configured with default budgets
- [x] 4 Affinity Groups (WIE, YP, SIGHT, Life Members)
- [x] 5 IEEE Councils (Sensors, Biometrics, Nano, Systems, CEDA)
- [x] Office bearer management (full CRUD per society with positions)
- [x] Member registry (full CRUD with IEEE ID and grade)
- [x] Society logo and advisor signature upload + download
- [x] Balance availability badge with colour coding (red < 20%)

#### Event Reporting
- [x] Create detailed event reports with all required fields for university submission
- [x] Speaker management (add multiple speakers per event with full profiles)
- [x] Multi-image upload per event
- [x] One-click PDF export with full branding (institution logo, society logo, advisor signature)
- [x] Branded PDF includes: header, general info table, description, outcomes, speakers table, images
- [x] Role-scoped event visibility

#### Projects & Grants
- [x] Technical Projects registration and tracking
- [x] Travel Grant records
- [x] Scholarship records
- [x] Recognition Awards registry
- [x] Status lifecycle management (Proposed → Ongoing → Completed/Awarded)
- [x] Search and filter across all project categories

#### Activity Calendar
- [x] Interactive monthly grid calendar
- [x] Click any day to add an event pre-filled with that date
- [x] Colour-coded event badges by status (Proposed/Confirmed/Completed/Cancelled)
- [x] Month navigation (prev/next/today)
- [x] Status legend display
- [x] Admin filter by society; Society Admins see own society only

#### Announcements
- [x] Create broadcasts with 3 audience scopes (All Members, Leadership, Society)
- [x] Reverse chronological timeline with sender info and formatted dates
- [x] One-click email broadcast using `mailto:` with auto-assembled BCC recipients
- [x] Role-based visibility filtering (users see only relevant announcements)
- [x] Delete (by sender or admin)

#### Reports & Exports
- [x] Financial Ledger CSV export (branded with institution metadata)
- [x] Budget Utilization Summary CSV (admin only)
- [x] Activity Archive CSV export (all event reports)
- [x] Print-ready Quarterly Board Statement (CSS print stylesheet)
- [x] Role-scoped data in all exports

#### Branding Repository
- [x] University master logo upload/manage (admin only)
- [x] Per-society logo and advisor signature management
- [x] Download individual assets
- [x] Compliance status badge per society
- [x] Auto-embed logos in PDF event reports

#### Data Management (Backup)
- [x] Local JSON export of entire application state
- [x] Local JSON import with validation and confirmation dialog
- [x] Session preservation on import (current user not overwritten)

#### Infrastructure
- [x] Docker Compose for local development (MongoDB + backend + frontend)
- [x] Google Drive service on backend (upload, create folder, delete file)
- [x] File upload endpoint (Multer → Google Drive, with graceful mock fallback)
- [x] Seed script for test users and societies
- [x] Backend RBAC and auth integration tests (Jest + Supertest + in-memory MongoDB)
- [x] Health check endpoint

---

### ⚠️ Partially Implemented Features

| Feature | What Works | What's Missing |
|---|---|---|
| **Google Drive Cloud Sync** | Server-side service exists; file upload via API works | Frontend `BackupPage` shows an alert instead of calling `/api/upload/sync` |
| **Gemini AI Insights** | Correct API call structure, UI works | Wrong model name (`gemini-3-flash-preview`); silent error fallback |
| **Password Reset** | `PasswordResetModal.tsx` UI exists | Backend `POST /api/auth/reset-password` endpoint not implemented |

---

### ❌ Not Yet Implemented

| Feature | Description |
|---|---|
| **CI/CD Pipeline** | No GitHub Actions workflows for lint → test → build → deploy |
| **Netlify Configuration** | `netlify.toml` is completely empty; SPA routing will break on deploy |
| **ESLint + Prettier** | No code style enforcement or auto-formatting configured |
| **Frontend Tests** | Zero test coverage for React components |
| **Structured Logging** | Only `console.log/error`; no Winston/Pino for production |
| **Error Toast Notifications** | Errors shown via `alert()` dialogs instead of toast components |
| **API Documentation** | No Swagger/OpenAPI docs for backend endpoints |
| **Production Dockerfiles** | No multi-stage Dockerfiles for production container images |
| **Token Revocation / Blacklist** | JWT tokens cannot be invalidated before expiry |
| **Email Service** | No real email integration (only `mailto:` browser workaround) |

---

## 11. Deployment & Infrastructure

### Development (Local — Docker)

```bash
# Start entire stack instantly
docker-compose up --build

# Services exposed:
# UI:  http://localhost:5173
# API: http://localhost:5000/api
# DB:  mongodb://localhost:27017
```

### Development (Manual)

```bash
# Terminal 1 — Backend
cd server
npm install
cp .env.example .env
# Edit .env with MONGO_URI and JWT secrets
npm run seed     # Creates test users and societies
npm run dev      # Starts ts-node-dev on port 5000

# Terminal 2 — Frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api
npm run dev      # Starts Vite dev server on port 5173
```

### Required Environment Variables

**Backend (`server/.env`)**:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ieee-finance
JWT_SECRET=<generate-with-openssl-rand-base64-64>
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-64>
JWT_REFRESH_EXPIRY=30d
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=<drive-folder-id>
FRONTEND_URL=https://yourdomain.com
```

**Frontend (`.env`)**:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
API_KEY=<gemini-api-key>
```

### Production Deployment Options

| Option | Frontend | Backend | Database |
|---|---|---|---|
| **Docker (Recommended)** | Docker container | Docker container | MongoDB Atlas |
| **Netlify + Railway** | Netlify (static) | Railway/Render/Heroku | MongoDB Atlas |
| **Cloud (AWS/GCP/Azure)** | CloudFront/CDN | EC2/Cloud Run | MongoDB Atlas |

---

## 12. Known Issues & Technical Debt

### 🔴 Critical (Must Fix Before Production)

| # | Issue | File | Fix |
|---|---|---|---|
| 1 | `netlify.toml` is empty | `netlify.toml` | Add `[build] command = "npm run build"`, `publish = "dist"`, and SPA redirect rule |
| 2 | Wrong Gemini model name | `services/geminiService.ts:47` | Change `gemini-3-flash-preview` → `gemini-1.5-flash` |
| 3 | Cloud sync button shows alert | `components/BackupPage.tsx:32` | Replace alert stub with actual `apiClient.post('/upload/sync', {})` call |
| 4 | Password reset endpoint missing | `server/src/routes/authRoutes.ts` | Implement `POST /api/auth/reset-password` |
| 5 | Hardcoded JWT secrets in docker-compose | `docker-compose.yml:25-27` | Move to `.env` file referenced by `env_file:` directive |
| 6 | No CI/CD pipeline | — | Create `.github/workflows/ci.yml` for test → build |

### 🟡 Medium Priority (Quality)

| # | Issue | File | Fix |
|---|---|---|---|
| 7 | No ESLint or Prettier | Root `package.json` | Add `@typescript-eslint/eslint-plugin`, `prettier` |
| 8 | `any` type casts | Multiple components | Replace `role as any` with `role as UserRole` |
| 9 | `alert()` for all errors | `hooks/useAppData.ts` + others | Add a toast notification library (e.g. `react-hot-toast`) |
| 10 | No frontend tests | — | Add Vitest + React Testing Library |
| 11 | No structured logging | `server/src/` | Replace `console.log/error` with `winston` or `pino` |
| 12 | `process as any` in vite config | `vite.config.ts:8` | Use `process.cwd()` properly typed |

### 🟢 Low Priority (Enhancements)

| # | Enhancement |
|---|---|
| 13 | Add MongoDB indexes: `db.transactions.createIndex({ societyId: 1, date: -1 })` |
| 14 | Implement Swagger/OpenAPI docs at `/api/docs` |
| 15 | Add Redis caching for society data (frequently read, rarely updated) |
| 16 | Virtual scrolling for large transaction tables |
| 17 | Lazy load modal components with React.lazy |
| 18 | Add Sentry for frontend error tracking |
| 19 | Add token blacklist/revocation mechanism |
| 20 | Full end-to-end tests with Cypress or Playwright |

---

## 13. Quick Start Guide

### Prerequisites

- Node.js v18+
- Docker & Docker Compose (recommended)
- MongoDB Atlas account (for production)
- Google Cloud Service Account JSON (for Drive uploads)
- Gemini API key (for AI insights)

### One-Command Start

```bash
# Clone and start everything
git clone <repo-url>
cd Automation-Version-1
docker-compose up --build
```

### Manual Setup

```bash
# 1. Install all dependencies
npm install
cd server && npm install && cd ..

# 2. Configure environment
cp .env.example .env                # Frontend (add API_KEY for Gemini)
cp server/.env.example server/.env  # Backend (add MONGO_URI, JWT secrets)

# 3. Seed the database
cd server && npm run seed && cd ..

# 4. Start backend (Terminal 1)
cd server && npm run dev

# 5. Start frontend (Terminal 2)
npm run dev
```

### Running Tests

```bash
cd server
npm test
```

### Building for Production

```bash
# Frontend build
npm run build        # Output: dist/

# Backend build
cd server
npm run build        # Output: dist/server.js
npm start            # Serve from dist/
```

### Default Login Credentials

| Email | Password | Role |
|---|---|---|
| `admin@ieee.org` | `password123` | Super Admin |
| `treasurer@ieee.org` | `password123` | SB Treasurer |
| `cs@ieee.org` | `password123` | Society Admin (Computer Society) |

---

*This document was generated by analysing the full codebase including all frontend components, backend routes, database schemas, configuration files, and existing documentation.*
