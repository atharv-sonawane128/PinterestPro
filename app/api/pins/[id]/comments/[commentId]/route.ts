import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string, commentId: string }> }
) {
  try {
    await connectDB();
    const { commentId } = await params;
    await Comment.findByIdAndDelete(commentId);
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
