'use client';

import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 기본 사용자 설정 초기화 및 강제 동기화
    const storedUsers = localStorage.getItem('users');
    let userList = [];
    if (storedUsers) {
      try {
        userList = JSON.parse(storedUsers);
        if (!Array.isArray(userList)) {
          userList = [];
        }
      } catch (e) {
        userList = [];
      }
    }
    
    // member@spread.io 삭제 처리 및 daewoongpack@naver.com 관리자 계정 보장
    let updatedUsers = userList.filter((u: any) => u && u.email && u.email.toLowerCase() !== 'member@spread.io');
    const hasAdmin = updatedUsers.some((u: any) => u.email.toLowerCase() === 'daewoongpack@naver.com');
    if (!hasAdmin) {
      updatedUsers.push({
        email: 'daewoongpack@naver.com',
        password: 'admin1234',
        name: '김사빈',
        role: '슈퍼 관리자'
      });
    }
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(email, password);
  };

  const processLogin = async (inputEmail: string, pass: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      const storedUsers = localStorage.getItem('users');
      let userList = [];
      if (storedUsers) {
        try {
          userList = JSON.parse(storedUsers);
        } catch (e) {
          console.error(e);
        }
      }

      const matchedUser = userList.find(
        (u: any) => u.email.trim().toLowerCase() === inputEmail.trim().toLowerCase() && u.password === pass
      );

      if (matchedUser) {
        // 보안상 세션 생성 시 비밀번호는 빼고 저장
        const { password, ...userSession } = matchedUser;
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        window.location.href = '/';
      } else {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.\n정보를 다시 확인해 주세요!');
      }
    }, 800);
  };

  const cssStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Noto+Sans+KR:wght@300;400;700&display=swap');

    .login-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background: radial-gradient(circle at bottom left, #1e1b4b, #0f172a, #020617);
      min-height: 100vh;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      box-sizing: border-box;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
      animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .logo-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
      text-align: left;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .form-control {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.85rem 1rem;
      color: #f8fafc;
      font-size: 0.95rem;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.25);
      background: rgba(15, 23, 42, 0.8);
    }

    .login-btn {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 0.9rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 1.5rem;
    }

    .login-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.5rem 0;
      color: #475569;
      font-size: 0.8rem;
    }

    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .divider:not(:empty)::before {
      margin-right: .5em;
    }

    .divider:not(:empty)::after {
      margin-left: .5em;
    }

    .fast-login-btn {
      width: 100%;
      border: none;
      color: white;
      padding: 0.85rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .fast-login-btn.super {
      background: linear-gradient(135deg, #a855f7, #ec4899);
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.25);
    }

    .fast-login-btn.super:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);
    }

    .fast-login-btn.admin {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.25);
    }

    .fast-login-btn.admin:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
    }

    .fast-login-btn.member {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.25);
    }

    .fast-login-btn.member:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s infinite linear;
      margin: 0 auto;
    }

    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="login-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      
      <div className="glass-card">
        <h1 className="logo-title">Arc-Publisher</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          원하시는 역할로 즉시 로그인해 보세요
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="input-email">이메일 주소</label>
            <input
              id="input-email"
              type="email"
              className="form-control"
              placeholder="daewoongpack@naver.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-password">비밀번호</label>
            <input
              id="input-password"
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : '로그인'}
          </button>
        </form>

        <div className="divider">또는</div>

        <button 
          type="button" 
          className="fast-login-btn super" 
          style={{ marginBottom: '1.5rem', width: '100%' }}
          onClick={() => {
            setEmail('daewoongpack@naver.com');
            setPassword('admin1234');
            processLogin('daewoongpack@naver.com', 'admin1234');
          }}
        >
          ⚡ 슈퍼 관리자로 빠른 로그인
        </button>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
          아직 계정이 없으신가요?{' '}
          <a 
            href="/register" 
            style={{ 
              color: '#a855f7', 
              fontWeight: 700, 
              textDecoration: 'none', 
              transition: 'color 0.2s',
              cursor: 'pointer'
            }}
          >
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}
