import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  pinId: mongoose.Types.ObjectId;
  author: {
    name: string;
    avatar: string;
    id: string;
  };
  content: string;
  gifUrl?: string;
  likes: number;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  pinId: { type: Schema.Types.ObjectId, ref: 'Pin', required: true },
  author: {
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    id: { type: String, required: true },
  },
  content: { type: String },
  gifUrl: { type: String },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
