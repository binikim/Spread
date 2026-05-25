import { NextRequest, NextResponse } from 'next/server';
import {
  YOUTUBE_OAUTH_STATE_COOKIE,
  createAuthorizationUrl,
  createOAuthState,
  getYouTubeConfig,
  readableCookieOptions,
} from '@/server/youtube/oauth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const config = getYouTubeConfig(request);
    const state = createOAuthState();
    const authUrl = createAuthorizationUrl(config, state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set(YOUTUBE_OAUTH_STATE_COOKIE, state, {
      ...readableCookieOptions(),
      httpOnly: true,
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'YouTube login setup failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
