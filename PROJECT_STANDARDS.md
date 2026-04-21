# ⚖️ PROJECT_STANDARDS.md: IEEE Finance Pro v3.0 (The Laws)

This document defines the mandatory technical and aesthetic rules for v3.0. **Feed this to any AI session first.**

---

## 🎨 1. Aesthetic: Technical Brutalism
- **Typography**: 
  - `Syncopate` (Headers)
  - `JetBrains Mono` (Data points, labels, numbers)
  - `Plus Jakarta Sans` (Body text)
- **Colors**: Obsidian (#0A0A0C) background, Electric Blue (#00629B), Acid Green (#C1FF00).
- **Visuals**: 0.5px hairline borders, dot-grid backgrounds, staggered Framer Motion reveals.

## 🔐 2. RBAC: 4-Tier Security Mapping
| Role | Access Level | Data Constraint |
| :--- | :--- | :--- |
| **MANAGEMENT** | Global | Full Access (Approve transactions, etc.) |
| **FACULTY_ADVISOR** | Society-scoped | **Balance Only** (No transaction line-items) |
| **SOCIETY_OB** | Society-scoped | **Balance Only** (No transaction line-items) |
| **MEMBER** | Public | Events & Calendar Only (No financial data) |

## 🛠️ 3. Mandatory Tech Stack
- **Database**: PostgreSQL (Prisma ORM).
- **Auth/Storage**: Supabase (PostgreSQL, Auth, Storage).
- **Financial Integrity**: Always use `Prisma.Decimal` (Decimal 12,2) for money. Never use floats.
- **Frontend State**: TanStack Query (React Query) v5. No manual `useEffect` fetching.
- **AI**: Google Gemini 1.5 Flash.

## 📁 4. Directory Structure
- `/client`: React 19 / Vite 6 / Tailwind.
- `/server`: Node.js / Express 5 / Prisma.
- `/server/prisma/schema.prisma`: The "Source of Truth" for all data.
