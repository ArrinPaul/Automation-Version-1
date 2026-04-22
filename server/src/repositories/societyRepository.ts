import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const societyRepository = {
  async findAll(where: any) {
    return prisma.society.findMany({
      where,
      include: {
        _count: {
          select: { members: true, officeBearers: true, events: true }
        }
      }
    });
  },

  async findById(id: string) {
    return prisma.society.findUnique({
      where: { id },
      include: {
        members: true,
        officeBearers: true,
        events: { take: 5, orderBy: { date: 'desc' } },
        projects: true,
        _count: true
      }
    });
  },

  /**
   * Create a new society within a Prisma transaction to ensure ACID integrity.
   */
  async create(data: any) {
    return prisma.$transaction(async (tx) => {
      return tx.society.create({ data });
    });
  },

  /**
   * Update a society within a Prisma transaction to ensure ACID integrity.
   */
  async update(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      return tx.society.update({
        where: { id },
        data
      });
    });
  },

  /**
   * Delete a society within a Prisma transaction to ensure ACID integrity.
   * Cascading deletes are handled by Prisma cascade rules in schema.prisma.
   */
  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      return tx.society.delete({
        where: { id }
      });
    });
  }
};
