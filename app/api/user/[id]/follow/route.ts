import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: targetUid } = await params;
    const { followerUid } = await request.json();
    
    if (targetUid === followerUid) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

    const targetUser = await User.findOne({ uid: targetUid });
    const followerUser = await User.findOne({ uid: followerUid });

    if (!targetUser || !followerUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isFollowing = followerUser.following.includes(targetUid);

    if (isFollowing) {
      // Unfollow
      await User.updateOne({ uid: followerUid }, { $pull: { following: targetUid } });
      await User.updateOne({ uid: targetUid }, { $pull: { followers: followerUid } });
    } else {
      // Follow
      await User.updateOne({ uid: followerUid }, { $addToSet: { following: targetUid } });
      await User.updateOne({ uid: targetUid }, { $addToSet: { followers: followerUid } });
      
      // Notify
      await Notification.create({
        recipientId: targetUid,
        senderId: followerUid,
        senderName: followerUser.name,
        senderAvatar: followerUser.avatar,
        type: 'follow',
        content: `${followerUser.name} started following you`,
        link: `/profile/${followerUid}`
      });
    }

    return NextResponse.json({ following: !isFollowing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
