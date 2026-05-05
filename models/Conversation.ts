import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: String }], // Array of uids
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
