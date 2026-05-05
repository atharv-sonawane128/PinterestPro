import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: String, required: true }, // uid
  senderId: { type: String, required: true }, // uid
  senderName: { type: String },
  senderAvatar: { type: String },
  type: { 
    type: String, 
    enum: ['follow', 'message', 'comment', 'like'],
    required: true 
  },
  content: { type: String },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
