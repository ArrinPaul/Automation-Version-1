import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditLogRepository = {
  async create(data: {
    userId: string;
    action: string;
    resource: string;
    details?: Prisma.InputJsonValue;
  }) {
    return prisma.auditLog.create({ data });
  },

  async findAll(where: Prisma.AuditLogWhereInput = {}) {
    return prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
