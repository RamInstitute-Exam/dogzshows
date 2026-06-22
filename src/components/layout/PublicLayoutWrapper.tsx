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

  // Exclude Navbar and Footer on admin, dashboard, and auth pages
  const isExcluded = 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/register') || 
    pathname?.startsWith('/signup');

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-grow flex flex-col relative z-0">
        {children}
      </div>
      <Footer />
    </>
  );
}
