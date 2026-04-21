import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const officeBearerRepository = {
  async findAll(where: any) {
    return prisma.officeBearer.findMany({
      where,
      include: { society: true },
      orderBy: { name: 'asc' }
    });
  },

  async findById(id: string) {
    return prisma.officeBearer.findUnique({
      where: { id },
      include: { society: true }
    });
  },

  async create(data: any) {
    return prisma.officeBearer.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.officeBearer.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.officeBearer.delete({ where: { id } });
  }
};
