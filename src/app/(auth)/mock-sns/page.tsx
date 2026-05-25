'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type PlatformId = 'youtube' | 'instagram' | 'threads' | 'tiktok';

interface StoredConnection {
  id: PlatformId;
  connected: boolean;
  handle: string;
  connectedAt?: string;
}

interface PlatformDetails {
  id: PlatformId;
  name: string;
  title: string;
  subtitle: string;
  sampleHandle: string;
  buttonText: string;
  brandColor: string;
  dark: boolean;
  logo: React.ReactNode;
}

const STORAGE_KEY = 'sns_connections';

const defaultConnections: StoredConnection[] = [
  { id: 'youtube', connected: false, handle: '' },
  { id: 'instagram', connected: false, handle: '' },
  { id: 'threads', connected: false, handle: '' },
  { id: 'tiktok', connected: false, handle: '' },
];

const platformDetails: Record<PlatformId, PlatformDetails> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    title: 'YouTube 계정 연결',
    subtitle: '채널 이름 또는 핸들을 입력하면 Spread에서 게시 대상으로 사용할 수 있습니다.',
    sampleHandle: 'Bini Music / @Bini-tx3rv',
    buttonText: 'YouTube 연결 승인',
    brandColor: '#ff0000',
    dark: false,
    logo: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    ),
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    title: 'Instagram 계정 연결',
    subtitle: '비즈니스 또는 크리에이터 계정의 핸들을 입력해 연결을 완료하세요.',
    sampleHandle: '@my_instagram_id',
    buttonText: 'Instagram 연결 승인',
    brandColor: '#ec4899',
    dark: false,
    logo: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z" />
        <path d="M17.5 6.5h.01" />
      </svg>
    ),
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    title: 'Threads 계정 연결',
    subtitle: 'Threads 게시에 사용할 사용자 이름을 입력해 주세요.',
    sampleHandle: '@my_threads_id',
    buttonText: 'Threads 연결 승인',
    brandColor: '#111111',
    dark: true,
    logo: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 12.7c-.5 1.8-2 3-4.2 3-2.5 0-4.5-1.7-4.5-4.1 0-2.3 1.8-4 4.4-4 1 0 1.9.2 2.6.7-.3-1.3-1.2-2.2-2.7-2.2-1 0-1.9.3-2.7.9l-.8-1.3c1-.8 2.2-1.2 3.6-1.2 2.8 0 4.5 1.8 4.7 5.1.9.5 1.4 1.2 1.4 2.2 0 1.6-1.3 2.8-3.1 2.8-1.7 0-2.9-.9-2.9-2.2 0-1.2 1-2.1 2.7-2.1.2 0 .4 0 .7.1v-.3c-.6-.6-1.5-.9-2.7-.9-1.6 0-2.8.9-2.8 2.3 0 1.6 1.2 2.6 2.9 2.6 1.4 0 2.3-.7 2.6-1.8l1.8.4zm-1.3-1c-.7-.1-1.3.2-1.3.7 0 .4.4.7 1.1.7.8 0 1.3-.4 1.3-.9 0-.2-.1-.4-.3-.5h-.8z" />
      </svg>
    ),
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    title: 'TikTok 계정 연결',
    subtitle: 'TikTok 업로드에 사용할 계정 핸들을 입력해 주세요.',
    sampleHandle: '@my_tiktok_id',
    buttonText: 'TikTok 연결 승인',
    brandColor: '#111111',
    dark: true,
    logo: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.5 0h3.9c.1 1.5.7 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8v4c-1.4 0-2.9-.5-4.1-1.4v7.4c0 2.2-.8 4.5-2.5 6-1.6 1.4-3.8 2-6 1.8-2.3-.2-4.5-1.4-5.7-3.3-1.3-2.1-1.5-4.9-.4-7.1 1.1-2.2 3.4-3.7 5.9-3.9h.4v4.1c-1.2.1-2.5.6-3.1 1.7-.8 1.2-.7 2.8.2 3.9.9 1 2.5 1.3 3.6.6.7-.4 1.1-1.1 1.2-1.9V0h.6z" />
      </svg>
    ),
  },
};

function normalizePlatform(value: string | null): PlatformId {
  if (value === 'instagram' || value === 'threads' || value === 'tiktok' || value === 'youtube') {
    return value;
  }
  return 'youtube';
}

function readConnections(): StoredConnection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultConnections;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return defaultConnections;

    return defaultConnections.map((base) => {
      const found = parsed.find((item: Partial<StoredConnection>) => item.id === base.id);
      return {
        ...base,
        connected: Boolean(found?.connected),
        handle: typeof found?.handle === 'string' ? found.handle : '',
        connectedAt: typeof found?.connectedAt === 'string' ? found.connectedAt : undefined,
      };
    });
  } catch {
    return defaultConnections;
  }
}

function MockSnsContent() {
  const searchParams = useSearchParams();
  const platform = normalizePlatform(searchParams.get('platform'));
  const details = useMemo(() => platformDetails[platform], [platform]);
  const [handle, setHandle] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    const current = readConnections().find((conn) => conn.id === platform);
    setHandle(current?.handle || details.sampleHandle);
  }, [details.sampleHandle, platform]);

  const handleAuthorize = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedHandle = handle.trim();
    if (!trimmedHandle) {
      window.alert('계정 이름 또는 핸들을 입력해 주세요.');
      return;
    }

    setIsAuthorizing(true);

    window.setTimeout(() => {
      const next = readConnections().map((conn) =>
        conn.id === platform
          ? {
              ...conn,
              connected: true,
              handle: trimmedHandle,
              connectedAt: new Date().toISOString(),
            }
          : conn,
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: 'SNS_CONNECTED', platform, handle: trimmedHandle },
          window.location.origin,
        );
        window.close();
        return;
      }

      window.location.href = '/connections';
    }, 700);
  };

  const textColor = details.dark ? '#f8fafc' : '#111827';
  const mutedColor = details.dark ? '#a1a1aa' : '#64748b';
  const panelBg = details.dark ? '#18181b' : '#ffffff';
  const pageBg = details.dark ? '#0a0a0a' : '#f1f5f9';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box',
        background: pageBg,
        color: textColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '390px',
          background: panelBg,
          border: `1px solid ${details.dark ? '#27272a' : '#e2e8f0'}`,
          borderRadius: '12px',
          padding: '1.6rem',
          boxShadow: details.dark ? '0 20px 40px rgba(0,0,0,0.35)' : '0 20px 40px rgba(15,23,42,0.12)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: details.brandColor,
              background: details.dark ? '#27272a' : '#f8fafc',
              border: `1px solid ${details.dark ? '#3f3f46' : '#e2e8f0'}`,
              marginBottom: '1rem',
            }}
          >
            <span style={{ width: '28px', height: '28px', display: 'inline-flex' }}>{details.logo}</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', margin: '0 0 0.45rem', fontWeight: 800 }}>{details.title}</h1>
          <p style={{ margin: 0, color: mutedColor, fontSize: '0.88rem', lineHeight: 1.55 }}>{details.subtitle}</p>
        </div>

        <form onSubmit={handleAuthorize}>
          <label
            htmlFor="account-handle"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: mutedColor,
              marginBottom: '0.45rem',
            }}
          >
            계정 이름 또는 핸들
          </label>
          <input
            id="account-handle"
            type="text"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder={details.sampleHandle}
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: '8px',
              border: `1px solid ${details.dark ? '#3f3f46' : '#cbd5e1'}`,
              background: details.dark ? '#09090b' : '#ffffff',
              color: textColor,
              padding: '0.75rem 0.85rem',
              fontSize: '0.95rem',
              outline: 'none',
              marginBottom: '1rem',
            }}
            required
          />

          <div
            style={{
              border: `1px solid ${details.dark ? '#27272a' : '#e2e8f0'}`,
              background: details.dark ? '#111113' : '#f8fafc',
              color: mutedColor,
              borderRadius: '8px',
              padding: '0.8rem',
              fontSize: '0.8rem',
              lineHeight: 1.55,
              marginBottom: '1rem',
            }}
          >
            이 창은 실제 플랫폼 로그인 대신 로컬 테스트용 연결 승인 흐름을 제공합니다.
          </div>

          <button
            type="submit"
            disabled={isAuthorizing}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '8px',
              padding: '0.85rem',
              background: details.id === 'instagram'
                ? 'linear-gradient(45deg, #f97316, #ec4899, #8b5cf6)'
                : details.brandColor,
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: isAuthorizing ? 'wait' : 'pointer',
              opacity: isAuthorizing ? 0.75 : 1,
            }}
          >
            {isAuthorizing ? '연결 중...' : details.buttonText}
          </button>

          <button
            type="button"
            onClick={() => (window.opener ? window.close() : (window.location.href = '/connections'))}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              border: 'none',
              background: 'transparent',
              color: mutedColor,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            취소
          </button>
        </form>
      </section>
    </main>
  );
}

export default function MockSnsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>
          불러오는 중...
        </div>
      }
    >
      <MockSnsContent />
    </Suspense>
  );
}
