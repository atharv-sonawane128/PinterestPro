import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Board from '@/models/Board';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: boardId } = await params;
    const { pinId } = await request.json();
    
    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    
    // Add pin if not already there
    const pinObjectId = new mongoose.Types.ObjectId(pinId);
    if (!board.pins.includes(pinObjectId)) {
      board.pins.push(pinObjectId);
      await board.save();
    }
    
    return NextResponse.json({ message: 'Pin added to board', board });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
