import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  name: string;
  description?: string;
  userEmail: string;
  pins: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  createdAt: Date;
}

const BoardSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  userEmail: { type: String, required: true },
  pins: [{ type: Schema.Types.ObjectId, ref: 'Pin' }],
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);
