# Spread (Arc-Publisher) 🚀

> **YouTube, Instagram, Threads, TikTok**에 멀티 채널 콘텐츠를 한 번에 업로드하고 관리하는 원클릭 동시 발행 플랫폼입니다.

---

## 🛠 기술 스택

* **Core**: Next.js 14 (App Router), TypeScript
* **State & APIs**: tRPC, React
* **Database**: PostgreSQL, Prisma ORM
* **Queue**: BullMQ, Redis (비동기 업로드 처리용)
* **Styling**: Vanilla CSS (Premium Glassmorphism Design)

---

## 📋 사전 준비 사항

프로젝트를 실행하려면 아래 서비스들의 설치 및 준비가 필요합니다.

1. **Node.js** (v18 이상 권장)
2. **PostgreSQL** (데이터베이스 데이터 저장용)
3. **Redis** (BullMQ 백그라운드 워커 큐 관리용)

---

## ⚙️ 환경 변수 설정 (`.env`)

프로젝트 루트 폴더에 `.env` 파일을 생성하고 아래 항목들을 입력합니다. (템플릿은 `.env.example`을 참고하세요.)

```env
# 데이터베이스 주소 (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/spread_db?schema=public"

# Redis 연결 정보 (BullMQ)
REDIS_HOST="localhost"
REDIS_PORT=6379

# Google / YouTube OAuth 설정 (실제 연동 시 필요)
GOOGLE_CLIENT_ID="발급받은_구글_클라이언트_ID"
GOOGLE_CLIENT_SECRET="발급받은_구글_클라이언트_시크릿"
YOUTUBE_REDIRECT_URI="http://localhost:3000/api/youtube/oauth/callback"

# 애플리케이션 기본 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **유튜브 API 발급 및 OAuth 설정 상세 가이드는 하단의 [유튜브 API 연동 가이드]를 참고하세요.**

---

## 🚀 설치 및 로컬 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 데이터베이스 테이블 생성 (Prisma)
```bash
npx prisma db push
```

### 3. 애플리케이션 서버 실행

#### 개발자 모드 (실시간 코드 반영)
```bash
npm run dev
```

#### 프로덕션 모드 (빌드 후 실행)
```bash
npm run build
npm run start
```

서버가 켜지면 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 사용하실 수 있습니다.

### 4. 백그라운드 큐 워커 실행 (선택 사항)
대용량 비동기 영상 업로드를 처리하는 워커 프로세스를 시작하려면 새 터미널을 열고 아래 명령어를 실행합니다:
```bash
npx tsx worker/index.ts
```

---

## 🔑 유튜브 API 연동 가이드

실제 유튜브 계정으로의 동시 업로드를 사용하기 위해 구글 개발자 웹 서비스 계정 생성이 필요합니다.

1. **구글 개발자 콘솔 설정**:
   * [Google Cloud Console](https://console.cloud.google.com/)에 접속하여 로그인합니다.
   * **새 프로젝트**를 생성합니다.
   * **[API 및 서비스] > [라이브러리]**에서 **"YouTube Data API v3"**을 검색하여 활성화(사용)합니다.

2. **OAuth 동의 화면 등록**:
   * **[OAuth 동의 화면]** 탭으로 이동하여 User Type을 **External(외부)**로 지정합니다.
   * 필수 정보를 적고 저장한 뒤, **테스트 사용자(Test Users)** 탭에 본인의 구글 이메일을 등록해 둡니다.

3. **인증 정보 발급**:
   * **[사용자 인증 정보] > [인증 정보 만들기] > [OAuth 클라이언트 ID]**를 선택합니다.
   * 애플리케이션 유형을 **웹 애플리케이션(Web Application)**으로 지정합니다.
   * **승인된 리디렉션 URI**에 다음 주소를 등록합니다:
     ```text
     http://localhost:3000/api/youtube/oauth/callback
     ```
   * 생성 후 발급된 **클라이언트 ID**와 **보안 비밀번호(Secret)** 값을 복사하여 `.env` 파일에 기입합니다.
