import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavedPin from '@/models/SavedPin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { userId } = await request.json();
    
    // Check if already saved
    const existing = await SavedPin.findOne({ userId, pinId: id });
    if (existing) {
      // Unsave if already exists
      await SavedPin.deleteOne({ _id: existing._id });
      return NextResponse.json({ message: 'Pin unsaved', saved: false });
    }
    
    const newSave = await SavedPin.create({ userId, pinId: id });
    return NextResponse.json({ message: 'Pin saved', saved: true, data: newSave }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    
    // Check general saves
    const existingGeneral = await SavedPin.findOne({ userId, pinId: id });
    if (existingGeneral) {
      return NextResponse.json({ saved: true });
    }
    
    // Check if in any of user's boards
    if (userEmail || userId) {
      const Board = (await import('@/models/Board')).default;
      const query = userId ? { userId } : { userEmail };
      const boards = await Board.find(query);
      const isInBoard = boards.some(board => 
        board.pins.some((p: any) => p.toString() === id)
      );
      if (isInBoard) {
        return NextResponse.json({ saved: true });
      }
    }
    
    return NextResponse.json({ saved: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
