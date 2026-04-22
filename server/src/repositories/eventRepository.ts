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

  /**
   * Create a new event with speakers within a Prisma transaction.
   * Ensures ACID integrity when creating event and associated speakers.
   */
  async create(data: any) {
    const { speakers, ...eventData } = data;
    return prisma.$transaction(async (tx) => {
      return tx.event.create({
        data: {
          ...eventData,
          speakers: speakers && speakers.length > 0 ? {
            create: speakers
          } : undefined
        },
        include: { speakers: true }
      });
    });
  },

  /**
   * Update an event and its speakers within a Prisma transaction.
   * Ensures ACID integrity when updating event and associated speakers.
   */
  async update(id: string, data: any) {
    const { speakers, ...eventData } = data;
    return prisma.$transaction(async (tx) => {
      return tx.event.update({
        where: { id },
        data: {
          ...eventData,
          speakers: speakers === undefined ? undefined : {
            deleteMany: {},
            create: speakers && speakers.length > 0 ? speakers : []
          }
        },
        include: { speakers: true }
      });
    });
  },

  /**
   * Delete an event and its associated speakers within a Prisma transaction.
   * Cascading deletes handled by Prisma cascade rules.
   */
  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      return tx.event.delete({ where: { id } });
    });
  }
};
