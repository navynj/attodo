import Nav from '@/app/_layout/Nav';
import React, { Suspense } from 'react';
import MainFormOverlay from '../_overlay/MainFormOverlay';
import TaskDateInputOverlay from '../_overlay/TaskDateInputOverlay';
import DeleteConfirmOverlay from '../_overlay/DeleteConfirmOverlay';

export default function ScreenLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative max-w-[1280px] mx-auto">
      {/* content */}
      <main className="w-full h-[calc(100dvh-6rem)] overflow-scroll max-md:scrollbar-hide">
        {children}
      </main>
      {/* nav */}
      <Nav className="h-[6rem]" />
      {/* overlay */}
      <Suspense>
        <MainFormOverlay />
        <TaskDateInputOverlay z={1} />
        <DeleteConfirmOverlay z={2} />
      </Suspense>
    </div>
  );
}
