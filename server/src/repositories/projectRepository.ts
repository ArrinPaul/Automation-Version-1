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

  async create(data: any) {
    return prisma.project.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.project.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  }
};
