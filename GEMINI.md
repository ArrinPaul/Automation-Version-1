# 🤖 GEMINI.md: IEEE Finance Pro v3.0

## Project Identity
**IEEE Finance Pro** is an enterprise-grade financial and event management system for IEEE Student Branches.
- **Current Version**: 3.0.0 (PERN Migration)
- **Aesthetic**: Technical Brutalism / Cyber-Engineering (Syncopate/JetBrains Mono fonts, high-contrast, obsidian background).

## Technical Stack (Mandatory)
- **Frontend**: React 19, Vite 6, Tailwind CSS, Radix UI, Framer Motion, TanStack Query v5.
- **Backend**: Node.js/Express 5, Prisma ORM (PostgreSQL).
- **Auth/Storage**: Supabase (PostgreSQL, Auth, Storage).
- **AI**: Google Gemini 1.5 Flash.

## Core Mandates
1. **Financial Integrity**: All currency values MUST use `Prisma.Decimal` (Decimal 12,2). Never use floating point for money.
2. **RBAC Isolation**: 
   - `MANAGEMENT`: Global access.
   - `FACULTY_ADVISOR` & `SOCIETY_OB`: Society-scoped. Physically blocked from viewing transaction lists; balance only.
3. **Data Fetching**: Use `@tanstack/react-query` for all server state. No manual `useEffect` fetching.
4. **Consistency**: Follow the "Technical Brutalism" design language: 0.5px borders, monospace data points, and staggered reveals.

## Directory Structure
- `/client`: Frontend source.
- `/server`: Backend source + Prisma schema.
- `/server/prisma/schema.prisma`: The source of truth for all data models.

## AI Session Context
When helping with this project:
- Prioritize **type safety** (Zod for validation, strict TypeScript).
- Ensure **RBAC checks** are applied at the route, controller, and repository levels.
- Maintain the **monochromatic, engineering-first UI** style.
