import mongoose, { Schema, Document } from 'mongoose';

export type CalendarEventStatus = 'PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface ICalendarEvent extends Document {
  societyId: string;
  title: string;
  date: Date;
  time?: string;
  venue?: string;
  description: string;
  status: CalendarEventStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    societyId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, default: null },
    venue: { type: String, default: null },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'PROPOSED',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

calendarEventSchema.index({ date: 1 });
calendarEventSchema.index({ societyId: 1, date: 1 });

const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
