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

  async create(data: any) {
    return prisma.society.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.society.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.society.delete({
      where: { id }
    });
  }
};
