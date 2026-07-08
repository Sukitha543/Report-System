import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
}

const AdminSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
