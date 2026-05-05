import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavedPin from '@/models/SavedPin';
import Board from '@/models/Board';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: userId } = await params;
    
    // Get general saved pins
    const generalSaved = await SavedPin.find({ userId }).select('pinId');
    const generalIds = generalSaved.map(s => s.pinId.toString());
    
    // Get pins from all user's boards
    const userBoards = await Board.find({ userId }).select('pins');
    // Note: Some boards might use userEmail instead of userId, but we'll try to find by userId first.
    // If we need to, we can also query by email if passed.
    
    const boardIds = userBoards.flatMap(b => b.pins.map(p => p.toString()));
    
    // Combine and unique
    const allIds = Array.from(new Set([...generalIds, ...boardIds]));
    
    return NextResponse.json(allIds);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
