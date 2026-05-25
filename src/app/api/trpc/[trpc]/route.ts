import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
// 임시 라우터 설정 (실제 라우터 구현 후 교체 예정)
const appRouter = {}; 

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter as any,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
