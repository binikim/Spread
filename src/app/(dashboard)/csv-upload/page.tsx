'use client';

import React, { useState, useEffect } from 'react';

export default function CSVUploadPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('CSV 파일만 업로드할 수 있습니다!');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('CSV 파일만 업로드할 수 있습니다!');
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const cssStyles = `
    .csv-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 2.5rem 2rem;
      box-sizing: border-box;
    }

    .csv-header {
      margin-bottom: 2rem;
    }

    .csv-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .csv-desc {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }

    .csv-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .info-box {
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }

    .info-title {
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
      font-size: 0.95rem;
    }

    .info-list {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.85rem;
      color: #475569;
      line-height: 1.6;
    }

    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 14px;
      padding: 3rem 1.5rem;
      text-align: center;
      background-color: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .drop-zone.dragging {
      border-color: #0f172a;
      background-color: rgba(15, 23, 42, 0.03);
    }

    .drop-zone:hover {
      border-color: #94a3b8;
      background-color: #f1f5f9;
    }

    .upload-icon {
      font-size: 2.5rem;
    }

    .upload-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .upload-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .download-template-btn {
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
      transition: all 0.2s;
    }

    .download-template-btn:hover {
      background-color: #f1f5f9;
      border-color: #94a3b8;
    }

    .file-preview-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      background-color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1.5rem;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .file-icon {
      font-size: 1.75rem;
    }

    .file-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .file-size {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }

    .delete-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      transition: color 0.2s;
    }

    .delete-btn:hover {
      color: #ef4444;
    }

    .submit-btn {
      width: 100%;
      background-color: #0f172a;
      color: #ffffff;
      border: none;
      padding: 1rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 2rem;
      transition: background-color 0.2s;
    }

    .submit-btn:hover {
      background-color: #1e293b;
    }

    .submit-btn:disabled {
      background-color: #cbd5e1;
      color: #94a3b8;
      cursor: not-allowed;
    }
  `;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="csv-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div className="csv-header">
        <h1 className="csv-title">CSV 대량 업로드</h1>
        <p className="csv-desc">정해진 CSV 템플릿에 맞추어 여러 개의 콘텐츠 예약을 한 번에 등록해 보세요.</p>
      </div>

      <div className="csv-card">
        <div className="info-box">
          <h3 className="info-title">💡 업로드 방법 및 서식 안내</h3>
          <ul className="info-list">
            <li>반드시 Spread 제공 CSV 템플릿의 컬럼명과 순서를 지켜주세요.</li>
            <li>컬럼 구성: <b>제목(Title)</b>, <b>내용(Content)</b>, <b>태그(Tags)</b>, <b>예약일시(PublishDate)</b>, <b>타겟플랫폼(Platforms - 쉼표구분)</b></li>
            <li>미디어 파일의 경우 대량 업로드 완료 후 대기열에서 개별 지정하거나 URL 형태로 지정해야 합니다.</li>
          </ul>
        </div>

        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('csv-input')?.click()}
        >
          <input 
            type="file" 
            id="csv-input" 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
          <span className="upload-icon">📄</span>
          <p className="upload-title">CSV 파일을 드래그하여 놓거나 클릭하여 선택하세요</p>
          <p className="upload-subtitle">허용 형식: .csv (최대 크기 10MB)</p>
          
          <button 
            type="button" 
            className="download-template-btn"
            onClick={(e) => {
              e.stopPropagation();
              alert('템플릿 다운로드가 시작됩니다. (샘플 파일: spread_template.csv)');
            }}
          >
            📥 템플릿 다운로드
          </button>
        </div>

        {selectedFile && (
          <div className="file-preview-card">
            <div className="file-info">
              <span className="file-icon">📊</span>
              <div>
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button className="delete-btn" onClick={clearFile}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '1.2rem', height: '1.2rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        <button 
          className="submit-btn" 
          disabled={!selectedFile}
          onClick={() => {
            alert('CSV 분석 및 대량 등록이 성공적으로 처리되었습니다! 대시보드 또는 캘린더에서 확인하세요.');
            setSelectedFile(null);
          }}
        >
          대량 등록 시작하기 🚀
        </button>
      </div>
    </div>
  );
}
