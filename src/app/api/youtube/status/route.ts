import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  YOUTUBE_CHANNEL_HANDLE_COOKIE,
  YOUTUBE_CHANNEL_ID_COOKIE,
  YOUTUBE_CHANNEL_TITLE_COOKIE,
  YOUTUBE_REFRESH_TOKEN_COOKIE,
  fetchYouTubeChannel,
  getValidYouTubeAccessToken,
  setYouTubeChannelCookies,
} from '@/server/youtube/oauth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ connected: false });
  const hasRefreshToken = Boolean(cookies().get(YOUTUBE_REFRESH_TOKEN_COOKIE)?.value);

  if (!hasRefreshToken) {
    return response;
  }

  try {
    const accessToken = await getValidYouTubeAccessToken(request, response);
    const channel = await fetchYouTubeChannel(accessToken);
    setYouTubeChannelCookies(response, channel);

    return NextResponse.json(
      {
        connected: true,
        channel: {
          id: channel?.id || cookies().get(YOUTUBE_CHANNEL_ID_COOKIE)?.value || '',
          title: channel?.title || cookies().get(YOUTUBE_CHANNEL_TITLE_COOKIE)?.value || 'YouTube',
          handle: channel?.handle || cookies().get(YOUTUBE_CHANNEL_HANDLE_COOKIE)?.value || '',
        },
      },
      { headers: response.headers },
    );
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'YouTube status failed.' },
      { status: 401, headers: response.headers },
    );
  }
}
