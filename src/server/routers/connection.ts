// connection.ts - tRPC Connection Router
export const connectionRouter = {
  getConnections: async () => {
    return [
      { platform: 'youtube', connected: true, username: 'MyChannel' },
      { platform: 'instagram', connected: false }
    ];
  },
  connectPlatform: async (data: { platform: string; token: string }) => {
    return { success: true, platform: data.platform };
  }
};
