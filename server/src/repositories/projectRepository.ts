import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const projectRepository = {
  async findAll(where: any) {
    return prisma.project.findMany({
      where,
      include: { society: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { society: true }
    });
  },

  /**
   * Create a new project within a Prisma transaction to ensure ACID integrity.
   */
  async create(data: any) {
    return prisma.$transaction(async (tx) => {
      return tx.project.create({ data });
    });
  },

  /**
   * Update a project within a Prisma transaction to ensure ACID integrity.
   */
  async update(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      return tx.project.update({
        where: { id },
        data
      });
    });
  },

  /**
   * Delete a project within a Prisma transaction to ensure ACID integrity.
   */
  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      return tx.project.delete({ where: { id } });
    });
  }
};
