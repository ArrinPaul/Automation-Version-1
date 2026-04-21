import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ITransaction extends Document {
  societyId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: Date;
  status: TransactionStatus;
  approvedBy?: string;
  receiptUrl?: string;
  receiptFileId?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    societyId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    approvedBy: { type: String, default: null },
    receiptUrl: { type: String, default: null },
    receiptFileId: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Compound indexes for filtered queries
transactionSchema.index({ societyId: 1, date: -1 });
transactionSchema.index({ societyId: 1, status: 1 });
transactionSchema.index({ createdBy: 1 });

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
