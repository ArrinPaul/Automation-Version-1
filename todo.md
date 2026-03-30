# IEEE Finance Pro - Full-Stack Migration Roadmap

## 🟩 Phase 1: Backend Initialization
- [ ] Initialize Node.js project in a `/server` directory.
- [ ] Install core dependencies: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `morgan`.
- [ ] Configure MongoDB Atlas connection and Mongoose models based on `arch.md`.
- [ ] Implement global error handling middleware.

## 🔐 Phase 2: Auth & RBAC (Security)
- [ ] Install `jsonwebtoken`, `bcryptjs`, and `express-validator`.
- [ ] Create `User` model with `role` and `societyId`.
- [ ] Implement `POST /api/auth/register` (Super Admin only).
- [ ] Implement `POST /api/auth/login` (Returns JWT).
- [ ] Create `authMiddleware` to protect routes.
- [ ] Create `roleMiddleware` to enforce RBAC permissions.

## 💾 Phase 3: Core API Development
- [ ] **Societies**: CRUD endpoints for IEEE units.
- [ ] **Transactions**: 
    - [ ] `POST /api/transactions` (with society-based validation).
    - [ ] `GET /api/transactions` (filtered by role/society).
    - [ ] `PATCH /api/transactions/:id/approve` (SB Treasurer/Admin only).
- [ ] **Events & Projects**: CRUD endpoints for activity tracking.
- [ ] **Announcements**: Role-based broadcast endpoints.

## ☁️ Phase 4: Google Drive Service Integration
- [ ] Setup Google Cloud Service Account and download `credentials.json`.
- [ ] Implement `googleDriveService.js` in the backend using `googleapis`.
- [ ] Create a file upload middleware using `multer`.
- [ ] Link successful uploads to MongoDB documents (saving `fileId` and `webViewLink`).

## 🎨 Phase 5: Frontend Refactoring
- [ ] Install `axios` and `react-router-dom`.
- [ ] Create an `apiClient` utility with interceptors for JWT injection.
- [ ] Replace `localStorage` logic in `App.tsx` with API calls.
- [ ] Implement a global `AuthContext` to manage user sessions and roles.
- [ ] Update UI components to show/hide features based on `user.role`.

## 🧪 Phase 6: Testing & Validation
- [ ] Perform RBAC cross-testing (verify Viewer cannot create transactions).
- [ ] Validate file uploads actually land in the designated Google Drive folder.
- [ ] Test system scalability with large datasets in MongoDB.
- [ ] Final security audit (No secrets in code, Helmet headers active).

## 🚀 Phase 7: Deployment Ready
- [ ] Prepare `.env.example` for both Frontend and Backend.
- [ ] Update `README.md` with new installation and setup instructions.
- [ ] (Optional) Setup Docker Compose for easy local development.
