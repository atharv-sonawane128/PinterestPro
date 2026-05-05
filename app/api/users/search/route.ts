import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) return NextResponse.json([]);
    
    let users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);
    
    // If no users found in User collection, try finding in Pin authors
    if (users.length === 0) {
      const Pin = (await import('@/models/Pin')).default;
      const pins = await Pin.find({
        'author.name': { $regex: query, $options: 'i' }
      }).limit(10);
      
      const seenIds = new Set();
      users = pins.map(p => ({
        uid: p.author.id,
        name: p.author.name,
        avatar: p.author.avatar,
        email: `${p.author.name.toLowerCase().replace(/\s/g, '')}@example.com`
      })).filter(u => {
        if (seenIds.has(u.uid)) return false;
        seenIds.add(u.uid);
        return true;
      });
    }
    
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
