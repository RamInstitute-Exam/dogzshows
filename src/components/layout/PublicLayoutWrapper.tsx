'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const normalizedPath = pathname?.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const isExcluded = 
    normalizedPath?.startsWith('/admin') || 
    normalizedPath?.startsWith('/dashboard') || 
    normalizedPath?.startsWith('/login') || 
    normalizedPath?.startsWith('/register') || 
    normalizedPath?.startsWith('/signup');

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col relative z-0 pt-[var(--nav-height)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
