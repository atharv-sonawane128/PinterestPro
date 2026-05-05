import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { uid, email, name, avatar } = await request.json();
    
    const user = await User.findOneAndUpdate(
      { uid },
      { 
        email, 
        name: name || email.split('@')[0], 
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}` 
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
