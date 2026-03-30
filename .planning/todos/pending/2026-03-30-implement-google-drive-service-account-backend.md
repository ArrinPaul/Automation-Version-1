---
created: 2026-03-30T21:58:00Z
title: Implement Google Drive service account integration on backend
area: api
files:
  - services/googleDriveService.ts
  - server/src/services/googleDriveService.ts (new)
  - server/src/middleware/uploadMiddleware.ts (new)
  - server/src/routes/uploadRoutes.ts (new)
---

## Problem

The current Google Drive integration (`services/googleDriveService.ts`) uses client-side OAuth with `gapi` and Google Identity Services. Per `arch.md` § 7, the architecture requires a **server-side Google Cloud Service Account** for automated document management. The current approach requires each user to authenticate with Google individually and exposes OAuth tokens in the browser. The backend should handle all file operations: receipt uploads, PDF report generation/storage, and returning Drive File IDs/Links to store in MongoDB.

## Solution

1. Setup Google Cloud Service Account with Drive API enabled.
2. Install `googleapis` and `multer` in backend.
3. Create `server/src/services/googleDriveService.ts`:
   - `uploadFile(buffer, filename, mimeType, folderId)` → returns `{ fileId, webViewLink }`
   - `deleteFile(fileId)` → removes from Drive
   - `createFolder(name, parentId?)` → organizes by society
4. Create `multer`-based upload middleware for handling multipart form data.
5. Create `POST /api/upload` endpoint that:
   - Receives file from frontend
   - Uploads to designated Drive folder (organized: `IEEE-Finance/[SocietyName]/receipts/`)
   - Returns `{ fileId, webViewLink }` to be saved in Transaction/Event documents
6. Add `GOOGLE_SERVICE_ACCOUNT_KEY` path to `.env`.
7. Deprecate client-side `googleDriveService.ts` once backend integration is complete.
