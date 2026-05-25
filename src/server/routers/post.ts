// post.ts - tRPC Post Router
export const postRouter = {
  createPost: async (data: { title: string; content: string }) => {
    return { id: 'post_1', ...data, status: 'DRAFT' };
  },
  getHistory: async () => {
    return [
      { id: 'post_1', title: '첫 번째 글', status: 'PUBLISHED', platform: 'YOUTUBE' }
    ];
  }
};
