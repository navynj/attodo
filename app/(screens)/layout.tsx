import Nav from '@/components/layout/Nav';
import React, { Suspense } from 'react';
import MainInputOverlay from '../_components/MainInputOverlay';

export default function ScreenLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative max-w-[1280px] mx-auto">
      {/* content */}
      <main className="w-full h-[calc(100dvh-6rem)] overflow-scroll">{children}</main>
      {/* nav */}
      <Nav className="h-[6rem]" />
      {/* overlay */}
      <Suspense>
        <MainInputOverlay />
      </Suspense>
    </div>
  );
}
