// proxy.ts - Authentication Middleware & Proxy Config
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token');
  const { pathname } = request.nextUrl;

  // 대시보드 등의 경로에 대해 인증 여부 확인
  if (pathname.startsWith('/src/app/(dashboard)') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
