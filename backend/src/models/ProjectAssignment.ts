import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectAssignment extends Document {
  employee: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
}

const ProjectAssignmentSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
});

// Ensure an employee is assigned to a project only once
ProjectAssignmentSchema.index({ employee: 1, project: 1 }, { unique: true });

export default mongoose.model<IProjectAssignment>('ProjectAssignment', ProjectAssignmentSchema);
