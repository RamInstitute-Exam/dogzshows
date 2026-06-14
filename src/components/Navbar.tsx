'use client';

import { usePathname } from 'next/navigation';
import HomeHeader from './layout/HomeHeader';
import InnerHeader from './layout/InnerHeader';

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === '/') {
    return <HomeHeader />;
  }

  return <InnerHeader />;
}
