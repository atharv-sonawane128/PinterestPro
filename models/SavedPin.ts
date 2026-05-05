import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedPin extends Document {
  userId: string;
  pinId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedPinSchema: Schema = new Schema({
  userId: { type: String, required: true },
  pinId: { type: Schema.Types.ObjectId, ref: 'Pin', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique saves (user can only save a pin once)
SavedPinSchema.index({ userId: 1, pinId: 1 }, { unique: true });

export default mongoose.models.SavedPin || mongoose.model<ISavedPin>('SavedPin', SavedPinSchema);
