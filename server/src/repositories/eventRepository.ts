import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const eventRepository = {
  async findAll(where: any) {
    return prisma.event.findMany({
      where,
      include: { speakers: true, society: true },
      orderBy: { date: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { speakers: true, society: true },
    });
  },

  async create(data: any) {
    const { speakers, ...eventData } = data;
    return prisma.event.create({
      data: {
        ...eventData,
        speakers: {
          create: speakers
        }
      },
      include: { speakers: true }
    });
  },

  async update(id: string, data: any) {
    const { speakers, ...eventData } = data;
    return prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        speakers: speakers ? {
          deleteMany: {},
          create: speakers
        } : undefined
      },
      include: { speakers: true }
    });
  },

  async delete(id: string) {
    return prisma.event.delete({ where: { id } });
  }
};
