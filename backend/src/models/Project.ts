import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  admin: mongoose.Types.ObjectId;
  projectName: string;
  description?: string;
  createdDate: Date;
}

const ProjectSchema: Schema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  projectName: { type: String, required: true },
  description: { type: String },
  createdDate: { type: Date, default: Date.now }
});

export default mongoose.model<IProject>('Project', ProjectSchema);
