import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// 이 파일은 NextAuth 인증 엔드포인트를 처리합니다.
const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        // 임시 로그인 로직
        if (credentials?.username === 'admin' && credentials?.password === 'admin') {
          return { id: '1', name: 'Admin User', email: 'admin@example.com' };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
