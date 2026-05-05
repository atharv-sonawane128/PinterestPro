import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Board from '@/models/Board';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // We'll use userId if possible, else email
    const email = searchParams.get('email');
    
    const query = userId ? { userId } : { userEmail: email };
    const boards = await Board.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(boards);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newBoard = await Board.create(body);
    return NextResponse.json(newBoard, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
