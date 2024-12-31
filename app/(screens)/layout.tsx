import Nav from '@/components/layout/Nav';
import React, { Suspense } from 'react';
import MainInputOverlay from '../_components/MainInputOverlay';
import TaskDateInputOverlay from '../_components/TaskDateInputOverlay';
import DeleteConfirmOverlay from '../_components/DeleteConfirmOverlay';

export default function ScreenLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative max-w-[1280px] mx-auto">
      {/* content */}
      <main className="w-full h-[calc(100dvh-6rem)] overflow-scroll max-md:scrollbar-hide">{children}</main>
      {/* nav */}
      <Nav className="h-[6rem]" />
      {/* overlay */}
      <Suspense>
        <MainInputOverlay />
        <TaskDateInputOverlay />
        <DeleteConfirmOverlay />
      </Suspense>
    </div>
  );
}
