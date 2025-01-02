import JotaiProvider from '@/app/_provider/JotaiProvider';
import JotaiQueryClientProvider from '@/app/_provider/JotaiQueryClientProvider';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: '@Todo',
  description: 'Todo organizer',
  manifest: '/manifest.json',
  icons: [{ rel: 'icon', url: '/logo-192x192.png', sizes: '192x192' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <JotaiQueryClientProvider>
          <JotaiProvider>
            {children}
            <div id="overlay-container"></div>
          </JotaiProvider>
        </JotaiQueryClientProvider>
      </body>
    </html>
  );
}
