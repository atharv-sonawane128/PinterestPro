import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Pin from '@/models/Pin';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const authorId = searchParams.get('authorId');
    const search = searchParams.get('search');
    
    let query: any = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (authorId) {
      query['author.id'] = authorId;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pins = await Pin.find(query).sort({ createdAt: -1 });
    return NextResponse.json(pins);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log("Creating pin with body:", { ...body, images: `${body.images?.length} images` });
    const newPin = await Pin.create(body);
    return NextResponse.json(newPin, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
