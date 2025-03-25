import { NextRequest, NextResponse } from 'next/server';
import { closeToday } from '@/app/admin/actions';

export async function POST(request: NextRequest) {
  try {
    await closeToday();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error closing for today:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 