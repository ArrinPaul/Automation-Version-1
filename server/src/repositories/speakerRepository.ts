import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const speakerRepository = {
  async findAll(where: any) {
    return prisma.speaker.findMany({
      where,
      include: { event: true },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.speaker.findUnique({
      where: { id },
      include: { event: true },
    });
  },

  async create(data: any) {
    return prisma.speaker.create({
      data,
      include: { event: true },
    });
  },

  async update(id: string, data: any) {
    return prisma.speaker.update({
      where: { id },
      data,
      include: { event: true },
    });
  },

  async delete(id: string) {
    return prisma.speaker.delete({ where: { id } });
  }
};
