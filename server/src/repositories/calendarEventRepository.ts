import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const calendarEventRepository = {
  async findAll(where: any) {
    return prisma.calendarEvent.findMany({
      where,
      include: { society: true },
      orderBy: { date: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.calendarEvent.findUnique({
      where: { id },
      include: { society: true },
    });
  },

  async create(data: any) {
    return prisma.calendarEvent.create({
      data,
      include: { society: true },
    });
  },

  async update(id: string, data: any) {
    return prisma.calendarEvent.update({
      where: { id },
      data,
      include: { society: true },
    });
  },

  async delete(id: string) {
    return prisma.calendarEvent.delete({ where: { id } });
  }
};
