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
