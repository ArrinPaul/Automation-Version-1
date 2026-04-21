# IEEE Finance Pro — Technical Audit & Migration Report

## 1. INVENTORY

### Frontend (Root directory)
- `App.tsx`: Main routing and layout orchestration.
- `index.tsx`: React entry point.
- `constants.ts`: IEEE society lists and categories.
- `types.ts`: TypeScript interfaces (mostly used for state).
- `components/`: 21 components/pages (Dashboard, Transactions, etc.).
- `context/`: `AuthContext` and `AppContext`.
- `hooks/`: `useAppData` (fetching logic).
- `services/`: API client and Gemini service.

### Backend (`server/`)
- `src/server.ts`: Entry point.
- `src/index.ts`: Express app config.
- `src/models/`: 7 Mongoose schemas.
- `src/controllers/`: Business logic for all entities.
- `src/routes/`: API routing.
- `src/middleware/`: Auth and role checks.
- `src/services/`: Google Drive service.
- `src/scripts/seed.ts`: Database seeder.

### Configuration & Tooling
- `package.json`: Dependencies.
- `tsconfig.json`: TS config.
- `docker-compose.yml`: Local dev setup.
- `netlify.toml`: Deployment config (empty).

---

## 2. SECURITY VULNERABILITIES

- **CRITICAL**: Hardcoded JWT secrets in `docker-compose.yml`.
- **HIGH**: No input validation for some file upload paths.
- **MEDIUM**: Missing rate limiting on sensitive password reset UI (though backend has some).
- **MEDIUM**: Application-level RBAC filtering (easily bypassed if controller logic is missed).
- **LOW**: `any` type casts everywhere in frontend, hiding potential null-pointer bugs.

---

## 3. BROKEN OR INCOMPLETE FEATURES

- **Google Drive Sync**: Frontend `BackupPage.tsx` uses `alert()` instead of API calls.
- **Gemini AI**: Incorrect model name `gemini-3-flash-preview` leads to failure.
- **Password Reset**: Frontend UI exists, but backend endpoint `POST /api/auth/reset-password` is missing.
- **Netlify Deploy**: `netlify.toml` is empty; SPA routing will fail.

---

## 4. DATA MODEL ANALYSIS

Current: MongoDB (Document-based).
- **Users**: Linked to `societyId`.
- **Transactions**: Linked to `societyId`.
- **Events**: Linked to `societyId`.
- **Issue**: Lack of foreign key constraints leads to orphaned records if a society is deleted.
- **Issue**: Decimal precision for financial data is handled as `Number`, which can lead to floating point errors.

---

## 5. RBAC ANALYSIS

- **Gaps**: `SOCIETY_ADMIN` can theoretically access other society data if `societyId` check is missing in any controller.
- **New Requirement**: We need strict isolation where `FACULTY_ADVISOR` and `SOCIETY_OB` cannot see transaction line items.

---

## 6. MIGRATION READINESS (MERN to PERN)

- **Users**: Migrating to Supabase Auth. Need to link `auth.users` to a `public.profiles` table via UUID.
- **Societies**: Easy migration to a fixed relational table.
- **Transactions**: Must use `Decimal` type in PostgreSQL.
- **Files**: Moving from Google Drive (broken) to Supabase/S3.

---

## 7. DEPENDENCY AUDIT

- **Outdated**: React 19 is used, but some libraries might have peer dependency issues (checked: looks okay).
- **Vulnerable**: `axios` version is stable but should be updated to latest.
- **Replacement**: `ts-jest` -> `vitest`. `mongoose` -> `prisma`.

---

## 8. CODE QUALITY

1. **Prop Drilling**: Solved partially by Context, but Context is becoming a "God Object".
2. **Error Handling**: Excessive use of `alert()`.
3. **Type Safety**: High usage of `any`.
4. **Logic Duplication**: Society filtering logic repeated across multiple controllers.
5. **Lack of Tests**: No frontend testing.
6. **Hardcoded Strings**: Categories and roles hardcoded in many places.

---
*Audit Completed: April 2026*
