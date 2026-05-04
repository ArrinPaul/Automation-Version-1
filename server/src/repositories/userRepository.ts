import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export const userRepository = {
  async findAll() {
    return prisma.user.findMany();
  },

  async findAllWithSociety() {
    return prisma.user.findMany({
      include: { society: { select: { id: true, name: true, shortName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findByIdWithSociety(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { society: true }
    });
  },

  async findByEmailWithSociety(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { society: true }
    });
  },

  async createWithExternalId(data: {
    id: string;
    email: string;
    name: string;
    role: Role;
    societyId?: string | null;
  }) {
    return prisma.user.create({ data });
  },

  async deleteById(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  async updateRoleAndSociety(userId: string, role: Role, societyId?: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        role,
        societyId: societyId ?? null,
      }
    });
  }
};
