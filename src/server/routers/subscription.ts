// subscription.ts - tRPC Subscription Router
export const subscriptionRouter = {
  getSubscription: async () => {
    return { status: 'ACTIVE', plan: 'PRO', nextBillingDate: '2026-06-22' };
  },
  createBillingSession: async (data: { planId: string }) => {
    // Toss Payments API를 통한 빌링 세션 생성 시뮬레이션
    return { paymentUrl: 'https://pay.toss.im/simulated' };
  }
};
