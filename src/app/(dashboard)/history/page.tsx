'use client';

import React, { useState, useEffect } from 'react';

interface HistoryItem {
  id: number;
  title: string;
  subtitle: string;
  status: 'publishing' | 'success' | 'failed';
  type: string;
  date: string;
  platforms: ('youtube' | 'instagram' | 'threads' | 'tiktok')[];
}

export default function HistoryPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('publish_history');
    if (stored) {
      try {
        setHistoryItems(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }

    const handleOutsideClick = () => {
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleViewDetail = (item: HistoryItem) => {
    alert(`[발행 세부 정보]\n\n제목: ${item.title}\n본문: ${item.subtitle}\n날짜: ${item.date}\n유형: ${item.type}\n플랫폼: ${item.platforms.join(', ')}`);
    setActiveMenuId(null);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('이 발행 기록을 삭제하시겠습니까? (실제 업로드된 SNS 글은 삭제되지 않습니다)')) {
      const updated = historyItems.filter(item => item.id !== id);
      setHistoryItems(updated);
      localStorage.setItem('publish_history', JSON.stringify(updated));
    }
    setActiveMenuId(null);
  };

  const cssStyles = `
    .history-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 2.5rem 3rem;
      box-sizing: border-box;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
    }

    .history-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.6rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }

    .refresh-btn:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }

    .refresh-btn svg {
      width: 1rem;
      height: 1rem;
    }

    .view-toggle-group {
      display: flex;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.25rem;
      border-radius: 10px;
      gap: 0.15rem;
    }

    .view-toggle-btn {
      background: transparent;
      border: none;
      color: #64748b;
      padding: 0.45rem 0.65rem;
      border-radius: 7px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease-in-out;
    }

    .view-toggle-btn.active {
      background-color: #0f172a;
      color: #ffffff;
    }

    .view-toggle-btn svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    /* 필터 바 스타일 */
    .filter-bar-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 0.85rem 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.01);
    }

    .filter-left-group {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .date-picker-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 0.75rem;
      border-radius: 10px;
      background-color: #ffffff;
    }

    .date-input-wrapper {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .date-input {
      border: none;
      outline: none;
      font-size: 0.85rem;
      color: #334155;
      font-family: inherit;
      width: 95px;
      background: transparent;
      text-align: center;
      font-weight: 500;
    }

    .date-picker-group svg {
      width: 1rem;
      height: 1rem;
      color: #94a3b8;
    }

    .date-separator {
      color: #cbd5e1;
      font-size: 0.85rem;
      margin: 0 0.2rem;
    }

    .select-status {
      border: 1px solid #e2e8f0;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      background-color: #ffffff;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.65rem center;
      background-size: 0.9rem;
    }

    .platform-capsules {
      display: flex;
      background-color: #f1f5f9;
      padding: 0.25rem;
      border-radius: 10px;
      gap: 0.25rem;
    }

    .platform-capsule {
      border: none;
      background: transparent;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .platform-capsule.active {
      background-color: #0f172a;
      color: #ffffff;
    }

    .platform-capsule svg {
      width: 1.15rem;
      height: 1.15rem;
    }

    .search-input-wrapper {
      position: relative;
      width: 250px;
    }

    .search-input {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      padding: 0.5rem 1rem 0.5rem 2.2rem;
      font-size: 0.85rem;
      outline: none;
      color: #0f172a;
      box-sizing: border-box;
      transition: border-color 0.15s;
      font-weight: 500;
    }

    .search-input:focus {
      border-color: #cbd5e1;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: #94a3b8;
    }

    /* 테이블 스타일 */
    .table-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      position: relative;
    }

    .history-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      text-align: left;
    }

    .history-table th {
      padding: 1.1rem 1.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      border-bottom: 1px solid #f1f5f9;
      background-color: #ffffff;
    }

    .history-table thead tr:first-child th:first-child {
      border-top-left-radius: 17px;
    }

    .history-table thead tr:first-child th:last-child {
      border-top-right-radius: 17px;
    }

    .history-table td {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .history-table tr:last-child td {
      border-bottom: none;
    }

    .title-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .item-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .item-subtitle {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0;
      font-weight: 500;
    }

    /* 상태 배지 */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .status-badge.publishing {
      background-color: #fffbeb;
      color: #d97706;
    }

    .status-badge.success {
      background-color: #f0fdf4;
      color: #16a34a;
    }

    .status-badge.failed {
      background-color: #fef2f2;
      color: #dc2626;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .type-text {
      font-size: 0.9rem;
      color: #475569;
      font-weight: 500;
    }

    .date-text {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    /* 플랫폼 겹치기 아이콘 */
    .platform-icons {
      display: flex;
      align-items: center;
    }

    .platform-icon-wrapper {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      color: #ffffff;
      border: 1.5px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-left: -6px;
    }

    .platform-icon-wrapper:first-child {
      margin-left: 0;
    }

    .platform-icon-wrapper svg {
      width: 0.9rem;
      height: 0.9rem;
    }

    .action-cell {
      text-align: right;
    }

    .more-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.15s, color 0.15s;
    }

    .more-btn:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }

    .table-footer {
      padding: 1rem 1.5rem;
      background-color: #ffffff;
      border-top: 1px solid #f1f5f9;
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 600;
      border-bottom-left-radius: 17px;
      border-bottom-right-radius: 17px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .action-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      z-index: 100;
      display: flex;
      flex-direction: column;
      min-width: 110px;
      overflow: hidden;
      margin-top: 4px;
      animation: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .action-dropdown button {
      background: none;
      border: none;
      padding: 0.65rem 1rem;
      font-size: 0.85rem;
      text-align: left;
      cursor: pointer;
      color: #334155;
      font-weight: 700;
      font-family: inherit;
      transition: background-color 0.15s;
      width: 100%;
    }

    .action-dropdown button:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }

    .action-dropdown button.delete-option {
      color: #ef4444;
      border-top: 1px solid #f1f5f9;
    }

    .action-dropdown button.delete-option:hover {
      background-color: #fef2f2;
    }

    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;

  const handleRefresh = () => {
    // 임시 새로고침 로직
    alert('새로고침되었습니다!');
  };

  // 필터링 및 검색 로직
  const filteredItems = historyItems.filter(item => {
    const matchesPlatform = selectedPlatform === 'all' || item.platforms.includes(selectedPlatform as any);
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  if (!isMounted) {
    return null;
  }

  return (
    <div className="history-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      {/* 헤더 */}
      <div className="history-header">
        <h1 className="history-title">발행 히스토리</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            새로고침
          </button>
          
          <div className="view-toggle-group">
            <button className="view-toggle-btn active">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button className="view-toggle-btn" onClick={() => window.location.href = '/calendar'}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008H14.25V15zm0 2.25h.008v.008H14.25v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="filter-bar-card">
        <div className="filter-left-group">
          {/* 기간 선택 인풋 */}
          <div className="date-picker-group">
            <div className="date-input-wrapper">
              <input type="text" className="date-input" placeholder="연도. 월. 일." defaultValue="2026. 04. 01" />
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
              </svg>
            </div>
            <span className="date-separator">~</span>
            <div className="date-input-wrapper">
              <input type="text" className="date-input" placeholder="연도. 월. 일." defaultValue="2026. 04. 30" />
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
              </svg>
            </div>
          </div>

          {/* 상태 드롭다운 */}
          <select 
            className="select-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="publishing">발행 중</option>
            <option value="success">완료</option>
            <option value="failed">실패</option>
          </select>

          {/* 플랫폼 필터 캡슐 */}
          <div className="platform-capsules">
            <button 
              className={`platform-capsule ${selectedPlatform === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('all')}
            >
              전체
            </button>
            
            <button 
              className={`platform-capsule ${selectedPlatform === 'youtube' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('youtube')}
              title="YouTube"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.948.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.948 24 12 24 12s0-3.948-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </button>
            
            <button 
              className={`platform-capsule ${selectedPlatform === 'instagram' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('instagram')}
              title="Instagram"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </button>
            
            <button 
              className={`platform-capsule ${selectedPlatform === 'threads' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('threads')}
              title="Threads"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.8 15.6a4.4 4.4 0 0 1-3.2 1.4c-2.4 0-4.2-1.8-4.2-4.2s1.8-4.2 4.2-4.2c1.3 0 2.4.6 3.1 1.5.2.2.1.6-.2.8-.2.2-.6.1-.8-.2a3.1 3.1 0 0 0-2.1-1.1c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c1 0 1.9-.5 2.4-1.2.1-.2.4-.3.6-.2.3.1.4.4.3.7zm1-4.8c.2-1.8-1.2-3.2-3-3.2-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2c1.9 0 3.5-1 4.3-2.6.2-.3.1-.7-.2-.9s-.7-.1-.9.2a4.1 4.1 0 0 1-3.2 2.1c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2c1.2 0 2.2.8 2.6 1.9.1.2.3.3.5.3s.4-.2.4-.4z"/>
              </svg>
            </button>
            
            <button 
              className={`platform-capsule ${selectedPlatform === 'tiktok' ? 'active' : ''}`}
              onClick={() => setSelectedPlatform('tiktok')}
              title="TikTok"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.06-1.39-.19-.14-.38-.29-.55-.44v7.37c-.03 2.23-.74 4.54-2.43 6.01-1.62 1.45-3.86 2.06-6.01 1.89-2.28-.18-4.52-1.38-5.74-3.32-1.33-2.1-1.47-4.9-.38-7.1 1.09-2.2 3.4-3.7 5.86-3.87.12 0 .24-.01.36-.02v4.07c-1.22.06-2.46.64-3.13 1.67-.78 1.17-.7 2.82.25 3.86.91.99 2.45 1.25 3.59.62.7-.38 1.14-1.12 1.17-1.92V.02h-.38z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 검색 창 */}
        <div className="search-input-wrapper">
          <input 
            type="text" 
            className="search-input" 
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="search-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 히스토리 테이블 */}
      <div className="table-card">
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>제목</th>
              <th style={{ width: '15%' }}>상태</th>
              <th style={{ width: '10%' }}>유형</th>
              <th style={{ width: '20%' }}>날짜</th>
              <th style={{ width: '12%' }}>플랫폼</th>
              <th style={{ width: '3%', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="title-cell">
                      <p className="item-title">{item.title}</p>
                      <p className="item-subtitle">{item.subtitle}</p>
                    </div>
                  </td>
                  <td>
                    {item.status === 'publishing' && (
                      <span className="status-badge publishing">
                        <svg className="spinning" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" style={{ width: '0.85rem', height: '0.85rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        발행 중
                      </span>
                    )}
                    {item.status === 'success' && (
                      <span className="status-badge success">
                        <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" style={{ width: '0.85rem', height: '0.85rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        완료
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="status-badge failed">
                        <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" style={{ width: '0.85rem', height: '0.85rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        실패
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="type-text">{item.type}</span>
                  </td>
                  <td>
                    <span className="date-text">{item.date}</span>
                  </td>
                  <td>
                    <div className="platform-icons">
                      {item.platforms.map((p, idx) => (
                        <div 
                          key={idx} 
                          className="platform-icon-wrapper" 
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            border: '1.5px solid #e2e8f0',
                            zIndex: 10 - idx
                          }}
                          title={p}
                        >
                          {p === 'youtube' && (
                            <svg fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.948.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.948 24 12 24 12s0-3.948-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          )}
                          {p === 'instagram' && (
                            <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                          )}
                          {p === 'threads' && (
                            <svg fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.8 15.6a4.4 4.4 0 0 1-3.2 1.4c-2.4 0-4.2-1.8-4.2-4.2s1.8-4.2 4.2-4.2c1.3 0 2.4.6 3.1 1.5.2.2.1.6-.2.8-.2.2-.6.1-.8-.2a3.1 3.1 0 0 0-2.1-1.1c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c1 0 1.9-.5 2.4-1.2.1-.2.4-.3.6-.2.3.1.4.4.3.7zm1-4.8c.2-1.8-1.2-3.2-3-3.2-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2c1.9 0 3.5-1 4.3-2.6.2-.3.1-.7-.2-.9s-.7-.1-.9.2a4.1 4.1 0 0 1-3.2 2.1c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2c1.2 0 2.2.8 2.6 1.9.1.2.3.3.5.3s.4-.2.4-.4z"/>
                            </svg>
                          )}
                          {p === 'tiktok' && (
                            <svg fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.06-1.39-.19-.14-.38-.29-.55-.44v7.37c-.03 2.23-.74 4.54-2.43 6.01-1.62 1.45-3.86 2.06-6.01 1.89-2.28-.18-4.52-1.38-5.74-3.32-1.33-2.1-1.47-4.9-.38-7.1 1.09-2.2 3.4-3.7 5.86-3.87.12 0 .24-.01.36-.02v4.07c-1.22.06-2.46.64-3.13 1.67-.78 1.17-.7 2.82.25 3.86.91.99 2.45 1.25 3.59.62.7-.38 1.14-1.12 1.17-1.92V.02h-.38z"/>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="action-cell">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button 
                        className="more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                      >
                        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                      
                      {activeMenuId === item.id && (
                        <div className="action-dropdown" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleViewDetail(item)}>상세 보기</button>
                          <button className="delete-option" onClick={() => handleDeleteItem(item.id)}>삭제</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  조건에 맞는 발행 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-footer">
          총 {filteredItems.length}개
        </div>
      </div>
    </div>
  );
}
