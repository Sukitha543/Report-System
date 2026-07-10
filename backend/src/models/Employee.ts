import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeID: string;
  user?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  address?: string;
  contactNumber?: string;
  addedDate: Date;
}

const EmployeeSchema: Schema = new Schema({
  employeeID: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String },
  contactNumber: { type: String },
  addedDate: { type: Date, default: Date.now }
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
