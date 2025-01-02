'use client';

import { ClassNameProps } from '@/types/className';
import { cn } from '@/util/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaCalendar, FaEllipsis, FaInbox, FaList, FaPlus } from 'react-icons/fa6';
import { IoGrid } from 'react-icons/io5';

const NAV_DATA: { [key: string]: any }[] = [
  { path: '/today', icon: <FaCalendar />, title: 'Today' },
  { path: '/list', icon: <FaList />, title: 'List' },
  { path: '/matrix', icon: <IoGrid />, title: 'Matrix' },
  { path: '/inbox', icon: <FaInbox />, title: 'Inbox' },
  // { path: '/project', icon: <IoGrid />, title: 'Project' },
  // { path: '/others', icon: <FaEllipsis />, title: 'Others' },
  {
    plus: (pathname: string) => (
      <Link
        href={`${pathname}?main-input=show`}
        key="add"
        className="bg-primary w-9 h-9 mb-2 rounded-md"
      >
        <FaPlus className="text-base text-white" />
      </Link>
    ),
  },
];

const Nav = ({ className }: ClassNameProps) => {
  const pathname = usePathname();

  return (
    <nav
      // gap-8
      className={cn(
        'flex justify-center items-center gap-8 text-xl text-gray-300 bg-white',
        '[&>a]:flex [&>a]:flex-col [&>a]:justify-center [&>a]:items-center',
        '[&>div]:flex [&>div]:flex-col [&>div]:justify-center [&>div]:items-center',
        '[&_span]:text-[0.625rem] [&_span]:font-bold',
        className
      )}
    >
      {NAV_DATA.map(({ path, icon, title, plus }) =>
        path ? (
          <Link
            href={path}
            key={path}
            className={pathname === path ? 'text-primary' : undefined}
          >
            {icon}
            <span>{title}</span>
          </Link>
        ) : plus ? (
          plus(pathname)
        ) : (
          icon
        )
      )}
    </nav>
  );
};

export default Nav;
