import mongoose, { Schema, Document } from 'mongoose';

export interface ISpeaker {
  name: string;
  designation: string;
  organization: string;
  presentationTitle: string;
  profileText?: string;
}

export interface IEventReport extends Document {
  societyId: string;
  title: string;
  date: Date;
  type: string;
  participants: number;
  description: string;
  outcome: string;
  images: string[];
  time?: string;
  venue?: string;
  collaboration?: string;
  speakers: ISpeaker[];
  participantType?: string;
  highlights?: string;
  takeaways?: string;
  followUpPlan?: string;
  organizerName?: string;
  organizerDesignation?: string;
  reportUrl?: string;
  reportFileId?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const speakerSchema = new Schema<ISpeaker>(
  {
    name: { type: String, required: true },
    designation: { type: String, default: '' },
    organization: { type: String, default: '' },
    presentationTitle: { type: String, default: '' },
    profileText: { type: String, default: '' },
  },
  { _id: true }
);

const eventSchema = new Schema<IEventReport>(
  {
    societyId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    participants: { type: Number, default: 0 },
    description: { type: String, default: '' },
    outcome: { type: String, default: '' },
    images: [{ type: String }],
    time: { type: String, default: null },
    venue: { type: String, default: null },
    collaboration: { type: String, default: null },
    speakers: [speakerSchema],
    participantType: { type: String, default: null },
    highlights: { type: String, default: null },
    takeaways: { type: String, default: null },
    followUpPlan: { type: String, default: null },
    organizerName: { type: String, default: null },
    organizerDesignation: { type: String, default: null },
    reportUrl: { type: String, default: null },
    reportFileId: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ societyId: 1, date: -1 });

const EventReport = mongoose.model<IEventReport>('EventReport', eventSchema);
export default EventReport;
