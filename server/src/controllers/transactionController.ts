import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Transaction, Society, UserRole, TransactionStatus } from '../models';

/**
 * GET /api/transactions
 * List transactions. Scoped by role/society. Supports pagination and filters.
 */
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { societyId, status, type, page = '1', limit = '50' } = req.query;

    let filter: any = {};

    // Scope by role
    if (user.role === UserRole.SOCIETY_ADMIN || user.role === UserRole.VIEWER) {
      filter.societyId = user.societyId;
    } else if (societyId) {
      filter.societyId = societyId;
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

/**
 * GET /api/transactions/:id
 */
export const getTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('createdBy', 'name email');
    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Scope check
    const user = req.user!;
    if ((user.role === UserRole.SOCIETY_ADMIN || user.role === UserRole.VIEWER) && user.societyId !== transaction.societyId) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch transaction' });
  }
};

/**
 * POST /api/transactions
 * Create a transaction. Society Admin can only create for their own society.
 */
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { societyId, amount, type, category, description, date } = req.body;

    // Scope check
    if (user.role === UserRole.SOCIETY_ADMIN && user.societyId !== societyId) {
      res.status(403).json({ success: false, error: 'Cannot create transaction for another society' });
      return;
    }

    // Verify society exists
    const society = await Society.findOne({ societyKey: societyId });
    if (!society) {
      res.status(404).json({ success: false, error: 'Society not found' });
      return;
    }

    const transaction = await Transaction.create({
      societyId,
      amount,
      type,
      category,
      description,
      date: date || new Date(),
      status: TransactionStatus.PENDING,
      createdBy: user._id,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
};

/**
 * PUT /api/transactions/:id
 * Update a transaction. Creator or Admin can update.
 */
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Only creator or admin can update
    const isCreator = transaction.createdBy.toString() === user._id?.toString();
    const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SB_TREASURER;
    if (!isCreator && !isAdmin) {
      res.status(403).json({ success: false, error: 'Not authorized to update this transaction' });
      return;
    }

    // Don't allow changing status via regular update
    const { status, ...updateFields } = req.body;

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update transaction' });
  }
};

/**
 * PATCH /api/transactions/:id/approve
 * Approve or reject a transaction. SB Treasurer / Super Admin only.
 */
export const approveTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!status || ![TransactionStatus.APPROVED, TransactionStatus.REJECTED].includes(status)) {
      res.status(400).json({ success: false, error: 'Status must be APPROVED or REJECTED' });
      return;
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    transaction.status = status;
    transaction.approvedBy = user.name;
    await transaction.save();

    // Recalculate society balance if approved
    if (status === TransactionStatus.APPROVED) {
      await recalculateBalance(transaction.societyId);
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to approve transaction' });
  }
};

/**
 * DELETE /api/transactions/:id
 * Delete a transaction. Admin only.
 */
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Recalculate balance
    await recalculateBalance(transaction.societyId);

    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete transaction' });
  }
};

/**
 * Recalculate a society's balance from its budget and approved transactions.
 */
async function recalculateBalance(societyKey: string): Promise<void> {
  const society = await Society.findOne({ societyKey });
  if (!society) return;

  const transactions = await Transaction.find({
    societyId: societyKey,
    status: TransactionStatus.APPROVED,
  });

  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  society.balance = society.budget + income - expense;
  await society.save();
}
