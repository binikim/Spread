'use client';

import React, { useEffect, useMemo, useState } from 'react';

type PlatformId = 'youtube' | 'instagram' | 'threads' | 'tiktok';

interface StoredConnection {
  id: PlatformId;
  connected: boolean;
  handle: string;
  connectedAt?: string;
  realOAuth?: boolean;
}

interface ChannelConnection {
  id: PlatformId;
  name: string;
  subName: string;
  handle: string;
  connected: boolean;
  iconColor: string;
  iconSvg: React.ReactNode;
}

const STORAGE_KEY = 'sns_connections';

const platformDefaults: Record<PlatformId, Omit<ChannelConnection, 'handle' | 'connected'>> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    subName: 'Shorts 및 동영상 업로드',
    iconColor: '#ff0000',
    iconSvg: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    ),
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    subName: '피드, 릴스, 스토리 게시',
    iconColor: '#ec4899',
    iconSvg: (
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
    subName: '텍스트와 이미지 게시',
    iconColor: '#0f172a',
    iconSvg: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 12.7c-.5 1.8-2 3-4.2 3-2.5 0-4.5-1.7-4.5-4.1 0-2.3 1.8-4 4.4-4 1 0 1.9.2 2.6.7-.3-1.3-1.2-2.2-2.7-2.2-1 0-1.9.3-2.7.9l-.8-1.3c1-.8 2.2-1.2 3.6-1.2 2.8 0 4.5 1.8 4.7 5.1.9.5 1.4 1.2 1.4 2.2 0 1.6-1.3 2.8-3.1 2.8-1.7 0-2.9-.9-2.9-2.2 0-1.2 1-2.1 2.7-2.1.2 0 .4 0 .7.1v-.3c-.6-.6-1.5-.9-2.7-.9-1.6 0-2.8.9-2.8 2.3 0 1.6 1.2 2.6 2.9 2.6 1.4 0 2.3-.7 2.6-1.8l1.8.4zm-1.3-1c-.7-.1-1.3.2-1.3.7 0 .4.4.7 1.1.7.8 0 1.3-.4 1.3-.9 0-.2-.1-.4-.3-.5h-.8z" />
      </svg>
    ),
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    subName: '숏폼 동영상 업로드',
    iconColor: '#000000',
    iconSvg: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.5 0h3.9c.1 1.5.7 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8v4c-1.4 0-2.9-.5-4.1-1.4v7.4c0 2.2-.8 4.5-2.5 6-1.6 1.4-3.8 2-6 1.8-2.3-.2-4.5-1.4-5.7-3.3-1.3-2.1-1.5-4.9-.4-7.1 1.1-2.2 3.4-3.7 5.9-3.9h.4v4.1c-1.2.1-2.5.6-3.1 1.7-.8 1.2-.7 2.8.2 3.9.9 1 2.5 1.3 3.6.6.7-.4 1.1-1.1 1.2-1.9V0h.6z" />
      </svg>
    ),
  },
};

const defaultConnections: StoredConnection[] = [
  { id: 'youtube', connected: false, handle: '' },
  { id: 'instagram', connected: false, handle: '' },
  { id: 'threads', connected: false, handle: '' },
  { id: 'tiktok', connected: false, handle: '' },
];

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

function saveConnections(connections: StoredConnection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  window.dispatchEvent(new CustomEvent('sns-connections-updated', { detail: connections }));
}

export default function ConnectionsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [storedConnections, setStoredConnections] = useState<StoredConnection[]>(defaultConnections);
  const [pendingPlatform, setPendingPlatform] = useState<PlatformId | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const current = readConnections();
    setStoredConnections(current);
    saveConnections(current);
    syncYouTubeStatus();
  }, []);

  const syncYouTubeStatus = async () => {
    try {
      const response = await fetch('/api/youtube/status');
      const data = await response.json();
      if (!data.connected) return;

      setStoredConnections((prev) => {
        const next = prev.map((conn) =>
          conn.id === 'youtube'
            ? {
                ...conn,
                connected: true,
                handle: data.channel?.handle || data.channel?.title || 'YouTube',
                connectedAt: new Date().toISOString(),
                realOAuth: true,
              }
            : conn,
        );
        saveConnections(next);
        return next;
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== 'SNS_CONNECTED') return;

      const platform = event.data.platform as PlatformId;
      if (!platformDefaults[platform]) return;

      setStoredConnections((prev) => {
        const next = prev.map((conn) =>
          conn.id === platform
            ? {
                ...conn,
                connected: true,
                handle: String(event.data.handle || ''),
                connectedAt: new Date().toISOString(),
              }
            : conn,
        );
        saveConnections(next);
        return next;
      });
      setPendingPlatform(null);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connections = useMemo<ChannelConnection[]>(() => {
    return defaultConnections.map(({ id }) => {
      const stored = storedConnections.find((conn) => conn.id === id);
      return {
        ...platformDefaults[id],
        connected: Boolean(stored?.connected),
        handle: stored?.handle || '',
      };
    });
  }, [storedConnections]);

  const connectedCount = connections.filter((conn) => conn.connected).length;

  const handleConnect = (id: PlatformId) => {
    setPendingPlatform(id);
    const width = 460;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `/mock-sns?platform=${id}`,
      `sns_auth_${id}`,
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
    );

    if (!popup) {
      setPendingPlatform(null);
      window.location.href = `/mock-sns?platform=${id}`;
      return;
    }

    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer);
        setPendingPlatform(null);
        setStoredConnections(readConnections());
      }
    }, 600);
  };

  const handleDisconnect = async (id: PlatformId) => {
    const target = platformDefaults[id].name;
    if (!window.confirm(`${target} 계정 연결을 해제할까요?`)) return;

    if (id === 'youtube') {
      try {
        await fetch('/api/youtube/disconnect', { method: 'POST' });
      } catch (error) {
        console.error(error);
      }
    }

    setStoredConnections((prev) => {
      const next = prev.map((conn) => {
        if (conn.id !== id) return conn;
        const { realOAuth, ...rest } = conn;
        return { ...rest, connected: false, handle: '', connectedAt: undefined };
      });
      saveConnections(next);
      return next;
    });
  };

  const cssStyles = `
    .connections-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 2.5rem 3rem;
      box-sizing: border-box;
    }

    .connections-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .connections-title {
      font-size: 1.9rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.45rem 0;
      letter-spacing: 0;
    }

    .connections-desc {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
      line-height: 1.6;
    }

    .summary-pill {
      border: 1px solid #dbeafe;
      background: #eff6ff;
      color: #1d4ed8;
      border-radius: 999px;
      padding: 0.55rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .connection-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.35rem;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 190px;
      box-sizing: border-box;
    }

    .card-top {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      margin-bottom: 1.1rem;
    }

    .channel-icon {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .channel-icon svg {
      width: 1.35rem;
      height: 1.35rem;
    }

    .channel-name-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .channel-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }

    .status-badge.connected {
      background: #dcfce7;
      color: #15803d;
    }

    .status-badge.disconnected {
      background: #f1f5f9;
      color: #64748b;
    }

    .channel-subname {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0.25rem 0 0 0;
      font-weight: 500;
    }

    .account-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8fafc;
      margin-bottom: 0.85rem;
      gap: 0.75rem;
    }

    .account-handle {
      font-size: 0.9rem;
      font-weight: 700;
      color: #334155;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-account {
      color: #94a3b8;
      font-size: 0.88rem;
      margin: 0 0 0.85rem 0;
      line-height: 1.5;
    }

    .button-row {
      display: flex;
      gap: 0.6rem;
      margin-top: auto;
    }

    .connect-btn,
    .disconnect-btn {
      border: none;
      border-radius: 8px;
      padding: 0.75rem 0.85rem;
      font-size: 0.86rem;
      font-weight: 800;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s, border-color 0.2s;
    }

    .connect-btn {
      flex: 1;
      background-color: #0f172a;
      color: #ffffff;
    }

    .connect-btn:hover {
      background-color: #1e293b;
    }

    .connect-btn:disabled {
      cursor: wait;
      opacity: 0.72;
    }

    .disconnect-btn {
      background: #ffffff;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .disconnect-btn:hover {
      color: #dc2626;
      border-color: #fecaca;
      background: #fef2f2;
    }

    .info-panel {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem;
      color: #475569;
      line-height: 1.65;
      font-size: 0.9rem;
    }

    .info-panel strong {
      color: #0f172a;
    }

    @media (max-width: 900px) {
      .connections-container {
        padding: 1.5rem;
      }

      .connections-header {
        flex-direction: column;
      }

      .grid-container {
        grid-template-columns: 1fr;
      }
    }
  `;

  if (!isMounted) return null;

  return (
    <div className="connections-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      <header className="connections-header">
        <div>
          <h1 className="connections-title">SNS 계정 연결</h1>
          <p className="connections-desc">
            YouTube, Instagram, Threads, TikTok 계정을 연결하면 게시 화면에서 해당 채널을 선택할 수 있습니다.
          </p>
        </div>
        <div className="summary-pill">연결됨 {connectedCount} / {connections.length}</div>
      </header>

      <div className="grid-container">
        {connections.map((conn) => (
          <section key={conn.id} className="connection-card">
            <div>
              <div className="card-top">
                <div className="channel-icon" style={{ color: conn.iconColor }}>
                  {conn.iconSvg}
                </div>
                <div>
                  <div className="channel-name-row">
                    <h2 className="channel-name">{conn.name}</h2>
                    <span className={`status-badge ${conn.connected ? 'connected' : 'disconnected'}`}>
                      {conn.connected ? '연결됨' : '미연결'}
                    </span>
                  </div>
                  <p className="channel-subname">{conn.subName}</p>
                </div>
              </div>

              {conn.connected ? (
                <div className="account-box">
                  <span className="account-handle" title={conn.handle}>{conn.handle}</span>
                </div>
              ) : (
                <p className="empty-account">아직 연결된 계정이 없습니다. 버튼을 눌러 테스트 연결을 완료해 주세요.</p>
              )}
            </div>

            <div className="button-row">
              <button
                type="button"
                className="connect-btn"
                disabled={pendingPlatform === conn.id}
                onClick={() => handleConnect(conn.id)}
              >
                {pendingPlatform === conn.id ? '연결 대기 중...' : conn.connected ? '다른 계정으로 연결' : '계정 연결'}
              </button>
              {conn.connected && (
                <button type="button" className="disconnect-btn" onClick={() => handleDisconnect(conn.id)}>
                  해제
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      <aside className="info-panel">
        <strong>현재는 로컬 테스트 연결 모드입니다.</strong> 실제 YouTube, Instagram, Threads, TikTok OAuth를 붙이려면 각 플랫폼 개발자 콘솔에서
        Client ID, Client Secret, Redirect URI를 발급받아 서버 API와 연결해야 합니다. 지금 만든 흐름은 앱 안에서 계정 연결 상태를 저장하고
        게시 화면에 반영되도록 동작합니다.
      </aside>
    </div>
  );
}
