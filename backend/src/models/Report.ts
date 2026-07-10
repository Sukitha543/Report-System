import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  employee: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  week: string;
  completedTasks: string;
  plannedTasks: string;
  blockers?: string;
  hoursWorked?: number;
  notes?: string;
  status: 'draft' | 'submitted' | 'pending' | 'late';
  submittedAt?: Date;
}

const ReportSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  week: { type: String, required: true },
  completedTasks: { type: String, required: true },
  plannedTasks: { type: String, required: true },
  blockers: { type: String },
  hoursWorked: { type: Number },
  notes: { type: String },
  status: { type: String, enum: ['draft', 'submitted', 'pending', 'late'], default: 'draft' },
  submittedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IReport>('Report', ReportSchema);
