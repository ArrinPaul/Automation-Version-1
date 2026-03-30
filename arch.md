# IEEE Finance Pro - Architecture Transition Plan (arch.md)

## 1. Project Overview
Transitioning the current local-first IEEE Finance Pro application into a robust, scalable, and secure full-stack application.

- **Current State**: React SPA with `localStorage` persistence and manual Google Drive sync.
- **Future State**: MERN Stack (MongoDB, Express, React, Node.js) with JWT authentication, Role-Based Access Control (RBAC), and automated Google Drive cloud storage for documents.

---

## 2. Technical Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for password hashing.
- **Cloud Storage**: Google Drive API (via Service Account for automated document management).
- **Security**: Helmet, CORS, Rate Limiting, and JWT-based middleware.

---

## 3. System Architecture
```text
[ Client: React ] <--- HTTPS/REST ---> [ Server: Node/Express ]
                                          |          |
                                          |      [ MongoDB: Data Store ]
                                          |
                                   [ Google Drive API: File Storage ]
```

---

## 4. Role-Based Access Control (RBAC)
The system will feature 4 distinct roles with specific permissions:

| Role | Access Level | Permissions |
| :--- | :--- | :--- |
| **Super Admin** | Full System | Manage all users, all societies, system settings, and global finances. |
| **SB Treasurer** | Financial Lead | View/Modify all transactions, approve budgets, and generate branch-wide reports. |
| **Society Admin** | Society Lead | Manage their specific Society (e.g., Computer Society), members, and transactions. |
| **Viewer** | Read-Only | View dashboards, announcements, and reports for their assigned society. |

---

## 5. Database Schema (MongoDB/Mongoose)

### Collections:
1. **Users**: `_id, name, email, password, role, societyId, createdAt`.
2. **Societies**: `_id, name, shortName, totalBudget, currentBalance, officeBearers, members`.
3. **Transactions**: `_id, societyId, amount, type (Income/Expense), category, description, date, status (Pending/Approved), receiptUrl (Google Drive Link)`.
4. **Events**: `_id, societyId, title, date, description, participants, speakerDetails, reportUrl`.
5. **Projects**: `_id, societyId, title, budget, status, description`.
6. **Announcements**: `_id, title, message, targetAudience, senderId, date`.

---

## 6. Authentication & Security (JWT)
1. **Login**: User submits credentials -> Server validates -> Server signs a JWT with `userId` and `role`.
2. **Authorization**: JWT is sent in the `Authorization: Bearer <token>` header for all API requests.
3. **Middleware**:
   - `authMiddleware`: Verifies the JWT and attaches user info to the request object.
   - `roleMiddleware(['role1', 'role2'])`: Checks if the user's role has permission for the specific route.

---

## 7. Google Drive Integration (File Storage)
Instead of storing files locally or in MongoDB (which is inefficient for large binaries), we will use Google Drive:
- **Mechanism**: The backend will use a **Google Cloud Service Account**.
- **Process**:
  1. Frontend sends a file (e.g., receipt or generated PDF report) to the Backend.
  2. Backend uploads the file to a specific folder on Google Drive.
  3. Backend saves the **Google Drive File ID/Link** in the MongoDB document.

---

## 8. Scalability & Folder Structure
- **Stateless Authentication**: JWT allows horizontal scaling of backend servers.
- **Environment Separation**: Distinct configs for Development, Staging, and Production.
- **Modular Services**: Easy to swap Google Drive for AWS S3 or Gemini for another AI model if needed.

---

## 9. Implementation Phases
1. **Phase 1**: Setup Node/Express boilerplate and MongoDB connection.
2. **Phase 2**: Implement Auth (Signup/Login) and JWT middleware.
3. **Phase 3**: Migrate existing types to Mongoose models.
4. **Phase 4**: Build REST API endpoints for Societies, Transactions, and Reports.
5. **Phase 5**: Integrate Google Drive API for file uploads.
6. **Phase 6**: Refactor Frontend to use `axios` for API calls instead of `localStorage`.
7. **Phase 7**: Implement RBAC logic in Frontend UI components.
