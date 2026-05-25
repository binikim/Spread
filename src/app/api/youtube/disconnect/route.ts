import { NextResponse } from 'next/server';
import { clearYouTubeCookies } from '@/server/youtube/oauth';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearYouTubeCookies(response);
  return response;
}
