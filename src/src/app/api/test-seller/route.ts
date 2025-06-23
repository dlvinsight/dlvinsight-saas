import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Test seller route works!' });
}

export async function POST() {
  return NextResponse.json({ message: 'POST works!' });
}
