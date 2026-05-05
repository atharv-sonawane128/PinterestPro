import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) return NextResponse.json([]);
    
    const conversations = await Conversation.find({
      participants: userId
    }).sort({ updatedAt: -1 });

    // Fetch other participant details for each conversation
    const detailedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherUid = conv.participants.find((p: string) => p !== userId);
      let otherUser = await User.findOne({ uid: otherUid }).select('name avatar uid lastActive');
      
      if (!otherUser) {
        const Pin = (await import('@/models/Pin')).default;
        const pin = await Pin.findOne({ 'author.id': otherUid });
        if (pin) {
          // Check if this author exists in our User collection to get status
          const existingUser = await User.findOne({ uid: otherUid }).select('lastActive');
          otherUser = {
            uid: pin.author.id,
            name: pin.author.name,
            avatar: pin.author.avatar,
            lastActive: existingUser?.lastActive
          };
        }
      }

      return {
        ...conv.toObject(),
        otherUser
      };
    }));
    
    return NextResponse.json(detailedConversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { participants, lastMessage } = await request.json();
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants, lastMessage, updatedAt: new Date() });
    } else {
      conversation.lastMessage = lastMessage;
      conversation.updatedAt = new Date();
      await conversation.save();
    }
    
    return NextResponse.json(conversation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
