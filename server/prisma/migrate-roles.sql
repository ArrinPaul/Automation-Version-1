-- Step 1: Add new enum values to the existing Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SB_FACULTY';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SB_OB';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SOCIETY_FACULTY';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SOCIETY_CHAIR';

-- Step 2: Migrate existing data to new roles
UPDATE users SET role = 'SB_FACULTY'::"Role" WHERE role = 'MANAGEMENT'::"Role";
UPDATE users SET role = 'SOCIETY_FACULTY'::"Role" WHERE role = 'FACULTY_ADVISOR'::"Role";
UPDATE users SET role = 'SOCIETY_CHAIR'::"Role" WHERE role = 'SOCIETY_OB'::"Role";
-- MEMBER stays as MEMBER

-- Step 3: Drop old enum values (Postgres doesn't support DROP VALUE directly,
-- so we rename the type and recreate it)
-- We'll handle this by creating a new type and swapping

-- Create the final clean enum
CREATE TYPE "Role_new" AS ENUM (
  'SB_FACULTY',
  'SB_OB',
  'SOCIETY_FACULTY',
  'SOCIETY_CHAIR',
  'SOCIETY_OB',
  'MEMBER'
);

-- Swap the column type
ALTER TABLE users ALTER COLUMN role TYPE "Role_new" USING role::text::"Role_new";

-- Drop old type and rename new one
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
