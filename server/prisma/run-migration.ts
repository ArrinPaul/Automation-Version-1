import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting role migration...');

  // Step 1: Add new enum values
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SB_FACULTY'`);
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SB_OB'`);
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SOCIETY_FACULTY'`);
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SOCIETY_CHAIR'`);
  console.log('New enum values added.');

  // Step 2: Migrate existing data
  const mgmt = await prisma.$executeRawUnsafe(`UPDATE users SET role = 'SB_FACULTY'::"Role" WHERE role = 'MANAGEMENT'::"Role"`);
  console.log(`Migrated ${mgmt} MANAGEMENT → SB_FACULTY`);

  const faculty = await prisma.$executeRawUnsafe(`UPDATE users SET role = 'SOCIETY_FACULTY'::"Role" WHERE role = 'FACULTY_ADVISOR'::"Role"`);
  console.log(`Migrated ${faculty} FACULTY_ADVISOR → SOCIETY_FACULTY`);

  const ob = await prisma.$executeRawUnsafe(`UPDATE users SET role = 'SOCIETY_CHAIR'::"Role" WHERE role = 'SOCIETY_OB'::"Role"`);
  console.log(`Migrated ${ob} SOCIETY_OB → SOCIETY_CHAIR`);

  // Step 3: Recreate the enum without old values
  // Postgres doesn't support DROP VALUE, so we swap the type
  await prisma.$executeRawUnsafe(`
    CREATE TYPE "Role_new" AS ENUM (
      'SB_FACULTY',
      'SB_OB',
      'SOCIETY_FACULTY',
      'SOCIETY_CHAIR',
      'SOCIETY_OB',
      'MEMBER'
    )
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE users ALTER COLUMN role TYPE "Role_new" USING role::text::"Role_new"`);
  await prisma.$executeRawUnsafe(`DROP TYPE "Role"`);
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role_new" RENAME TO "Role"`);
  console.log('Enum recreated with clean values.');

  console.log('Migration complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
