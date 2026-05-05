import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Pin from '@/models/Pin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const pin = await Pin.findById(id);
    if (!pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }
    return NextResponse.json(pin);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Pin.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Pin deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
