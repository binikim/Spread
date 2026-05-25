'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserItem {
  id?: number;
  name: string;
  email: string;
  role: '슈퍼 관리자' | '일반 회원';
  subscription?: string;
  joinedDate?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    setIsMounted(true);

    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      window.location.href = '/login';
      return;
    }
    try {
      const user = JSON.parse(stored);
      const userRole = user.role === '슈퍼관리자' ? '슈퍼 관리자' : user.role;
      if (userRole !== '슈퍼 관리자') {
        alert('이 페이지에 접근할 권한이 없습니다.');
        router.push('/');
        return;
      }
      setCurrentUserEmail(user.email || '');
    } catch (e) {
      console.error(e);
      window.location.href = '/login';
      return;
    }

    // localStorage에서 실제 데이터베이스 동기화
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        // member@spread.io 자동 필터링 및 localStorage 갱신
        const filteredUsers = parsedUsers.filter((u: any) => u.email.toLowerCase() !== 'member@spread.io');
        if (parsedUsers.length !== filteredUsers.length) {
          localStorage.setItem('users', JSON.stringify(filteredUsers));
        }

        // 혹시 예전 '슈퍼관리자' 명칭이 있으면 호환
        const cleanUsers = filteredUsers.map((u: any, idx: number) => ({
          id: u.id || idx + 1,
          name: u.name,
          email: u.email,
          role: u.role === '슈퍼관리자' ? '슈퍼 관리자' : u.role,
          subscription: u.subscription || '-',
          joinedDate: u.joinedDate || '2026. 5. 22.'
        }));
        setUsers(cleanUsers);
      } catch (e) {
        console.error(e);
      }
    }
  }, [router]);

  const totalMembers = users.length;
  const activeSubscriptions = users.filter(u => u.subscription !== '-' && u.subscription !== '없음' && u.subscription).length;
  const admins = users.filter(u => u.role === '슈퍼 관리자').length;

  const handleInvite = () => {
    alert('회원 초대 기능이 준비 중입니다!');
  };

  const handleDeleteUser = (email: string) => {
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      alert('현재 로그인된 본인 계정은 삭제할 수 없습니다!');
      return;
    }

    if (confirm(`정말로 이 회원(${email})을 삭제하시겠습니까?`)) {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          const updatedUsers = parsedUsers.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          
          // 화면 상태 업데이트
          const cleanUsers = updatedUsers.map((u: any, idx: number) => ({
            id: u.id || idx + 1,
            name: u.name,
            email: u.email,
            role: u.role === '슈퍼관리자' ? '슈퍼 관리자' : u.role,
            subscription: u.subscription || '-',
            joinedDate: u.joinedDate || '2026. 5. 22.'
          }));
          setUsers(cleanUsers);
          alert('회원이 성공적으로 삭제되었습니다.');
        } catch (e) {
          console.error(e);
          alert('회원 삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  const cssStyles = `
    .admin-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 2.5rem 3rem;
      box-sizing: border-box;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
    }

    .admin-title-area h1 {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.4rem 0;
      letter-spacing: -0.03em;
    }

    .admin-title-area p {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }

    .invite-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.7rem 1.2rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.1);
    }

    .invite-btn:hover {
      background-color: #1e293b;
      transform: translateY(-1px);
    }

    .invite-btn svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    /* 카드 대시보드 그리드 */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      transition: border-color 0.2s;
    }

    .stat-card:hover {
      border-color: #cbd5e1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .stat-value {
      font-size: 2.2rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }

    /* 테이블 영역 */
    .table-container {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      overflow: hidden;
      padding: 1.5rem;
    }

    .table-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .member-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .member-table th {
      padding: 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      border-bottom: 1px solid #f1f5f9;
      background-color: #ffffff;
    }

    .member-table td {
      padding: 1.2rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.9rem;
      color: #334155;
      vertical-align: middle;
    }

    .member-table tr:last-child td {
      border-bottom: none;
    }

    .name-cell {
      font-weight: 700;
      color: #0f172a;
    }

    .email-cell {
      color: #64748b;
    }

    .role-badge {
      display: inline-flex;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      background-color: #f1f5f9;
      color: #475569;
    }

    .role-badge.super {
      background-color: #f1f5f9;
      color: #475569;
    }

    .manage-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .manage-btn:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }

    .delete-btn {
      background-color: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .delete-btn:hover {
      background-color: #ef4444;
      color: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
    }
  `;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="admin-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      
      {/* 헤더 */}
      <div className="admin-header">
        <div className="admin-title-area">
          <h1>회원 관리</h1>
          <p>팀원과 교육생을 관리하세요</p>
        </div>
        <button className="invite-btn" onClick={handleInvite}>
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '1.1rem', height: '1.1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          회원 초대
        </button>
      </div>

      {/* 요약 대시보드 카드 */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">전체 회원</div>
          <div className="stat-value">{totalMembers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">활성 구독</div>
          <div className="stat-value">{activeSubscriptions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">슈퍼 관리자</div>
          <div className="stat-value">{admins}</div>
        </div>
      </div>

      {/* 회원 목록 테이블 */}
      <div className="table-container">
        <div className="table-title">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.947 11.947 0 0112 21c-2.17 0-4.207-.576-5.963-1.584v-.109A11.947 11.947 0 0112 18c2.21 0 4.207.576 5.963 1.584V19.13zM21 7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM5.25 7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM4.5 16.518a5.053 5.053 0 015.375-3.37m0 0A5.053 5.053 0 0115 16.528m-5.125-3.38v-.003c0-1.113.285-2.16.786-3.07m0 0A5.053 5.053 0 004.5 16.518" />
          </svg>
          회원 목록
        </div>
        <table className="member-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>구독</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="name-cell">{user.name}</td>
                <td className="email-cell">{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role === '슈퍼 관리자' ? 'super' : ''}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.subscription}</td>
                <td>{user.joinedDate}</td>
                <td>
                  {user.email.toLowerCase() !== currentUserEmail.toLowerCase() && (
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteUser(user.email)}
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
