// API Route do Next.js para Aircraft por ID
import { NextRequest, NextResponse } from 'next/server';
import { Aircraft } from '@/lib/models/Aircraft';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const aircraft = await Aircraft.findById(id);
    if (!aircraft) {
      return NextResponse.json(
        { error: 'Aircraft not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(aircraft);
  } catch (error: any) {
    console.error('[Aircraft API Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();
    const aircraft = await Aircraft.update(id, body);
    return NextResponse.json(aircraft);
  } catch (error: any) {
    console.error('[Aircraft API Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    await Aircraft.delete(id);
    return NextResponse.json({ message: 'Aircraft deleted successfully' });
  } catch (error: any) {
    console.error('[Aircraft API Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

