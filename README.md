# IEEE Finance Pro (MERN Migration - v1.1)

A robust, full-stack financial ledger, event management, and scheduling application built specifically for IEEE Student Branches. 
It features a dark-mode first design, real-time metrics, Glassmorphism aesthetics, and strict Role-Based Access Control (RBAC).

## Architecture

* **Frontend**: React, TypeScript, Vite, TailwindCSS (Monolithic routing transitioned to AppContext patterns)
* **Backend**: Node.js, Express, Mongoose, JWT (RESTful Controllers & Routes)
* **Database**: MongoDB (Atlas or local via Docker)
* **Cloud Storage**: Google Drive API integration via Server Service Account.

## Getting Started

### Prerequisites
* Node.js v18+
* MongoDB
* Docker & Docker Compose (optional for simple booting)

### Quick Start (Dockerized)
Run the entire stack instantly.
\`\`\`bash
docker-compose up --build
\`\`\`
The application will be exposed at:
* UI: `http://localhost:5173`
* API: `http://localhost:5000/api`

### Quick Start (Manual)
#### 1. Setup Backend
\`\`\`bash
cd server
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT Secrets
npm run seed  # Generates test users & societies
npm run dev
\`\`\`

#### 2. Setup Frontend
\`\`\`bash
npm install
cp .env.example .env
# Ensure VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
\`\`\`

## RBAC System Details
Access is strictly modeled against 4 institutional roles:
- **Super Admin**: Total system control, user generation, global access.
- **SB Treasurer**: Reads all transactions, writes global approvals, can access financial dashboards.
- **Society Admin**: Limited strictly to specific society assigned to them for isolated autonomy.
- **Viewer**: Read-only oversight. Cannot write data.

*Defaults in seed script:* (Passwords: \`password123\`)
- `admin@ieee.org` (Super Admin)
- `treasurer@ieee.org` (SB Treasurer)
- `cs@ieee.org` (Society Admin - Computer Society)

## Testing
RBAC and backend logic behavior is verified through E2E integration specs running atop `mongodb-memory-server`.
\`\`\`bash
cd server
npm test
\`\`\`

## Google Drive Integration
Production file uploads stream robustly via the Backend. Configure `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` in the `.env` pointing to your `.json` service key to activate Google APIs. If disabled, upload mocks will be used.
