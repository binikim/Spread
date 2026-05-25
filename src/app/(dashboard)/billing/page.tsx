'use client';

import React, { useState, useEffect } from 'react';

export default function BillingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('PRO');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cssStyles = `
    .billing-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 2.5rem 2rem;
      box-sizing: border-box;
    }

    .billing-header {
      margin-bottom: 2rem;
    }

    .billing-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .billing-desc {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }

    /* 상단 정보 카드 */
    .current-plan-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .plan-info h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .plan-info p {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .plan-badge {
      background-color: #0f172a;
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 8px;
    }

    /* 플랜 그리드 */
    .plan-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .plan-tier-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2.25rem 2rem;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      transition: all 0.2s;
    }

    .plan-tier-card:hover {
      border-color: #cbd5e1;
      transform: translateY(-4px);
    }

    .plan-tier-card.active {
      border-color: #0f172a;
      box-shadow: 0 10px 20px rgba(15,23,42,0.05);
    }

    .popular-tag {
      position: absolute;
      top: 12px;
      right: 12px;
      background-color: #f1f5f9;
      color: #0f172a;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .tier-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .tier-price {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 1.5rem 0;
    }

    .tier-price span {
      font-size: 0.85rem;
      font-weight: 500;
      color: #64748b;
    }

    .tier-features {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: #475569;
    }

    .tier-features li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .select-plan-btn {
      width: 100%;
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 0.75rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .select-plan-btn:hover {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }

    .select-plan-btn.current {
      background-color: #0f172a;
      border-color: #0f172a;
      color: #ffffff;
      cursor: default;
    }
  `;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="billing-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div className="billing-header">
        <h1 className="billing-title">구독 및 요금 관리</h1>
        <p className="billing-desc">사용 등급에 알맞은 구독 요금제를 변경하거나 결제 정보를 등록하세요.</p>
      </div>

      <div className="current-plan-card">
        <div className="plan-info">
          <h3>현재 구독 중인 요금제</h3>
          <p>다음 결제일: 2026년 6월 22일 (매월 29,900원 결제 예정)</p>
        </div>
        <div className="plan-badge">
          {currentPlan} 등급
        </div>
      </div>

      <div className="plan-grid">
        {/* FREE */}
        <div className={`plan-tier-card ${currentPlan === 'FREE' ? 'active' : ''}`}>
          <div>
            <h4 className="tier-name">Free</h4>
            <div className="tier-price">₩0 <span>/ 월</span></div>
            <ul className="tier-features">
              <li>✓ 채널 연동 최대 2개</li>
              <li>✓ 월 발행 횟수 10회 제한</li>
              <li>✓ 기본 분석 대시보드</li>
              <li>✗ CSV 대량 업로드 미지원</li>
            </ul>
          </div>
          <button 
            className={`select-plan-btn ${currentPlan === 'FREE' ? 'current' : ''}`}
            disabled={currentPlan === 'FREE'}
            onClick={() => setCurrentPlan('FREE')}
          >
            {currentPlan === 'FREE' ? '사용 중' : '무료 체험'}
          </button>
        </div>

        {/* PRO */}
        <div className={`plan-tier-card ${currentPlan === 'PRO' ? 'active' : ''}`}>
          <span className="popular-tag">추천 ★</span>
          <div>
            <h4 className="tier-name">Pro</h4>
            <div className="tier-price">₩29,900 <span>/ 월</span></div>
            <ul className="tier-features">
              <li>✓ 채널 무제한 연동</li>
              <li>✓ 월 발행 횟수 무제한</li>
              <li>✓ 상세 채널 통계 보고서</li>
              <li>✓ CSV 대량 업로드 지원</li>
            </ul>
          </div>
          <button 
            className={`select-plan-btn ${currentPlan === 'PRO' ? 'current' : ''}`}
            disabled={currentPlan === 'PRO'}
            onClick={() => setCurrentPlan('PRO')}
          >
            {currentPlan === 'PRO' ? '사용 중' : '요금제 선택'}
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className={`plan-tier-card ${currentPlan === 'ENTERPRISE' ? 'active' : ''}`}>
          <div>
            <h4 className="tier-name">Enterprise</h4>
            <div className="tier-price">문의 필요 <span>/ 맞춤</span></div>
            <ul className="tier-features">
              <li>✓ 대규모 팀 협업 계정</li>
              <li>✓ 전용 API 액세스 연동</li>
              <li>✓ 1:1 담당 매니저 배정</li>
              <li>✓ SLA 보장 및 기술 지원</li>
            </ul>
          </div>
          <button 
            className={`select-plan-btn ${currentPlan === 'ENTERPRISE' ? 'current' : ''}`}
            disabled={currentPlan === 'ENTERPRISE'}
            onClick={() => setCurrentPlan('ENTERPRISE')}
          >
            {currentPlan === 'ENTERPRISE' ? '사용 중' : '영업 문의'}
          </button>
        </div>
      </div>
    </div>
  );
}
