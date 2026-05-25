import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
];

export const YOUTUBE_ACCESS_TOKEN_COOKIE = 'youtube_access_token';
export const YOUTUBE_REFRESH_TOKEN_COOKIE = 'youtube_refresh_token';
export const YOUTUBE_EXPIRES_AT_COOKIE = 'youtube_expires_at';
export const YOUTUBE_CHANNEL_TITLE_COOKIE = 'youtube_channel_title';
export const YOUTUBE_CHANNEL_HANDLE_COOKIE = 'youtube_channel_handle';
export const YOUTUBE_CHANNEL_ID_COOKIE = 'youtube_channel_id';
export const YOUTUBE_OAUTH_STATE_COOKIE = 'youtube_oauth_state';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const CHANNELS_ENDPOINT = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  handle: string;
}

interface YouTubeConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

export function getYouTubeConfig(request: NextRequest): YouTubeConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri =
    process.env.YOUTUBE_REDIRECT_URI ||
    `${getBaseUrl(request)}/api/youtube/oauth/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for YouTube login.');
  }

  return { clientId, clientSecret, redirectUri };
}

export function createOAuthState() {
  return crypto.randomUUID();
}

export function createAuthorizationUrl(config: YouTubeConfig, state: string) {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', YOUTUBE_SCOPES.join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', state);
  return url;
}

export async function exchangeCodeForTokens(config: YouTubeConfig, code: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token exchange failed: ${response.status} ${body}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function refreshAccessToken(config: YouTubeConfig, refreshToken: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token refresh failed: ${response.status} ${body}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function fetchYouTubeChannel(accessToken: string): Promise<YouTubeChannel | null> {
  const response = await fetch(CHANNELS_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube channel lookup failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    id: item.id,
    title: item.snippet?.title || 'YouTube Channel',
    handle: item.snippet?.customUrl || '',
  };
}

export function setYouTubeTokenCookies(response: NextResponse, tokenResponse: TokenResponse) {
  const expiresAt = Date.now() + Math.max(tokenResponse.expires_in - 60, 60) * 1000;

  response.cookies.set(YOUTUBE_ACCESS_TOKEN_COOKIE, tokenResponse.access_token, tokenCookieOptions());
  response.cookies.set(YOUTUBE_EXPIRES_AT_COOKIE, String(expiresAt), tokenCookieOptions());

  if (tokenResponse.refresh_token) {
    response.cookies.set(YOUTUBE_REFRESH_TOKEN_COOKIE, tokenResponse.refresh_token, {
      ...tokenCookieOptions(),
      maxAge: 60 * 60 * 24 * 365,
    });
  }
}

export function setYouTubeChannelCookies(response: NextResponse, channel: YouTubeChannel | null) {
  if (!channel) return;
  response.cookies.set(YOUTUBE_CHANNEL_TITLE_COOKIE, channel.title, readableCookieOptions());
  response.cookies.set(YOUTUBE_CHANNEL_HANDLE_COOKIE, channel.handle, readableCookieOptions());
  response.cookies.set(YOUTUBE_CHANNEL_ID_COOKIE, channel.id, readableCookieOptions());
}

export function clearYouTubeCookies(response: NextResponse) {
  [
    YOUTUBE_ACCESS_TOKEN_COOKIE,
    YOUTUBE_REFRESH_TOKEN_COOKIE,
    YOUTUBE_EXPIRES_AT_COOKIE,
    YOUTUBE_CHANNEL_TITLE_COOKIE,
    YOUTUBE_CHANNEL_HANDLE_COOKIE,
    YOUTUBE_CHANNEL_ID_COOKIE,
    YOUTUBE_OAUTH_STATE_COOKIE,
  ].forEach((name) => response.cookies.delete(name));
}

export async function getValidYouTubeAccessToken(request: NextRequest, response: NextResponse) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(YOUTUBE_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(YOUTUBE_REFRESH_TOKEN_COOKIE)?.value;
  const expiresAt = Number(cookieStore.get(YOUTUBE_EXPIRES_AT_COOKIE)?.value || 0);

  if (accessToken && expiresAt > Date.now() + 30_000) {
    return accessToken;
  }

  if (!refreshToken) {
    throw new Error('YouTube login is required.');
  }

  const config = getYouTubeConfig(request);
  const refreshed = await refreshAccessToken(config, refreshToken);
  setYouTubeTokenCookies(response, refreshed);
  return refreshed.access_token;
}

export function tokenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function readableCookieOptions() {
  return {
    httpOnly: false,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  };
}
