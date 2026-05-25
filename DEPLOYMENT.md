# Spread (Arc-Publisher) 배포 및 인터넷 공개 가이드 🚀

본 문서는 로컬 개발 환경에서 개발된 **Spread** 서비스를 외부 인터넷에 공개하여 누구나 접속할 수 있도록 만드는 다양한 방법을 안내합니다.

---

## 📌 목차
1. [옵션 1: 로컬 PC 서버 인터넷 공개 (로컬 터널링) - 가장 빠르고 무료](#옵션-1-로컬-pc-서버-인터넷-공개-로컬-터널링---가장-빠르고-무료)
2. [옵션 2: Docker Compose를 이용한 가상 서버(VPS) 셀프 호스팅](#옵션-2-docker-compose를-이용한-가상-서버vps-셀프-호스팅)
3. [옵션 3: 클라우드 서비스(Railway / Render)에 배포하기](#옵션-3-클라우드-서비스railway--render에-배포하기)
4. [🔑 중요: 구글/유튜브 OAuth 및 API 설정 변경](#-중요-구글유튜브-oauth-및-api-설정-변경)

---

## 옵션 1: 로컬 PC 서버 인터넷 공개 (로컬 터널링) - 가장 빠르고 무료

가장 빠르게 외부 사람들에게 데모를 보여주거나 서비스를 제공하고 싶다면, 로컬 PC에서 실행 중인 개발 서버(포트 `3000`)를 보안 터널링 기술을 이용해 인터넷 주소로 노출할 수 있습니다.

### 1) Localtunnel 사용하기 (가장 간단함)
로컬포트 `3000`을 임시 인터넷 주소로 공개합니다.

1. 로컬 PC 터미널에서 서비스를 실행합니다:
   ```bash
   npm run dev
   # 그리고 다른 터미널에서 Redis와 백그라운드 워커를 실행해 둡니다.
   npx tsx worker/index.ts
   ```
2. 새 터미널을 열고 아래 명령어로 터널을 생성합니다:
   ```bash
   npx localtunnel --port 3000
   ```
3. 터미널 창에 `your url is: https://XXXX.localtunnel.me` 형태로 외부에서 접속 가능한 주소가 출력됩니다.
4. 해당 주소를 공유하여 누구나 인터넷에서 내 컴퓨터의 서비스를 이용하게 만들 수 있습니다.

### 2) Cloudflare Tunnel 사용하기 (가장 안정적이고 커스텀 도메인 지원)
가장 보안성이 높고 속도가 빠르며 무료로 고정 주소/개인 도메인을 사용할 수 있는 방법입니다.

1. [Cloudflare 다운로드 페이지](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)에서 `cloudflared` 설치 파일을 다운로드합니다.
2. 터미널에서 아래 명령어로 로컬 서버와 연동하는 터널을 임시 생성합니다:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. 터미널 로그에 생성된 임시 주소(예: `https://something-something.trycloudflare.com`)가 출력되며, 이 주소를 통해 전 세계 어디서든 접속이 가능해집니다.

> **주의**: 로컬 터널 주소가 바뀌면 구글 로그인(OAuth) 설정을 변경해주어야 정상 작동합니다. (자세한 내용은 [구글 OAuth 설정 섹션](#-중요-구글유튜브-oauth-및-api-설정-변경) 참고)

---

## 옵션 2: Docker Compose를 이용한 가상 서버(VPS) 셀프 호스팅

AWS LightSail, EC2, Oracle Cloud, DigitalOcean 등 본인 소유의 리눅스/윈도우 가상 서버에 상시 배포하여 구동하는 방법입니다.

본 레포지토리에는 다음 3가지 서비스를 하나로 실행하는 Docker 구성이 준비되어 있습니다:
* **Web App (Next.js)** (Port: 3000)
* **Redis** (BullMQ 백그라운드 큐 관리용)
* **Worker** (동영상 비동기 업로드 처리기)

### 배포 순서

1. **가상 서버에 Docker 및 Docker Compose 설치**:
   * 리눅스의 경우: `curl -fsSL https://get.docker.com | sh`

2. **프로젝트 폴더 내에 `.env` 설정 파일 업로드**:
   서버 루트 디렉토리에 `.env` 파일을 복사하고 외부 도메인 및 구글 API 값을 채워넣습니다:
   ```env
   # 서버의 도메인 주소 설정
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   YOUTUBE_REDIRECT_URI="https://your-domain.com/api/youtube/oauth/callback"

   # 구글 OAuth 인증키
   GOOGLE_CLIENT_ID="구글_클라이언트_ID"
   GOOGLE_CLIENT_SECRET="구글_클라이언트_시크릿"
   ```

3. **Docker Compose 실행**:
   ```bash
   docker compose up -d --build
   ```
   이 한 줄의 명령어로 빌드가 수행되고 다음 인프라가 자동으로 세팅됩니다:
   * Redis 서버 시작 및 포트 오픈 (`6379`)
   * Prisma schema가 자동으로 SQLite 볼륨에 동기화됨 (`npx prisma db push`)
   * Next.js 서버 및 백그라운드 업로드 워커가 구동됨
   * 로컬 SQLite 데이터베이스는 Docker Volume(`db-data`)을 통해 서버 재부팅 후에도 영구히 보존됩니다.

4. **종료하기**:
   ```bash
   docker compose down
   ```

---

## 옵션 3: 클라우드 서비스(Railway / Render)에 배포하기

서버 운영(OS 관리, 도메인 SSL 설정 등)이 번거롭다면 **Railway**나 **Render** 같은 PaaS(Platform-as-a-Service) 클라우드를 권장합니다. 

### 1) Railway 배포 방법 (가장 추천)
Railway는 소스 코드만 연결하면 알아서 빌드해주고 Redis, Database 연동을 마우스 몇 번으로 끝낼 수 있어 가장 편리합니다.

1. [Railway.app](https://railway.app/) 가입 후 **New Project**를 만듭니다.
2. 본 프로젝트의 GitHub 저장소를 연동(`Deploy from GitHub repo`)합니다.
3. **Redis 추가**:
   * `+ Add a Service` 버튼을 누르고 **Redis** 플러그인을 추가합니다.
   * 자동으로 환경 변수 `REDIS_HOST`, `REDIS_PORT` 등이 공유됩니다.
4. **Web 서비스 추가**:
   * Next.js 배포 웹 서비스의 환경 변수(Variables)에 다음 항목들을 입력합니다:
     * `NEXT_PUBLIC_APP_URL`: Railway에서 할당해주는 도메인 주소 (예: `https://spread-production.up.railway.app`)
     * `DATABASE_URL`: `file:/data/dev.db` (영구 마운트 폴더 지정) 또는 Railway에서 제공하는 PostgreSQL 추가 후 연동
     * `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `YOUTUBE_REDIRECT_URI`
   * `Settings` > `Volumes` 탭에서 `/data` 경로를 마운트할 볼륨을 추가해 줍니다 (SQLite 사용 시 데이터 영구 보존 목적).
5. **Worker 서비스 추가**:
   * 동일 저장소를 사용해 서비스를 하나 더 추가합니다.
   * 서비스 이름을 `worker`로 짓고 `Settings` > `Deploy` > `Start Command`를 `npm run worker`로 입력합니다.
   * 환경 변수 및 SQLite 공유 볼륨 설정을 Web 서비스와 동일하게 적용합니다.

### ⚠ Vercel 배포 시 주의점
* **Vercel**은 Next.js 개발사인 Vercel에서 만든 훌륭한 배포 도구이지만 **Serverless(서버리스)**로 동작합니다.
* 24시간 계속 켜져 있으면서 동영상 업로드 큐를 가동해야 하는 **BullMQ Worker**는 서버리스 환경(Vercel)에서는 백그라운드로 계속 돌릴 수 없습니다.
* 또한 SQLite 데이터베이스 파일(`dev.db`)도 서버가 요청 시마다 새로 켜지므로 파일이 매번 초기화되어 유실됩니다.
* 따라서 Vercel에 프론트엔드를 배포할 경우:
  1. 데이터베이스를 외부 클라우드 DB(Supabase, Aiven 등)로 변경해야 합니다.
  2. Redis 역시 외부 서비스(Upstash 등)로 설정해야 합니다.
  3. 백그라운드 워커는 Vercel이 아닌 Railway나 Render, 혹은 VPS에 따로 켜두어야 합니다.

---

## 🔑 중요: 구글/유튜브 OAuth 및 API 설정 변경

어떤 배포 방식을 선택하든, **인터넷 주소(URL)가 변경되면 구글 개발자 콘솔의 인증 주소도 반드시 매칭**시켜주어야 구글 로그인 및 유튜브 업로드가 실패하지 않습니다.

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 해당 API 프로젝트의 **[API 및 서비스] > [사용자 인증 정보]**로 이동합니다.
3. 사용 중인 **OAuth 2.0 클라이언트 ID**를 클릭하여 편집 화면으로 들어갑니다.
4. **[승인된 리디렉션 URI]**에 바뀐 인터넷 주소의 리디렉션 경로를 추가합니다:
   * 예 (임시 터널): `https://XXXX.localtunnel.me/api/youtube/oauth/callback`
   * 예 (실제 도메인): `https://your-domain.com/api/youtube/oauth/callback`
5. 저장 후 배포 환경(`.env`)의 `NEXT_PUBLIC_APP_URL` 및 `YOUTUBE_REDIRECT_URI` 변수 값도 동일한 도메인으로 맞춰줍니다.
