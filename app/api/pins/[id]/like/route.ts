import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Pin from '@/models/Pin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await request.json();
    
    const pin = await Pin.findById(id);
    if (!pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }
    
    // Toggle like
    const likedIndex = pin.likes.indexOf(userId);
    if (likedIndex > -1) {
      pin.likes.splice(likedIndex, 1);
    } else {
      pin.likes.push(userId);
    }
    
    await pin.save();
    return NextResponse.json({ likes: pin.likes, liked: likedIndex === -1 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
