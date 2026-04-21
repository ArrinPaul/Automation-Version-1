import { PrismaClient, TransactionType, TxStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const transactionRepository = {
  async findAll(where: any) {
    return prisma.transaction.findMany({
      where,
      include: { society: true, createdBy: true },
      orderBy: { date: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      include: { society: true, createdBy: true },
    });
  },

  async create(data: any) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({ data });

      const amount = data.type === TransactionType.INCOME ? data.amount : -data.amount;

      await tx.society.update({
        where: { id: data.societyId },
        data: { balance: { increment: amount } },
      });

      return transaction;
    });
  },

  async update(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findUnique({ where: { id } });
      if (!oldTx) throw new Error('Transaction not found');

      const updatedTx = await tx.transaction.update({
        where: { id },
        data,
      });

      // Recalculate balance if amount or type changed
      if (data.amount !== undefined || data.type !== undefined) {
        const oldAmount = oldTx.type === TransactionType.INCOME ? oldTx.amount : -oldTx.amount;
        const newAmount = (data.type || oldTx.type) === TransactionType.INCOME
          ? (data.amount || oldTx.amount)
          : -(data.amount || oldTx.amount);

        const diff = Number(newAmount) - Number(oldAmount);

        await tx.society.update({
          where: { id: updatedTx.societyId },
          data: { balance: { increment: diff } },
        });
      }

      return updatedTx;
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findUnique({ where: { id } });
      if (!oldTx) throw new Error('Transaction not found');

      const amount = oldTx.type === TransactionType.INCOME ? -oldTx.amount : oldTx.amount;

      await tx.society.update({
        where: { id: oldTx.societyId },
        data: { balance: { increment: amount } },
      });

      return tx.transaction.delete({ where: { id } });
    });
  },

  async approve(id: string, approvedBy: string) {
    return prisma.transaction.update({
      where: { id },
      data: { status: TxStatus.APPROVED, approvedBy },
    });
  }
};
