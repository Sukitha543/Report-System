import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  employee: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  weekStart: Date;
  weekEnd: Date;
  completedTask: string;
  plannedTasks: string;
  blockers?: string;
  hoursWorked: number;
  notes?: string;
  status: 'submitted' | 'pending' | 'late';
  submittedAt: Date;
}

const ReportSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  completedTask: { type: String, required: true },
  plannedTasks: { type: String, required: true },
  blockers: { type: String },
  hoursWorked: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['submitted', 'pending', 'late'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReport>('Report', ReportSchema);
