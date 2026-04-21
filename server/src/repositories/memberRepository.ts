import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const memberRepository = {
  async findAll(where: any) {
    return prisma.member.findMany({
      where,
      include: { society: true },
      orderBy: { name: 'asc' }
    });
  },

  async findById(id: string) {
    return prisma.member.findUnique({
      where: { id },
      include: { society: true }
    });
  },

  async create(data: any) {
    return prisma.member.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.member.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.member.delete({ where: { id } });
  }
};
