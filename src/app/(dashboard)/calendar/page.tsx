'use client';

import React, { useState, useEffect } from 'react';

interface CalendarEvent {
  id: number;
  day: number;
  month?: number;
  year?: number;
  title: string;
  platforms: string[];
  time: string;
}

export default function CalendarPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 기본 5월
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setIsMounted(true);
    // 현재 날짜 기준으로 년월 초기설정
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);

    // 로컬스토리지에서 발행 목록 동적 로드
    const stored = localStorage.getItem('publish_history');
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const cssStyles = `
    .calendar-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 2.5rem 2rem;
      box-sizing: border-box;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .calendar-title-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .calendar-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .month-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.25rem 0.5rem;
    }

    .month-nav-btn {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .month-nav-btn:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }

    .current-month-text {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      padding: 0 0.5rem;
    }

    .view-btn {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }

    .calendar-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      overflow: hidden;
    }

    .weekdays-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .weekday {
      padding: 1rem;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #64748b;
    }

    .weekday.sunday {
      color: #ef4444;
    }

    .weekday.saturday {
      color: #2563eb;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: minmax(110px, 1fr);
    }

    .day-cell {
      padding: 0.75rem;
      border-right: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: background-color 0.2s;
      position: relative;
    }

    .day-cell:nth-child(7n) {
      border-right: none;
    }

    .day-cell:hover {
      background-color: #f8fafc;
    }

    .day-number {
      font-size: 0.9rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 0.5rem;
    }

    .day-cell.empty {
      background-color: #fcfdfe;
      cursor: default;
    }

    .day-cell.empty .day-number {
      color: #cbd5e1;
    }

    .day-cell.sunday .day-number {
      color: #ef4444;
    }

    .day-cell.saturday .day-number {
      color: #2563eb;
    }

    .event-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      overflow-y: auto;
      max-height: 80px;
    }

    .event-item {
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.25rem 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.25rem;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .event-item:hover {
      transform: translateY(-1px);
      border-color: #cbd5e1;
    }

    .event-title {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1;
    }

    .event-platforms {
      display: flex;
      gap: 0.15rem;
      flex-shrink: 0;
    }

    .event-platform-dot {
      font-size: 0.65rem;
    }
  `;

  if (!isMounted) {
    return null;
  }

  // 2026년 4월 달력 빌드 (4월 1일은 수요일 시작, 총 30일)
  const renderDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const startOffset = firstDayOfMonth.getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    const cells: React.ReactNode[] = [];

    // 이전 달 빈 칸 채우기
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push(
        <div key={`empty-prev-${i}`} className="day-cell empty">
          <span className="day-number">{prevMonthDays - i}</span>
        </div>
      );
    }

    // 이번 달 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events.filter(e => {
        const eventYear = e.year || 2026;
        const eventMonth = e.month || 5;
        return eventYear === currentYear && eventMonth === currentMonth && e.day === day;
      });

      const isSunday = (day + startOffset - 1) % 7 === 0;
      const isSaturday = (day + startOffset - 1) % 7 === 6;

      let cellClass = 'day-cell';
      if (isSunday) cellClass += ' sunday';
      if (isSaturday) cellClass += ' saturday';

      cells.push(
        <div key={`day-${day}`} className={cellClass}>
          <span className="day-number">{day}</span>
          <div className="event-list">
            {dayEvents.map(e => (
              <div 
                key={e.id} 
                className="event-item"
                onClick={() => alert(`[${e.time}] ${e.title}\n플랫폼: ${e.platforms.join(', ')}`)}
                title={`[${e.time}] ${e.title}`}
              >
                <span className="event-title">{e.title}</span>
                <div className="event-platforms">
                  {e.platforms.map((p, idx) => (
                    <span key={idx} className="event-platform-dot">
                      {p === 'youtube' && '📹'}
                      {p === 'instagram' && '📸'}
                      {p === 'threads' && '🧵'}
                      {p === 'tiktok' && '🎵'}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 다음 달 빈 칸 채우기 (총 42칸 완성)
    const totalCells = cells.length;
    const nextMonthCellsNeeded = 42 - totalCells;
    for (let i = 1; i <= nextMonthCellsNeeded; i++) {
      cells.push(
        <div key={`empty-next-${i}`} className="day-cell empty">
          <span className="day-number">{i}</span>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="calendar-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      
      <div className="calendar-header">
        <div className="calendar-title-group">
          <h1 className="calendar-title">콘텐츠 캘린더</h1>
          <div className="month-nav">
            <button className="month-nav-btn" onClick={handlePrevMonth}>◀</button>
            <span className="current-month-text">{currentYear}년 {currentMonth}월</span>
            <button className="month-nav-btn" onClick={handleNextMonth}>▶</button>
          </div>
        </div>
        <button className="view-btn" onClick={() => window.location.href = '/history'}>
          📄 리스트 뷰로 보기
        </button>
      </div>

      <div className="calendar-card">
        {/* 요일 헤더 */}
        <div className="weekdays-grid">
          <div className="weekday sunday">일</div>
          <div className="weekday">월</div>
          <div className="weekday">화</div>
          <div className="weekday">수</div>
          <div className="weekday">목</div>
          <div className="weekday">금</div>
          <div className="weekday">토</div>
        </div>

        {/* 날짜 그리드 */}
        <div className="days-grid">
          {renderDays()}
        </div>
      </div>
    </div>
  );
}
