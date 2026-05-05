import mongoose, { Schema, Document } from 'mongoose';

export interface IPin extends Document {
  title: string;
  description?: string;
  images: string[];
  privateNote?: string;
  author: {
    name: string;
    avatar: string;
    id: string;
  };
  category: string;
  likes: string[];
  createdAt: Date;
}

const PinSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  images: { type: [String], required: true },
  privateNote: { type: String },
  author: {
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    id: { type: String, required: true },
  },
  category: { type: String, default: 'All' },
  likes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Pin || mongoose.model<IPin>('Pin', PinSchema);
