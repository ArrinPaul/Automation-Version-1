import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const announcementRepository = {
  async findAll(where: any) {
    return prisma.announcement.findMany({
      where,
      include: { sender: true, society: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id: string) {
    return prisma.announcement.findUnique({
      where: { id },
      include: { sender: true, society: true }
    });
  },

  async create(data: any) {
    return prisma.announcement.create({ data });
  },

  async findRecipientEmails(id: string) {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        society: {
          select: {
            members: {
              select: {
                email: true,
              },
            },
            officeBearers: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!announcement) {
      return null;
    }

    const globalMemberEmails = announcement.targetAudience === 'ALL'
      ? await prisma.member.findMany({
          select: {
            email: true,
          },
        })
      : [];

    const leadershipEmails = announcement.targetAudience === 'LEADERSHIP'
      ? await prisma.user.findMany({
          where: {
            role: {
              in: ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB'],
            },
          },
          select: {
            email: true,
          },
        })
      : [];

    const societyScopedEmails = announcement.targetAudience === 'SOCIETY' && announcement.societyId
      ? [
          ...(announcement.society?.members ?? []),
          ...(announcement.society?.officeBearers ?? []),
        ]
      : [];

    const recipients = [
      ...globalMemberEmails,
      ...leadershipEmails,
      ...societyScopedEmails,
    ];

    return {
      announcement,
      emails: Array.from(
        new Set(
          recipients
            .map((recipient) => recipient.email.trim())
            .filter(Boolean)
        )
      ),
    };
  },

  async update(id: string, data: any) {
    return prisma.announcement.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.announcement.delete({ where: { id } });
  }
};
