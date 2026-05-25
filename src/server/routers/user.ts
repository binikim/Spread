// user.ts - tRPC User Router
export const userRouter = {
  getProfile: async () => {
    return { id: '1', name: '홍길동', email: 'user@example.com' };
  },
  updateProfile: async (data: { name: string }) => {
    return { success: true, name: data.name };
  }
};
