import { NextResponse } from 'next/server';
import { getRandomCategory } from '@/lib/randomCategory';

export async function GET() {
  try {
    const category = await getRandomCategory();
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: 'Unable to load category right now. Please try again.' },
      { status: 503 },
    );
  }
}
