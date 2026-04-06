# IEEE Finance Pro - Full-Stack Migration Roadmap

## 🟩 Phase 1: Backend Initialization
- [x] Initialize Node.js project in a `/server` directory.
- [x] Install core dependencies: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `morgan`.
- [x] Configure MongoDB Atlas connection and Mongoose models based on `arch.md`.
- [x] Implement global error handling middleware.

## 🔐 Phase 2: Auth & RBAC (Security)
- [x] Install `jsonwebtoken`, `bcryptjs`, and `express-validator`.
- [x] Create `User` model with `role` and `societyId`.
- [x] Implement `POST /api/auth/register` (Super Admin only).
- [x] Implement `POST /api/auth/login` (Returns JWT).
- [x] Create `authMiddleware` to protect routes.
- [x] Create `roleMiddleware` to enforce RBAC permissions.

## 💾 Phase 3: Core API Development
- [x] **Societies**: CRUD endpoints for IEEE units.
- [x] **Transactions**: 
    - [x] `POST /api/transactions` (with society-based validation).
    - [x] `GET /api/transactions` (filtered by role/society).
    - [x] `PATCH /api/transactions/:id/approve` (SB Treasurer/Admin only).
- [x] **Events & Projects**: CRUD endpoints for activity tracking.
- [x] **Announcements**: Role-based broadcast endpoints.

## ☁️ Phase 4: Google Drive Service Integration
- [x] Setup Google Cloud Service Account and download `credentials.json`.
- [x] Implement `googleDriveService.js` in the backend using `googleapis`.
- [x] Create a file upload middleware using `multer`.
- [x] Link successful uploads to MongoDB documents (saving `fileId` and `webViewLink`).

## 🎨 Phase 5: Frontend Refactoring
- [x] Install `axios` and `react-router-dom`.
- [x] Create an `apiClient` utility with interceptors for JWT injection.
- [x] Replace `localStorage` logic in `App.tsx` with API calls.
- [x] Implement a global `AuthContext` to manage user sessions and roles.
- [x] Update UI components to show/hide features based on `user.role`.

## 🧪 Phase 6: Testing & Validation
- [x] Perform RBAC cross-testing (verify Viewer cannot create transactions).
- [x] Validate file uploads actually land in the designated Google Drive folder.
- [x] Test system scalability with large datasets in MongoDB.
- [x] Final security audit (No secrets in code, Helmet headers active).

## 🚀 Phase 7: Deployment Ready
- [x] Prepare `.env.example` for both Frontend and Backend.
- [x] Update `README.md` with new installation and setup instructions.
- [x] (Optional) Setup Docker Compose for easy local development.
