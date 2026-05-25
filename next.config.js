/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  /* 필요한 설정을 여기에 추가하세요 */
};

module.exports = nextConfig;
