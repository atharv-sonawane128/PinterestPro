import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: conversationId } = await params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: conversationId } = await params;
    const { senderId, content } = await request.json();
    
    const message = await Message.create({ conversationId, senderId, content });
    
    // Update conversation last message
    const conv = await Conversation.findByIdAndUpdate(conversationId, { 
      lastMessage: content, 
      updatedAt: new Date() 
    });

    // Notify recipient
    const recipientId = conv.participants.find((p: string) => p !== senderId);
    let sender = await User.findOne({ uid: senderId });
    
    if (!sender) {
      const Pin = (await import('@/models/Pin')).default;
      const pin = await Pin.findOne({ 'author.id': senderId });
      if (pin) sender = pin.author;
    }
    
    await Notification.create({
      recipientId,
      senderId,
      senderName: sender?.name || "Someone",
      senderAvatar: sender?.avatar,
      type: 'message',
      content: `sent you a message: ${content.substring(0, 20)}...`,
      link: `/messages?conv=${conversationId}`
    });

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
