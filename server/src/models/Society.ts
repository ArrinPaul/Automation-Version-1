import mongoose, { Schema, Document } from 'mongoose';

export interface IOfficer {
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface IMember {
  ieeeId: string;
  name: string;
  email: string;
  contactNumber?: string;
  grade: string;
}

export interface ISociety extends Document {
  societyKey: string; // e.g. 'cs', 'ras', 'wie' — matches frontend ids
  name: string;
  shortName: string;
  budget: number;
  balance: number;
  officeBearers: IOfficer[];
  members: IMember[];
  logo?: string;
  advisorSignature?: string;
  createdAt: Date;
}

const officerSchema = new Schema<IOfficer>(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
  },
  { _id: true }
);

const memberSchema = new Schema<IMember>(
  {
    ieeeId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, default: '' },
    grade: { type: String, required: true },
  },
  { _id: true }
);

const societySchema = new Schema<ISociety>(
  {
    societyKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    budget: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    officeBearers: [officerSchema],
    members: [memberSchema],
    logo: { type: String, default: null },
    advisorSignature: { type: String, default: null },
  },
  { timestamps: true }
);

// Index for fast lookups
societySchema.index({ societyKey: 1 });
societySchema.index({ shortName: 1 });

const Society = mongoose.model<ISociety>('Society', societySchema);
export default Society;
