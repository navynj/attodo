import Nav from '@/components/layout/Nav';
import JotaiProvider from '@/components/provider/JotaiProvider';
import type { Metadata, Viewport } from 'next';
import MainInputOverlay from './_components/MainInputOverlay';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'PLOT',
  description: 'Play, List, Organize your Time',
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
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="relative max-w-[1280px] mx-auto">
        <JotaiProvider>
          {/* content */}
          <main className="w-full h-[calc(100dvh-6rem)] overflow-scroll">{children}</main>
          {/* nav */}
          <Nav className="h-[6rem]" />
          {/* overlay */}
          <MainInputOverlay />
        </JotaiProvider>
      </body>
    </html>
  );
}
