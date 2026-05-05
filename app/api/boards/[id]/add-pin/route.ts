// BUILD_TRIGGER: TESTING_VERCEL_CONNECTION_12345
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
    
    // Toggle pin
    const pinIndex = board.pins.findIndex((p: mongoose.Types.ObjectId) => p.toString() === pinId);
    
    let isAdded = false;
    if (pinIndex === -1) {
      board.pins.push(new mongoose.Types.ObjectId(pinId));
      isAdded = true;
    } else {
      board.pins.splice(pinIndex, 1);
      isAdded = false;
    }
    
    await board.save();
    
    return NextResponse.json({ 
      message: isAdded ? 'Pin added to board' : 'Pin removed from board', 
      saved: isAdded,
      board 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
