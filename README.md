# IEEE Finance Pro v3.0

A high-performance financial management and event coordination platform for IEEE Student Branches, built on the PERN stack (PostgreSQL, Express, React, Node) with Supabase integration.

## Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Radix UI, Framer Motion.
- **Backend**: Express 5, Prisma ORM, PostgreSQL.
- **Auth & Storage**: Supabase.
- **AI**: Google Gemini 1.5 Flash for financial auditing.

## Project Structure

- `/client`: React frontend application.
- `/server`: Express backend application with Prisma schema.
- `.github/workflows`: CI/CD configuration.
- `.husky`: Git hooks for linting and typechecking.

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL instance (or Supabase project)
- Supabase account for Auth and Storage

### Setup

1. **Clone the repository**
2. **Setup Server**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update .env with your DATABASE_URL and other secrets
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```
3. **Setup Client**:
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Update .env with your VITE_API_BASE_URL and Supabase keys
   npm run dev
   ```

## CI/CD

The project includes a GitHub Actions workflow that:
- Lints and typechecks the client.
- Builds the client.
- Builds the server.
- Runs server-side tests using Vitest and a PostgreSQL service container.

## License

IEEE Christ University Student Branch.
