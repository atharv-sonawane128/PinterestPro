import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavedPin from '@/models/SavedPin';
import Pin from '@/models/Pin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Find all saves for this user
    const saves = await SavedPin.find({ userId: id }).populate('pinId');
    console.log(`Found ${saves.length} saves for user ${id}`);
    const pins = saves.map((s: any) => s.pinId).filter((p: any) => p !== null);
    
    return NextResponse.json(pins);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
