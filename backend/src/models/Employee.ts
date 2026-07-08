import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  address?: string;
  contactNumber?: string;
  addedDate: Date;
}

const EmployeeSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String },
  contactNumber: { type: String },
  addedDate: { type: Date, default: Date.now }
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
