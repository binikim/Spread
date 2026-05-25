'use client';

import React, { useState, useRef, useEffect } from 'react';

// 플랫폼 정의
type Platform = 'youtube' | 'instagram' | 'threads' | 'tiktok';

interface PlatformStatus {
  id: Platform;
  name: string;
  color: string;
  icon: string;
  enabled: boolean;
  connected: boolean;
  requiredFileType: 'video' | 'image' | 'any';
  realOAuth?: boolean;
}

export default function PublishPage() {
  const [isMounted, setIsMounted] = useState(false);

  // 하이드레이션 오류 방지 및 SNS 연결 정보 연동
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('sns_connections');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let firstConnected: Platform | null = null;
        setPlatforms(prev => {
          const next = prev.map(p => {
            const match = parsed.find((c: any) => c.id === p.id);
            const isConnected = match ? match.connected : false;
            const isReal = match ? Boolean(match.realOAuth) : false;
            if (isConnected && !firstConnected) {
              firstConnected = p.id;
            }
            return {
              ...p,
              connected: isConnected,
              enabled: false,
              realOAuth: isReal
            };
          });
          if (firstConnected) {
            setActivePreviewTab(firstConnected);
          }
          return next;
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // sns_connections 가 없는 경우에는 연결된 채널이 없는 상태로 시작
      setPlatforms(prev => prev.map(p => ({ ...p, connected: false, enabled: false })));
    }
  }, []);

  // 플랫폼 상태
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    { id: 'youtube', name: 'YouTube Shorts', color: '#FF0000', icon: 'YT', connected: false, enabled: false, requiredFileType: 'video' },
    { id: 'instagram', name: 'Instagram Reels/Post', color: '#E1306C', icon: 'IG', connected: false, enabled: false, requiredFileType: 'any' },
    { id: 'threads', name: 'Threads', color: '#ffffff', icon: 'TH', connected: false, enabled: false, requiredFileType: 'any' },
    { id: 'tiktok', name: 'TikTok', color: '#000000', icon: 'TT', connected: false, enabled: false, requiredFileType: 'video' },
  ]);

  // 입력 필드 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  
  // 파일 업로드 상태
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프리뷰 탭 선택
  const [activePreviewTab, setActivePreviewTab] = useState<Platform>('instagram');

  // 활성화된 플랫폼이 변경되었을 때, 현재 프리뷰 중인 플랫폼이 비활성화되면 다른 활성화된 플랫폼으로 자동 전환
  useEffect(() => {
    if (!isMounted) return;
    const activePlatform = platforms.find(p => p.id === activePreviewTab);
    if (activePlatform && !activePlatform.enabled) {
      const nextEnabled = platforms.find(p => p.enabled);
      if (nextEnabled) {
        setActivePreviewTab(nextEnabled.id);
      }
    }
  }, [platforms, activePreviewTab, isMounted]);

  // 발행 프로세스 상태
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState<string>('');
  const [publishProgress, setPublishProgress] = useState<{ [key in Platform]?: 'idle' | 'running' | 'success' | 'failed' }>({
    youtube: 'idle',
    instagram: 'idle',
    threads: 'idle',
    tiktok: 'idle'
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setFileType(type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const togglePlatform = (id: Platform) => {
    const isConnected = Boolean(platforms.find(p => p.id === id)?.connected);

    if (!isConnected) {
      if (confirm(`${id.toUpperCase()} 계정이 아직 연결되지 않았습니다.\n계정 연결 페이지로 이동할까요?`)) {
        window.location.href = '/connections';
      }
      return;
    }

    setPlatforms(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p));
      const target = next.find(p => p.id === id);
      if (target && target.enabled) {
        setActivePreviewTab(id);
      }
      return next;
    });
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublish = async () => {
    const enabledPlatforms = platforms.filter(p => p.enabled);
    if (enabledPlatforms.length === 0) {
      alert('발행할 플랫폼을 최소 하나 이상 선택해 주세요!');
      return;
    }

    const realPlatforms = enabledPlatforms.filter(p => p.realOAuth);
    const mockPlatforms = enabledPlatforms.filter(p => !p.realOAuth);

    // 유튜브 실제 업로드 검증
    if (realPlatforms.some(p => p.id === 'youtube')) {
      if (!title) {
        alert('YouTube Shorts 실제 발행을 위해 제목을 입력해 주세요!');
        return;
      }
      if (!selectedFile || fileType !== 'video') {
        alert('YouTube 실제 업로드에는 MP4/WebM 같은 동영상 파일이 필요합니다.');
        return;
      }
    } else {
      // 유튜브 가상 업로드 검증
      if (enabledPlatforms.some(p => p.id === 'youtube') && !title) {
        alert('YouTube Shorts 발행을 위해 제목을 입력해 주세요!');
        return;
      }
    }

    if (!content) {
      alert('게시글 내용을 입력해 주세요!');
      return;
    }

    setIsPublishing(true);
    setPublishProgress({ youtube: 'idle', instagram: 'idle', threads: 'idle', tiktok: 'idle' });

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let youtubeUpload: { videoId: string; url: string } | null = null;

    // 1. 실제 업로드 처리 (구글 API 키가 있어야 연동 완료 가능)
    for (const platform of realPlatforms) {
      setPublishStep(`${platform.name} 실제 업로드 중...`);
      setPublishProgress(prev => ({ ...prev, [platform.id]: 'running' }));

      if (platform.id === 'youtube') {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile as File);
          formData.append('title', title);
          formData.append('description', `${content}${tags ? `\n\n${tags.split(',').map(t => `#${t.trim().replace(/^#/, '')}`).join(' ')}` : ''}`);
          formData.append('privacyStatus', 'private');

          const response = await fetch('/api/youtube/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'YouTube 업로드에 실패했습니다.');
          }

          youtubeUpload = { videoId: data.videoId, url: data.url };
          setPublishProgress(prev => ({ ...prev, [platform.id]: 'success' }));
        } catch (error) {
          setPublishProgress(prev => ({ ...prev, [platform.id]: 'failed' }));
          setPublishStep(error instanceof Error ? error.message : 'YouTube 업로드에 실패했습니다.');
          setIsPublishing(false);
          return;
        }
      }
    }

    // 2. 가상 업로드 처리 (시뮬레이션 - API 키 불필요)
    for (const platform of mockPlatforms) {
      setPublishStep(`${platform.name} 가상 업로드 중 (데모 모드)...`);
      setPublishProgress(prev => ({ ...prev, [platform.id]: 'running' }));
      await delay(1200); // 로딩 효과 연출
      setPublishProgress(prev => ({ ...prev, [platform.id]: 'success' }));
    }

    setPublishStep('업로드 완료!');

    if (!youtubeUpload && enabledPlatforms.some(p => p.id === 'youtube')) {
      youtubeUpload = { videoId: 'mock_youtube_id', url: 'https://www.youtube.com/watch?v=mock_youtube_id' };
    }

    // 로컬 스토리지에 발행 기록 저장
    try {
      const stored = localStorage.getItem('publish_history');
      const history = stored ? JSON.parse(stored) : [];

      const now = new Date();
      const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${ampm} ${formattedHours}:${formattedMinutes}`;
      };

      const newPost = {
        id: Date.now(),
        title: title || '제목 없음',
        subtitle: content,
        content: content,
        status: 'success',
        uploadMode: realPlatforms.length > 0 ? 'real' : 'mock',
        youtubeVideoId: youtubeUpload?.videoId,
        youtubeUrl: youtubeUpload?.url,
        type: fileType === 'video' ? '영상' : (fileType === 'image' ? '이미지' : '텍스트'),
        date: `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${formatTime(now)}`,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        time: `${now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`,
        platforms: enabledPlatforms.map(p => p.id)
      };

      history.unshift(newPost);
      localStorage.setItem('publish_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }

    await delay(1500);
    setIsPublishing(false);
    setPublishStep('');
  };

  const cssStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Noto+Sans+KR:wght@300;400;700&display=swap');

    .publish-container {
      font-family: 'Outfit', 'Noto Sans KR', sans-serif;
      background-color: #f8fafc;
      min-height: 100vh;
      color: #0f172a;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
      animation: fadeInDown 0.8s ease-out;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.05em;
      color: #0f172a;
      margin-bottom: 0.5rem;
      margin-top: 0;
    }

    .header p {
      color: #64748b;
      font-size: 1.1rem;
      font-weight: 400;
      margin: 0;
    }

    .content-layout {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 2.5rem;
      width: 100%;
      max-width: 1300px;
      animation: fadeInUp 0.8s ease-out;
    }

    @media (max-width: 1024px) {
      .content-layout {
        grid-template-columns: 1fr;
      }
    }

    .glass-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glass-card:hover {
      border-color: #cbd5e1;
    }

    .section-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 1.5rem;
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 0.75rem;
    }

    .platform-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .platform-card {
      cursor: pointer;
      border-radius: 16px;
      padding: 1.25rem;
      text-align: center;
      font-weight: 600;
      font-size: 1.05rem;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #0f172a;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .platform-card .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
      position: absolute;
      top: 10px;
      right: 10px;
      transition: all 0.3s;
    }

    .platform-card.disconnected {
      opacity: 0.55;
    }

    .platform-state {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 700;
    }

    .platform-card.active .platform-state {
      color: #0f172a;
    }

    .platform-card.youtube.active {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
    }
    .platform-card.youtube.active .status-indicator {
      background: #ef4444;
    }

    .platform-card.instagram.active {
      border-color: #ec4899;
      background: rgba(236, 72, 153, 0.06);
    }
    .platform-card.instagram.active .status-indicator {
      background: #ec4899;
    }

    .platform-card.threads.active {
      border-color: #0f172a;
      background: rgba(15, 23, 42, 0.05);
    }
    .platform-card.threads.active .status-indicator {
      background: #0f172a;
    }

    .platform-card.tiktok.active {
      border-color: #000000;
      background: rgba(0, 0, 0, 0.05);
    }
    .platform-card.tiktok.active .status-indicator {
      background: #000000;
    }

    .platform-card:hover {
      transform: translateY(-4px);
      border-color: #cbd5e1;
    }

    .platform-card .icon-badge {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-size: 0.9rem;
      color: #475569;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .form-control {
      width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 0.85rem 1rem;
      color: #0f172a;
      font-size: 1rem;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #0f172a;
      box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 120px;
    }

    .upload-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: #64748b;
    }

    .upload-zone.dragging {
      border-color: #0f172a;
      background: rgba(15, 23, 42, 0.03);
      transform: scale(1.02);
    }

    .upload-zone:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
    }

    .upload-icon {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #0f172a, #64748b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .upload-preview-container {
      position: relative;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .upload-preview {
      width: 100%;
      max-height: 250px;
      object-fit: contain;
      background: #f1f5f9;
      display: block;
    }

    .clear-file-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: background 0.2s;
    }

    .clear-file-btn:hover {
      background: rgba(239, 68, 68, 0.9);
    }

    .preview-tabs {
      display: flex;
      background: #f1f5f9;
      padding: 0.35rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid #e2e8f0;
    }

    .preview-tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: #64748b;
      padding: 0.6rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s;
    }

    .preview-tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .phone-mockup {
      width: 100%;
      max-width: 340px;
      height: 580px;
      border: 12px solid #0f172a;
      border-radius: 40px;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .phone-notch {
      width: 140px;
      height: 24px;
      background: #0f172a;
      border-bottom-left-radius: 18px;
      border-bottom-right-radius: 18px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }

    .preview-screen {
      flex: 1;
      padding: 2.5rem 1rem 1rem 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      color: #0f172a;
      font-size: 0.85rem;
      scrollbar-width: none;
    }
    .preview-screen::-webkit-scrollbar {
      display: none;
    }

    .youtube-preview {
      background: #000000;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
      color: #ffffff;
    }

    .youtube-preview-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.6;
    }

    .youtube-overlay {
      position: relative;
      z-index: 2;
      padding: 1rem;
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .youtube-channel {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
    }

    .youtube-channel-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FF0000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: white;
    }

    .tiktok-preview {
      background: #000000;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
      color: #ffffff;
    }
    .tiktok-preview-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.6;
    }
    .tiktok-overlay {
      position: relative;
      z-index: 2;
      padding: 1rem;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .tiktok-author {
      font-weight: 700;
      font-size: 0.9rem;
    }
    .tiktok-desc {
      font-size: 0.8rem;
      line-height: 1.35;
    }
    .tiktok-music {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .instagram-preview {
      background: #ffffff;
      color: #0f172a;
    }

    .instagram-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .instagram-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
      padding: 2px;
    }
    .instagram-avatar-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: bold;
      color: #0f172a;
    }

    .instagram-media-box {
      aspect-ratio: 1;
      background: #f1f5f9;
      margin: 0.5rem -1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .instagram-media-box img, .instagram-media-box video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .instagram-actions {
      display: flex;
      gap: 0.75rem;
      padding: 0.5rem 0;
      font-size: 1.1rem;
      color: #0f172a;
    }

    .instagram-caption {
      margin-top: 0.25rem;
      line-height: 1.35;
      color: #334155;
    }

    .threads-preview {
      background: #ffffff;
      color: #0f172a;
    }

    .threads-thread {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .threads-left {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .threads-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8rem;
      border: 1px solid #e2e8f0;
    }

    .threads-line {
      flex: 1;
      width: 2px;
      background: #e2e8f0;
      margin: 4px 0;
    }

    .threads-right {
      flex: 1;
    }

    .threads-username {
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #0f172a;
    }

    .threads-content {
      margin-top: 0.25rem;
      color: #334155;
      line-height: 1.4;
      white-space: pre-wrap;
    }

    .threads-media {
      margin-top: 0.75rem;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      max-height: 180px;
    }

    .threads-media img, .threads-media video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .publishing-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .publishing-modal {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 2.5rem;
      width: 90%;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: #0f172a;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(15, 23, 42, 0.05);
      border-top-color: #0f172a;
      border-radius: 50%;
      animation: spin 1s infinite linear;
      margin: 0 auto 1.5rem auto;
    }

    .publish-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 0.75rem;
      border: 1px solid #e2e8f0;
      color: #0f172a;
    }

    .status-badge {
      font-size: 0.85rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .status-badge.idle { background: #e2e8f0; color: #64748b; }
    .status-badge.running { background: rgba(59, 130, 246, 0.1); color: #2563eb; animation: pulse 1.5s infinite; }
    .status-badge.success { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
    .status-badge.failed { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

    .publish-submit-btn {
      width: 100%;
      background: #0f172a;
      border: none;
      color: white;
      padding: 1.1rem;
      border-radius: 14px;
      font-size: 1.15rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 2rem;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    }

    .publish-submit-btn:hover {
      transform: translateY(-2px);
      background: #1e293b;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
    }

    .publish-submit-btn:active {
      transform: translateY(1px);
    }

    .demo-mode-notice {
      margin-top: 1.25rem;
      border: 1px solid #fed7aa;
      background: #fff7ed;
      color: #9a3412;
      border-radius: 8px;
      padding: 0.9rem 1rem;
      font-size: 0.88rem;
      line-height: 1.55;
      font-weight: 600;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleUp {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="publish-container">
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      {/* 헤더 */}
      <header className="header">
        <h1>Arc-Publisher</h1>
        <p>원클릭 멀티 채널 콘텐츠 동시 발행 대시보드</p>
      </header>

      {/* 대시보드 본문 레이아웃 */}
      <div className="content-layout">
        
        {/* 왼쪽: 콘텐츠 작성 카드 */}
        <div className="glass-card">
          <h2 className="section-title">
            <span>✍️</span> 콘텐츠 만들기
          </h2>

          {/* 1단계: 발행할 SNS 채널 선택 */}
          <div className="form-group">
            <label>발행할 SNS 플랫폼 선택</label>
            <div className="platform-grid">
              {platforms.map(p => (
                <div
                  key={p.id}
                  className={`platform-card ${p.id} ${p.enabled ? 'active' : ''} ${p.connected ? 'connected' : 'disconnected'}`}
                  onClick={() => togglePlatform(p.id)}
                >
                  <div className="status-indicator"></div>
                  <span className="icon-badge">{p.icon}</span>
                  <span>{p.name}</span>
                  <span className="platform-state">
                    {p.enabled ? '선택됨' : p.connected ? '연결됨' : '미연결'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2단계: 유튜브 제목 입력 */}
          <div className="form-group">
            <label htmlFor="input-title">제목 {platforms.find(p => p.id === 'youtube')?.enabled && p.realOAuth && <span style={{color:'#ef4444'}}>* (YouTube 실제 발행시 필수)</span>}</label>
            <input
              id="input-title"
              type="text"
              className="form-control"
              placeholder="영상/게시글 제목을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 3단계: 공통 본문 / 캡션 입력 */}
          <div className="form-group">
            <label htmlFor="input-content">캡션 및 본문 <span style={{color:'#ef4444'}}>*</span></label>
            <textarea
              id="input-content"
              className="form-control"
              placeholder="모든 SNS에 공통으로 업로드될 본문 내용을 적어주세요. #태그 추가도 가능합니다."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
              글자 수: {content.length}자
            </div>
          </div>

          {/* 4단계: 해시태그 일괄 지정 */}
          <div className="form-group">
            <label htmlFor="input-tags">태그 (쉼표로 구분)</label>
            <input
              id="input-tags"
              type="text"
              className="form-control"
              placeholder="예: 맛집, 브이로그, 일상"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* 5단계: 미디어 파일 업로드 */}
          <div className="form-group">
            <label>미디어 파일 첨부 (동영상 또는 이미지)</label>
            {!filePreview ? (
              <div
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="upload-icon">📁</span>
                <p style={{ fontWeight: 600, margin: '0.25rem 0' }}>드래그 앤 드롭 하거나 클릭하여 파일 선택</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>MP4, WebM (동영상) 또는 JPG, PNG (이미지)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="upload-preview-container">
                <button className="clear-file-btn" onClick={clearFile} title="파일 제거">
                  ✕
                </button>
                {fileType === 'video' ? (
                  <video src={filePreview} className="upload-preview" controls />
                ) : (
                  <img src={filePreview} alt="업로드 프리뷰" className="upload-preview" />
                )}
              </div>
            )}
          </div>

          {platforms.some(p => p.enabled && !p.realOAuth) && (
            <div className="demo-mode-notice">
              선택한 플랫폼 중 가상 연동(테스트용) 채널이 포함되어 있어 일부 가상 업로드 시뮬레이션으로 진행됩니다.
            </div>
          )}

          {/* 원클릭 발행 완료 버튼 */}
          <button className="publish-submit-btn" onClick={handlePublish}>
            {platforms.some(p => p.enabled && p.realOAuth) ? '한 번에 발행하기' : '테스트 발행 기록 저장'}
          </button>
        </div>

        {/* 오른쪽: 실시간 모바일 모형 프리뷰 카드 */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title">
            <span>📱</span> 실시간 채널별 프리뷰
          </h2>

          {/* 프리뷰 전환 탭 */}
          <div className="preview-tabs">
            <button
              className={`preview-tab-btn ${activePreviewTab === 'instagram' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('instagram')}
            >
              Instagram
            </button>
            <button
              className={`preview-tab-btn ${activePreviewTab === 'threads' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('threads')}
            >
              Threads
            </button>
            <button
              className={`preview-tab-btn ${activePreviewTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('youtube')}
            >
              YouTube
            </button>
            <button
              className={`preview-tab-btn ${activePreviewTab === 'tiktok' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('tiktok')}
            >
              TikTok
            </button>
          </div>

          {/* 스마트폰 목업 */}
          <div className="phone-mockup">
            <div className="phone-notch"></div>
            
            <div className="preview-screen">
              
              {/* Instagram 피드 미리보기 */}
              {activePreviewTab === 'instagram' && (
                <div className="instagram-preview">
                  <div className="instagram-header">
                    <div className="instagram-avatar">
                      <div className="instagram-avatar-inner">IG</div>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700 }}>my_instagram_id</span>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Seoul, Korea</div>
                    </div>
                  </div>
                  
                  <div className="instagram-media-box">
                    {filePreview ? (
                      fileType === 'video' ? (
                        <video src={filePreview} autoPlay loop muted />
                      ) : (
                        <img src={filePreview} alt="Instagram 미디어" />
                      )
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>미디어가 첨부되면 여기에 표시됩니다.</span>
                    )}
                  </div>

                  <div className="instagram-actions">
                    <span>❤️</span> <span>💬</span> <span>✈️</span>
                  </div>

                  <div className="instagram-caption">
                    <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>my_instagram_id</span>
                    {content || '이곳에 작성한 본문 캡션이 표시됩니다.'}
                    <div style={{ color: '#38bdf8', marginTop: '0.25rem' }}>
                      {tags ? tags.split(',').map(t => `#${t.trim()}`).join(' ') : ''}
                    </div>
                  </div>
                </div>
              )}

              {/* Threads 포스트 미리보기 */}
              {activePreviewTab === 'threads' && (
                <div className="threads-preview">
                  <div className="threads-thread">
                    <div className="threads-left">
                      <div className="threads-avatar">TH</div>
                      <div className="threads-line"></div>
                    </div>
                    <div className="threads-right">
                      <div className="threads-username">
                        <span>my_threads_id</span>
                        <span style={{ fontSize: '0.75rem', color: '#555' }}>지금</span>
                      </div>
                      <div className="threads-content">
                        {content || '스레드 본문이 여기에 표시됩니다.'}
                        <div style={{ color: '#38bdf8', marginTop: '0.25rem' }}>
                          {tags ? tags.split(',').map(t => `#${t.trim()}`).join(' ') : ''}
                        </div>
                      </div>

                      {filePreview && (
                        <div className="threads-media">
                          {fileType === 'video' ? (
                            <video src={filePreview} autoPlay loop muted />
                          ) : (
                            <img src={filePreview} alt="Threads 미디어" />
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '1rem' }}>
                        <span>🤍</span> <span>💬</span> <span>🔁</span> <span>✈️</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube Shorts 미리보기 */}
              {activePreviewTab === 'youtube' && (
                <div className="youtube-preview">
                  {filePreview && fileType === 'video' ? (
                    <video src={filePreview} className="youtube-preview-video" autoPlay loop muted />
                  ) : (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', boxSizing: 'border-box'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>YouTube Shorts는 비디오 파일을 첨부해야 배경이 표시됩니다.</span>
                    </div>
                  )}

                  <div className="youtube-overlay">
                    <div className="youtube-channel">
                      <div className="youtube-channel-avatar">YT</div>
                      <span>Bini Music / @Bini-tx3rv</span>
                      <span style={{ background: '#FF0000', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>구독</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      {title || 'YouTube 동영상 제목이 표시됩니다.'}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      {content || 'Shorts 설명 내용...'}
                      <span style={{ color: '#38bdf8', marginLeft: '0.25rem' }}>
                        {tags ? tags.split(',').map(t => `#${t.trim()}`).join(' ') : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TikTok 미리보기 */}
              {activePreviewTab === 'tiktok' && (
                <div className="tiktok-preview">
                  {filePreview && fileType === 'video' ? (
                    <video src={filePreview} className="tiktok-preview-video" autoPlay loop muted />
                  ) : (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', boxSizing: 'border-box'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>TikTok은 비디오 파일을 첨부해야 배경이 표시됩니다.</span>
                    </div>
                  )}

                  <div className="tiktok-overlay">
                    <div className="tiktok-author">
                      @my_tiktok_id
                    </div>
                    <div className="tiktok-desc">
                      {content || 'TikTok 동영상 설명 내용이 표시됩니다.'}
                      <span style={{ color: '#38bdf8', marginLeft: '0.25rem' }}>
                        {tags ? tags.split(',').map(t => `#${t.trim()}`).join(' ') : ''}
                      </span>
                    </div>
                    <div className="tiktok-music">
                      <span style={{ marginRight: '0.25rem' }}>🎵</span>
                      <span>원본 음향 - my_tiktok_id</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* 발행 애니메이션 팝업 */}
      {isPublishing && (
        <div className="publishing-modal-overlay">
          <div className="publishing-modal">
            <div className="spinner"></div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1.5rem' }}>멀티 플랫폼 일괄 업로드</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{publishStep}</p>

            <div style={{ textAlign: 'left' }}>
              {platforms.filter(p => p.enabled).map(p => (
                <div key={p.id} className="publish-status-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                  <span className={`status-badge ${publishProgress[p.id]}`}>
                    {publishProgress[p.id] === 'idle' && '대기 중'}
                    {publishProgress[p.id] === 'running' && '업로드 중...'}
                    {publishProgress[p.id] === 'success' && '완료 🎉'}
                    {publishProgress[p.id] === 'failed' && '실패 ✕'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
