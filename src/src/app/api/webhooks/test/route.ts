import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'Test webhook endpoint is working' });
}

export async function POST() {
  return NextResponse.json({ status: 'POST received' });
}