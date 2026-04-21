import mongoose, { Schema, Document } from 'mongoose';

export type TargetAudience = 'ALL' | 'LEADERSHIP' | 'SOCIETY';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  date: Date;
  senderName: string;
  societyId?: string;
  targetAudience: TargetAudience;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    senderName: { type: String, required: true },
    societyId: { type: String, default: null },
    targetAudience: {
      type: String,
      enum: ['ALL', 'LEADERSHIP', 'SOCIETY'],
      default: 'ALL',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

announcementSchema.index({ date: -1 });
announcementSchema.index({ targetAudience: 1 });

const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
export default Announcement;
