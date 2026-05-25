import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spread - 멀티 채널 콘텐츠 발행',
  description: 'YouTube, Instagram, Threads, TikTok 콘텐츠를 한 곳에서 관리하고 발행합니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Noto+Sans+KR:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
                color: #0f172a;
                font-family: 'Outfit', 'Noto Sans KR', sans-serif;
                min-height: 100vh;
                -webkit-font-smoothing: antialiased;
              }

              button,
              input,
              textarea {
                font-family: inherit;
              }

              ::-webkit-scrollbar {
                width: 6px;
                height: 6px;
              }

              ::-webkit-scrollbar-track {
                background: transparent;
              }

              ::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 9999px;
              }

              ::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
