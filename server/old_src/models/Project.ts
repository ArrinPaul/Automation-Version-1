import mongoose, { Schema, Document } from 'mongoose';

export type ProjectStatus = 'PROPOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ANNOUNCED' | 'AWARDED';
export type ProjectCategory = 'TECHNICAL_PROJECT' | 'TRAVEL_GRANT' | 'SCHOLARSHIP' | 'AWARD';

export interface IProject extends Document {
  societyId: string;
  title: string;
  category: ProjectCategory;
  sanctioningBody: string;
  amountSanctioned: number;
  startDate: Date;
  status: ProjectStatus;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    societyId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['TECHNICAL_PROJECT', 'TRAVEL_GRANT', 'SCHOLARSHIP', 'AWARD'],
      required: true,
    },
    sanctioningBody: { type: String, required: true },
    amountSanctioned: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PROPOSED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ANNOUNCED', 'AWARDED'],
      default: 'PROPOSED',
    },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

projectSchema.index({ societyId: 1, status: 1 });

const Project = mongoose.model<IProject>('Project', projectSchema);
export default Project;
