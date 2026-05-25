import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  YOUTUBE_OAUTH_STATE_COOKIE,
  exchangeCodeForTokens,
  fetchYouTubeChannel,
  getBaseUrl,
  getYouTubeConfig,
  setYouTubeChannelCookies,
  setYouTubeTokenCookies,
} from '@/server/youtube/oauth';

export const runtime = 'nodejs';

function callbackHtml(baseUrl: string, success: boolean, payload: Record<string, string>) {
  const encodedPayload = JSON.stringify(payload);
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>YouTube 연결</title>
  </head>
  <body style="font-family: sans-serif; padding: 24px;">
    <p>${success ? 'YouTube 연결이 완료되었습니다. 잠시만 기다려 주세요.' : 'YouTube 연결에 실패했습니다.'}</p>
    <script>
      const payload = ${encodedPayload};
      if (${success ? 'true' : 'false'}) {
        const stored = localStorage.getItem('sns_connections');
        const defaults = [
          { id: 'youtube', connected: false, handle: '' },
          { id: 'instagram', connected: false, handle: '' },
          { id: 'threads', connected: false, handle: '' },
          { id: 'tiktok', connected: false, handle: '' }
        ];
        let connections = defaults;
        try {
          const parsed = JSON.parse(stored || '[]');
          if (Array.isArray(parsed)) {
            connections = defaults.map((base) => ({ ...base, ...(parsed.find((item) => item.id === base.id) || {}) }));
          }
        } catch (error) {}
        connections = connections.map((item) => item.id === 'youtube'
          ? { ...item, connected: true, handle: payload.handle || payload.title || 'YouTube', connectedAt: new Date().toISOString(), realOAuth: true }
          : item
        );
        localStorage.setItem('sns_connections', JSON.stringify(connections));
      }
      window.location.replace('${baseUrl}/connections${success ? '?youtube=connected' : '?youtube=error'}');
    </script>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = cookies().get(YOUTUBE_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return new NextResponse(
      callbackHtml(baseUrl, false, { error: 'Invalid YouTube OAuth callback state.' }),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  try {
    const config = getYouTubeConfig(request);
    const tokens = await exchangeCodeForTokens(config, code);
    const channel = await fetchYouTubeChannel(tokens.access_token);
    const response = new NextResponse(
      callbackHtml(baseUrl, true, {
        title: channel?.title || 'YouTube',
        handle: channel?.handle || channel?.title || 'YouTube',
        id: channel?.id || '',
      }),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );

    setYouTubeTokenCookies(response, tokens);
    setYouTubeChannelCookies(response, channel);
    response.cookies.delete(YOUTUBE_OAUTH_STATE_COOKIE);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'YouTube OAuth failed.';
    return new NextResponse(callbackHtml(baseUrl, false, { error: message }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
