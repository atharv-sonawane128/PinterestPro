import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  followers: [{ type: String }], // Array of uids
  following: [{ type: String }], // Array of uids
  bio: { type: String },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
