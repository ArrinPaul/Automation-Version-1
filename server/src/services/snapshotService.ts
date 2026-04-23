import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const JsonRecordSchema = z.record(z.string(), z.unknown());
const JsonRecordArraySchema = z.array(JsonRecordSchema);

const SnapshotSchema = z.object({
  meta: z.object({
    generatedAt: z.string().datetime(),
    schemaVersion: z.string().min(1),
    source: z.literal('postgresql'),
  }),
  counts: z.object({
    users: z.number().int().nonnegative(),
    societies: z.number().int().nonnegative(),
    transactions: z.number().int().nonnegative(),
    events: z.number().int().nonnegative(),
    speakers: z.number().int().nonnegative(),
    projects: z.number().int().nonnegative(),
    calendarEvents: z.number().int().nonnegative(),
    announcements: z.number().int().nonnegative(),
    officeBearers: z.number().int().nonnegative(),
    members: z.number().int().nonnegative(),
    auditLogs: z.number().int().nonnegative(),
  }),
  data: z.object({
    users: JsonRecordArraySchema,
    societies: JsonRecordArraySchema,
    transactions: JsonRecordArraySchema,
    events: JsonRecordArraySchema,
    speakers: JsonRecordArraySchema,
    projects: JsonRecordArraySchema,
    calendarEvents: JsonRecordArraySchema,
    announcements: JsonRecordArraySchema,
    officeBearers: JsonRecordArraySchema,
    members: JsonRecordArraySchema,
    auditLogs: JsonRecordArraySchema,
  }),
});

export type SystemSnapshot = z.infer<typeof SnapshotSchema>;

const toJsonRecords = <T extends object>(rows: T[]) => {
  return rows as Record<string, unknown>[];
};

export const generateSystemSnapshot = async (): Promise<SystemSnapshot> => {
  const [
    users,
    societies,
    transactions,
    events,
    speakers,
    projects,
    calendarEvents,
    announcements,
    officeBearers,
    members,
    auditLogs,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.society.findMany(),
    prisma.transaction.findMany(),
    prisma.event.findMany(),
    prisma.speaker.findMany(),
    prisma.project.findMany(),
    prisma.calendarEvent.findMany(),
    prisma.announcement.findMany(),
    prisma.officeBearer.findMany(),
    prisma.member.findMany(),
    prisma.auditLog.findMany(),
  ]);

  const snapshotCandidate = {
    meta: {
      generatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      source: 'postgresql' as const,
    },
    counts: {
      users: users.length,
      societies: societies.length,
      transactions: transactions.length,
      events: events.length,
      speakers: speakers.length,
      projects: projects.length,
      calendarEvents: calendarEvents.length,
      announcements: announcements.length,
      officeBearers: officeBearers.length,
      members: members.length,
      auditLogs: auditLogs.length,
    },
    data: {
      users: toJsonRecords(users),
      societies: toJsonRecords(societies),
      transactions: toJsonRecords(transactions),
      events: toJsonRecords(events),
      speakers: toJsonRecords(speakers),
      projects: toJsonRecords(projects),
      calendarEvents: toJsonRecords(calendarEvents),
      announcements: toJsonRecords(announcements),
      officeBearers: toJsonRecords(officeBearers),
      members: toJsonRecords(members),
      auditLogs: toJsonRecords(auditLogs),
    },
  };

  return SnapshotSchema.parse(snapshotCandidate);
};
