'use client';

import React, { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [channels, setChannels] = useState([
    { id: 'youtube', name: 'YouTube Shorts', handle: '-', status: 'disconnected', icon: 'YT', followers: '-' },
    { id: 'instagram', name: 'Instagram Reels', handle: '-', status: 'disconnected', icon: 'IG', followers: '-' },
    { id: 'threads', name: 'Threads', handle: '-', status: 'disconnected', icon: 'TH', followers: '-' },
    { id: 'tiktok', name: 'TikTok', handle: '-', status: 'disconnected', icon: 'TT', followers: '-' },
  ]);

  // 하이드레이션 완료 대기 및 로그인 정보 확인
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      window.location.href = '/login';
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role === '슈퍼관리자') {
        parsed.role = '슈퍼 관리자';
      }
      setCurrentUser(parsed);
    } catch (e) {
      console.error(e);
      window.location.href = '/login';
      return;
    }

    // 발행 목록 동적 로드
    const storedHistory = localStorage.getItem('publish_history');
    if (storedHistory) {
      try {
        const historyList = JSON.parse(storedHistory);
        // 최근 4개만 노출
        setRecentActivities(historyList.slice(0, 4));
        setTotalHistoryCount(historyList.length);
      } catch (e) {
        console.error(e);
      }
    }

    // SNS 연결 상태 로드
    const storedConnections = localStorage.getItem('sns_connections');
    if (storedConnections) {
      try {
        const parsed = JSON.parse(storedConnections);
        setChannels(prev => prev.map(chan => {
          const match = parsed.find((c: any) => c.id === chan.id);
          if (match) {
            return {
              ...chan,
              status: match.connected ? 'connected' : 'disconnected',
              handle: match.connected ? match.handle : '-'
            };
          }
          return chan;
        }));
      } catch (e) {
        console.error(e);
      }
    } else {
      // sns_connections 가 없는 경우 기본 연결 상태 로컬스토리지 저장 및 동기화
      const defaultConns = [
        { id: 'youtube', connected: false, handle: '' },
        { id: 'instagram', connected: false, handle: '' },
        { id: 'threads', connected: false, handle: '' },
        { id: 'tiktok', connected: false, handle: '' }
      ];
      localStorage.setItem('sns_connections', JSON.stringify(defaultConns));
    }
  }, []);

  const connectedCount = channels.filter(c => c.status === 'connected').length;
  const connectedNames = channels.filter(c => c.status === 'connected').map(c => c.name.split(' ')[0]).join(', ');

  const stats = [
    { label: '연결된 채널', value: `${connectedCount}개`, change: connectedNames || '연결된 채널 없음', icon: '🔗', color: '#2563eb' },
    { label: '이번 달 발행 건수', value: `${totalHistoryCount}건`, change: totalHistoryCount > 0 ? '실시간 발행 반영됨' : '발행 기록 없음', icon: '🚀', color: '#16a34a' },
    { label: '대기 중인 예약', value: '0건', change: '예약된 콘텐츠 없음', icon: '📅', color: '#ea580c' },
    { label: '평균 도달률', value: totalHistoryCount > 0 ? '92.4%' : '0.0%', change: totalHistoryCount > 0 ? '도달률 측정 중' : '데이터 없음', icon: '📈', color: '#7c3aed' },
  ];

  const cssStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Noto+Sans+KR:wght@300;400;700&display=swap');

    .dashboard-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 2.5rem 2rem;
      box-sizing: border-box;
    }

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      animation: fadeInDown 0.6s ease-out;
    }

    .welcome-text h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #0f172a;
      margin-bottom: 0.25rem;
      margin-top: 0;
    }

    .welcome-text p {
      color: #64748b;
      font-size: 1rem;
      font-weight: 400;
      margin: 0;
    }

    .profile-badge {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      animation: fadeInUp 0.6s ease-out;
    }

    .glass-card {
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px -2px rgba(50, 50, 93, 0.04), 0 2px 8px -1px rgba(0, 0, 0, 0.02);
      transition: all 0.25s ease-out;
      position: relative;
      overflow: hidden;
    }

    .glass-card:hover {
      transform: translateY(-2px);
      border-color: #e2e8f0;
      box-shadow: 0 10px 25px -3px rgba(50, 50, 93, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
    }

    .stat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      background: #f8fafc;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .stat-value {
      font-size: 2.1rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .stat-change {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .main-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      animation: fadeInUp 0.8s ease-out;
    }

    @media (max-width: 900px) {
      .main-layout {
        grid-template-columns: 1fr;
      }
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 0.5rem;
    }

    .section-action-btn {
      background: transparent;
      border: none;
      color: #2563eb;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.15s;
    }

    .section-action-btn:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }

    .channel-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .channel-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      transition: all 0.15s;
    }

    .channel-row:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
    }

    .channel-info {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .channel-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .channel-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: #0f172a;
    }

    .channel-handle {
      font-size: 0.8rem;
      color: #64748b;
    }

    .channel-status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }

    .channel-status-badge.connected {
      background: rgba(22, 163, 74, 0.08);
      color: #16a34a;
    }

    .channel-status-badge.disconnected {
      background: rgba(220, 38, 38, 0.08);
      color: #dc2626;
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-card {
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      transition: all 0.15s;
    }

    .activity-card:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
    }

    .activity-main {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .activity-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: #0f172a;
    }

    .activity-platforms {
      display: flex;
      gap: 0.4rem;
    }

    .platform-tag {
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .platform-tag.youtube { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
    .platform-tag.instagram { background: rgba(236, 72, 153, 0.08); color: #ec4899; }
    .platform-tag.threads { background: rgba(15, 23, 42, 0.08); color: #0f172a; }

    .activity-meta {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      align-items: flex-end;
    }

    .activity-date {
      font-size: 0.8rem;
      color: #64748b;
    }

    .status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 0.35rem;
    }

    .status-dot.success { background-color: #16a34a; }
    .status-dot.scheduled { background-color: #ea580c; }

    .quick-publish-bar {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1px solid #bfdbfe;
      border-radius: 16px;
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      animation: fadeInUp 0.6s ease-out;
    }

    .quick-publish-btn {
      background: #2563eb;
      border: none;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .quick-publish-btn:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  if (!isMounted || !currentUser.email) {
    return null; // 하이드레이션 방지 및 권한 로딩 대기
  }

  return (
    <div className="dashboard-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      {/* 대시보드 헤더 */}
      <div className="welcome-header">
        <div className="welcome-text">
          <h1>Spread 대시보드</h1>
          <p>오늘도 여러 채널에 당신의 이야기를 동시에 널리 퍼뜨려 볼까요? ✨</p>
        </div>
        <div className="profile-badge">
          <span>
            {currentUser.role === '슈퍼 관리자' ? '👑' : '👤'}{' '}
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* 원클릭 발행 바로가기 퀵바 */}
      <div className="quick-publish-bar">
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem', color: '#1e3a8a' }}>새로운 콘텐츠를 발행할 준비가 되었나요?</h3>
          <p style={{ color: '#60a5fa', fontSize: '0.85rem', margin: 0 }}>인스타, 스레드, 유튜브 쇼츠에 동시 업로드를 시작하세요.</p>
        </div>
        <button 
          className="quick-publish-btn"
          onClick={() => window.location.href = '/publish'}
        >
          원클릭 발행하기 🚀
        </button>
      </div>

      {/* 통계 요약 영역 */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card">
            <div className="stat-card-header">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-icon" style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* 메인 레이아웃 분할 */}
      <div className="main-layout">
        
        {/* 왼쪽: 내 채널 연결 현황 */}
        <div className="glass-card">
          <div className="section-title">
            <span>연결된 채널 관리</span>
            <button className="section-action-btn" onClick={() => window.location.href = '/connections'}>
              + 새 채널 연결
            </button>
          </div>
          <div className="channel-list">
            {channels.map((chan, i) => (
              <div key={i} className="channel-row">
                <div className="channel-info">
                  <div className="channel-avatar">{chan.icon}</div>
                  <div>
                    <div className="channel-name">{chan.name}</div>
                    <div className="channel-handle">{chan.handle}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {chan.followers !== '-' && (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>팔로워: {chan.followers}</span>
                  )}
                  <span className={`channel-status-badge ${chan.status}`}>
                    {chan.status === 'connected' ? '연결됨' : '연결 안 됨'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 최근 발행 히스토리 */}
        <div className="glass-card">
          <div className="section-title">
            <span>최근 발행 히스토리</span>
            <button className="section-action-btn" onClick={() => window.location.href = '/history'}>
              전체 보기 ➡️
            </button>
          </div>
          <div className="activity-timeline">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-card">
                <div className="activity-main">
                  <div className="activity-title">{act.title}</div>
                  <div className="activity-platforms">
                    {act.platforms.map((p: any, idx: number) => (
                      <span key={idx} className={`platform-tag ${p}`}>{p}</span>
                    ))}
                  </div>
                </div>
                <div className="activity-meta">
                  <div className="activity-date">{act.date}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    <span className={`status-dot ${act.status === 'SUCCESS' ? 'success' : 'scheduled'}`}></span>
                    {act.status === 'SUCCESS' ? '발행 완료' : '예약 대기'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
