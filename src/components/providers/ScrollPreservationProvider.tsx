'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollPreservationProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Disable automatic browser scroll restoration globally
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use full URL path + query params as the unique key to store scroll state per specific list view
    const urlKey = `${pathname}?${searchParams.toString()}`;

    // Restore scroll position for this specific URL state
    const saved = sessionStorage.getItem(`scroll-${urlKey}`);
    if (saved) {
      // Short delay ensures DOM has painted (specifically dynamic tables)
      setTimeout(() => {
        window.scrollTo({ top: Number(saved), behavior: 'instant' });
      }, 100);
    } else {
      // If navigating to a fresh page without scroll state, default to top (prevents carrying over scroll from previous pages)
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    
    // Save scroll position for this specific URL state actively
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${urlKey}`, window.scrollY.toString());
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      // Save one final time right before unmounting/navigating away
      sessionStorage.setItem(`scroll-${urlKey}`, window.scrollY.toString());
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, searchParams]);

  return null;
}
