import { PrismaClient, TransactionType, TxStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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

  /**
   * Fetches the current balance for a society.
   * Returns Decimal value representing aggregated balance.
   */
  async getBalanceBySociety(societyId: string): Promise<Decimal | null> {
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      select: { balance: true },
    });

    return society?.balance ?? null;
  },

  async create(data: any) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({ data });

      // Calculate balance change: INCOME adds, EXPENSE subtracts
      const amount = data.type === TransactionType.INCOME 
        ? data.amount 
        : new Decimal(data.amount).negated();

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

      // Recalculate balance only if amount or type changed
      if (data.amount !== undefined || data.type !== undefined) {
        // Calculate old balance impact
        const oldAmount = oldTx.type === TransactionType.INCOME 
          ? oldTx.amount 
          : new Decimal(oldTx.amount).negated();

        // Calculate new balance impact
        const newType = data.type || oldTx.type;
        const newAmountValue = data.amount || oldTx.amount;
        const newAmount = newType === TransactionType.INCOME 
          ? new Decimal(newAmountValue) 
          : new Decimal(newAmountValue).negated();

        // Calculate difference to adjust balance
        const diff = new Decimal(newAmount).minus(new Decimal(oldAmount));

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

      // Reverse the balance impact when deleting
      const amount = oldTx.type === TransactionType.INCOME 
        ? new Decimal(oldTx.amount).negated() 
        : oldTx.amount;

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
