# IEEE Finance Pro — MERN Stack Application

## Current State
- **Version**: v1.0 (MERN Migration)
- **Status**: Backend complete, frontend wired, cleanup done
- **Build**: Frontend 0 TS errors | Backend 0 TS errors

## Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + Mongoose + JWT
- **Database**: MongoDB Atlas
- **Auth**: 4-role RBAC (Super Admin, SB Treasurer, Society Admin, Viewer)

## Quick Start
```bash
# Backend
cd server && npm install && npm run seed && npm run dev

# Frontend (separate terminal)
npm install && npm run dev
```

## Next Milestone Goals (v1.1)
- [ ] Google Drive service account integration
- [ ] App.tsx component decomposition
- [ ] E2E testing suite
- [ ] Deployment docs + Docker
- [ ] Gemini AI proxy migration to backend
