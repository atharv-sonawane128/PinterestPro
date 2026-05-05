import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId } = await req.json();
    
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    
    console.log(`Heartbeat for user: ${userId}`);
    const updatedUser = await User.findOneAndUpdate(
      { uid: userId },
      { lastActive: new Date() },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, lastActive: updatedUser.lastActive });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
