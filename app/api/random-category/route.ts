import { NextResponse } from 'next/server';
import { getRandomCategory } from '@/lib/randomCategory';

export async function GET() {
  const category = await getRandomCategory();
  return NextResponse.json(category);
}
