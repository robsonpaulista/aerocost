// API Route do Next.js para Aircraft
import { NextRequest, NextResponse } from 'next/server';
import { Aircraft } from '@/lib/models/Aircraft';

export async function GET(request: NextRequest) {
  try {
    const aircraft = await Aircraft.findAll();
    return NextResponse.json(aircraft);
  } catch (error: any) {
    console.error('[Aircraft API Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const aircraft = await Aircraft.create(body);
    return NextResponse.json(aircraft, { status: 201 });
  } catch (error: any) {
    console.error('[Aircraft API Error]', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Registration already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}

