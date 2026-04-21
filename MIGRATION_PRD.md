# IEEE Finance Pro — PRD & Progress Ledger (PERN Migration)

## 1. Project Overview
**IEEE Finance Pro** is being migrated from a MERN (MongoDB, Express, React, Node) stack to a high-performance, production-grade PERN (PostgreSQL, Express, React, Node) stack powered by Supabase and Prisma. This migration aims for a 10+ year lifespan with strict financial controls and a distinctive technical aesthetic.

## 2. Technical Audit (Current State)
- **Frontend**: React 19, custom Tailwind components. High use of `any` types.
- **Backend**: Express with Mongoose. RBAC is present but relies on application-level filtering which is prone to leaks.
- **Auth**: Custom JWT implementation.
- **Storage**: Partial Google Drive integration (mostly stubbed/broken).
- **Database**: NoSQL (MongoDB). Relations are handled manually in code.

## 3. Aesthetic Direction: "Cyber-Engineering & Technical Brutalism"
To move away from generic "AI-slop" aesthetics, IEEE Finance Pro will adopt a distinctive visual identity:
- **Typography**:
  - **Display**: `Syncopate` (Geometric, wide, technical)
  - **Data**: `JetBrains Mono` (Coding clarity for financial figures)
  - **Body**: `Plus Jakarta Sans` (Modern, clean)
- **Color Palette**:
  - `Background`: Obsidian (#0A0A0C)
  - `Primary`: Electric Blue (#00629B - IEEE Identity)
  - `Accent`: Acid Green (#C1FF00) for "Income" and "Approved"
  - `Warning`: Industrial Orange (#FF6B00)
- **Visual Elements**:
  - 0.5px hairline borders.
  - Dot-grid backgrounds (`bg-dot-white/[0.2]`).
  - Staggered Framer Motion reveals.
  - Monospace typing effects for KPI counters.

## 4. New RBAC Mapping (4-Tier)
| Role | Old Role Equivalent | Scope | Key Constraint |
|---|---|---|---|
| **MANAGEMENT** | SUPER_ADMIN / SB_TREASURER | Global | Full Access |
| **FACULTY_ADVISOR** | New / SOCIETY_ADMIN | Society-scoped | **No Transaction Details** (Balance Only) |
| **SOCIETY_OB** | OFFICE_BEARER | Society-scoped | **No Transaction Details**, No role management |
| **MEMBER** | VIEWER | Public/Event | No financial data access |

## 5. Migration Roadmap
- **Phase 1**: Infrastructure & Scaffolding (Prisma, Supabase, Folder Structure).
- **Phase 2**: Auth & Strict RBAC Middleware.
- **Phase 3**: Backend API with Dual-Storage (Supabase + AWS S3).
- **Phase 4**: Frontend Redesign (shadcn/ui + High-Fidelity components).
- **Phase 5**: AI Financial Auditor (Gemini 1.5 Flash).
- **Phase 6**: Quality & Security Hardening.

## 6. Inventory & Migration Status
| Entity | Migration Status | Strategy |
|---|---|---|
| Users | Pending | Supabase Auth + Prisma Profile |
| Societies | Pending | Relational model with 49 entries |
| Transactions | Pending | ACID compliant Decimal types |
| Events | Pending | Multi-image support (S3) |
| Storage | Pending | Supabase (small) / S3 (large) |

## 7. Design Tokens (Tailwind Configuration)
| Token | Value |
|---|---|
| `--background` | `hsl(240 10% 3.9%)` |
| `--primary` | `hsl(201 100% 30%)` |
| `--accent` | `hsl(75 100% 50%)` |
| `--font-display` | `Syncopate` |
| `--font-mono` | `JetBrains Mono` |

---
*Created: April 2026 | Tech Lead: Jules*
