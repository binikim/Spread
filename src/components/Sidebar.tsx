'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './Sidebar.css';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

const mainMenus: MenuItem[] = [
  {
    name: '대시보드',
    path: '/',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    name: '콘텐츠 발행',
    path: '/publish',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V3.75m0 0L7.5 8.25m4.5-4.5 4.5 4.5M5.25 19.5h13.5" />
      </svg>
    ),
  },
  {
    name: 'CSV 업로드',
    path: '/csv-upload',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25h-4.5A1.125 1.125 0 0 0 4.5 3.375v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5h6m-6 3h6" />
      </svg>
    ),
  },
  {
    name: '콘텐츠 캘린더',
    path: '/calendar',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    name: '발행 히스토리',
    path: '/history',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    name: 'SNS 계정 연결',
    path: '/connections',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
  },
];

const adminMenus: MenuItem[] = [
  {
    name: '회원 관리',
    path: '/admin',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772A5.971 5.971 0 0 0 6 18.719M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
];

function normalizeRole(role: string) {
  if (role.includes('슈퍼') || role.includes('관리')) return '슈퍼 관리자';
  return role || '사용자';
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({ name: '', email: '', role: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('currentUser');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setCurrentUser({
        name: parsed.name || '사용자',
        email: parsed.email || '',
        role: normalizeRole(parsed.role || ''),
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handlePasswordChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPw !== confirmPw) {
      window.alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPw.length < 4) {
      window.alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      window.alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const userList = JSON.parse(storedUsers);
      const userIdx = userList.findIndex((user: { email?: string }) =>
        user.email?.toLowerCase() === currentUser.email.toLowerCase(),
      );

      if (userIdx === -1) {
        window.alert('현재 로그인한 사용자를 찾을 수 없습니다.');
        return;
      }

      if (userList[userIdx].password !== currentPw) {
        window.alert('현재 비밀번호가 일치하지 않습니다.');
        return;
      }

      userList[userIdx].password = newPw;
      localStorage.setItem('users', JSON.stringify(userList));
      window.alert('비밀번호가 변경되었습니다.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error(error);
      window.alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isSelected = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  };

  if (!isMounted || !currentUser.email) {
    return <aside className="sidebar-container" style={{ width: '15rem' }} />;
  }

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo-area">
        <button type="button" className="sidebar-logo" onClick={() => handleNavigation('/')}>
          Spread
        </button>
      </div>

      <nav className="sidebar-menu-area" aria-label="주 메뉴">
        <div className="sidebar-menu-list">
          {mainMenus.map((menu) => {
            const active = isSelected(menu.path);
            return (
              <button
                key={menu.path}
                type="button"
                onClick={() => handleNavigation(menu.path)}
                className={`sidebar-menu-item ${active ? 'active' : ''}`}
              >
                {menu.icon}
                <span>{menu.name}</span>
              </button>
            );
          })}
        </div>

        {currentUser.role === '슈퍼 관리자' && (
          <div className="sidebar-section-container sidebar-section-divider">
            <p className="sidebar-section-title">관리자</p>
            <div className="sidebar-menu-list">
              {adminMenus.map((menu) => {
                const active = isSelected(menu.path);
                return (
                  <button
                    key={menu.path}
                    type="button"
                    onClick={() => handleNavigation(menu.path)}
                    className={`sidebar-menu-item ${active ? 'active' : ''}`}
                  >
                    {menu.icon}
                    <span>{menu.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden', flex: 1 }}>
          <div className="sidebar-avatar">{currentUser.name.slice(0, 1)}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-username" title={currentUser.name}>{currentUser.name}</p>
            <p className="sidebar-email" title={currentUser.email}>{currentUser.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            title="비밀번호 변경"
            className="logout-btn"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87l.22.127c.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992v.255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124l-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87l-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992v-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124l.22-.128c.332-.183.582-.495.645-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('currentUser');
              window.location.href = '/login';
            }}
            title="로그아웃"
            className="logout-btn"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="pw-modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="pw-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="pw-modal-header">
              <h3 className="pw-modal-title">비밀번호 변경</h3>
              <button type="button" className="pw-modal-close-btn" onClick={() => setIsPasswordModalOpen(false)}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="pw-form-group">
                <label htmlFor="current-password">현재 비밀번호</label>
                <input id="current-password" type="password" className="pw-form-control" value={currentPw} onChange={(event) => setCurrentPw(event.target.value)} required />
              </div>
              <div className="pw-form-group">
                <label htmlFor="new-password">새 비밀번호</label>
                <input id="new-password" type="password" className="pw-form-control" value={newPw} onChange={(event) => setNewPw(event.target.value)} required />
              </div>
              <div className="pw-form-group">
                <label htmlFor="confirm-password">새 비밀번호 확인</label>
                <input id="confirm-password" type="password" className="pw-form-control" value={confirmPw} onChange={(event) => setConfirmPw(event.target.value)} required />
              </div>
              <button type="submit" className="pw-submit-btn">변경 완료</button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
