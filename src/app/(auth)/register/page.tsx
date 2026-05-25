'use client';

import React, { useState, useEffect } from 'react';

export default function RegisterPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 기본 사용자 설정이 없을 때 초기화
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      const defaultUsers = [
        {
          email: 'daewoongpack@naver.com',
          password: 'admin1234',
          name: '김사빈',
          role: '슈퍼 관리자'
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    } else {
      // 기존 저장된 사용자 중 member@spread.io 삭제 처리
      try {
        const parsedUsers = JSON.parse(storedUsers);
        const updatedUsers = parsedUsers.filter((u: any) => u.email.toLowerCase() !== 'member@spread.io');
        if (parsedUsers.length !== updatedUsers.length) {
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다. 다시 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const storedUsers = localStorage.getItem('users');
      let userList = [];
      if (storedUsers) {
        try {
          userList = JSON.parse(storedUsers);
        } catch (err) {
          console.error(err);
        }
      }

      // 이메일 중복 체크
      const isDuplicate = userList.some(
        (u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (isDuplicate) {
        alert('이미 가입된 이메일 주소입니다. 다른 이메일을 사용해 주세요.');
        return;
      }

      // 새로운 회원 객체 생성 (기본은 일반 회원)
      const newUser = {
        email: email.trim(),
        password: password,
        name: name.trim(),
        role: '일반 회원',
        subscription: '-',
        joinedDate: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        }).replace(/\s/g, '').slice(0, -1) // '2026.5.22' 형태로 가공
      };

      userList.push(newUser);
      localStorage.setItem('users', JSON.stringify(userList));

      alert('회원가입이 성공적으로 완료되었습니다!\n로그인 페이지로 이동합니다.');
      window.location.href = '/login';
    }, 800);
  };

  const cssStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Noto+Sans+KR:wght@300;400;700&display=swap');

    .register-container {
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
      padding: 2.5rem 2.5rem;
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
      margin-bottom: 1rem;
      text-align: left;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 0.4rem;
      font-weight: 600;
    }

    .form-control {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.8rem 1rem;
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

    .register-btn {
      width: 100%;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      border: none;
      color: white;
      padding: 0.9rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 1.25rem;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.25);
    }

    .register-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);
    }

    .register-btn:disabled {
      background: rgba(255, 255, 255, 0.05);
      color: #64748b;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.25rem 0;
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
    <div className="register-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      
      <div className="glass-card">
        <h1 className="logo-title">Arc-Publisher</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          새로운 일반 회원 계정을 만드세요
        </p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="input-name">이름</label>
            <input
              id="input-name"
              type="text"
              className="form-control"
              placeholder="이름 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-email">이메일 주소</label>
            <input
              id="input-email"
              type="email"
              className="form-control"
              placeholder="example@spread.io"
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
              placeholder="비밀번호 (4자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-confirm-password">비밀번호 확인</label>
            <input
              id="input-confirm-password"
              type="password"
              className="form-control"
              placeholder="비밀번호 다시 입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : '가입 완료 🚀'}
          </button>
        </form>

        <div className="divider">또는</div>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
          이미 계정이 있으신가요?{' '}
          <a 
            href="/login" 
            style={{ 
              color: '#a855f7', 
              fontWeight: 700, 
              textDecoration: 'none', 
              transition: 'color 0.2s',
              cursor: 'pointer'
            }}
          >
            로그인
          </a>
        </p>
      </div>
    </div>
  );
}
