'use client';

import React, { createContext, useState, useEffect, Suspense, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AppLoader } from './AppLoader';

interface LoaderContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

export const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // Initial app load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsBootstrapped(true);
        setIsExiting(false);
      }, 300); // Fast fade
      return () => clearTimeout(exitTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const showLoader = useCallback(() => {
    setIsNavigating(true);
    setIsExiting(false);
  }, []);

  const hideLoader = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsNavigating(false);
      setIsExiting(false);
    }, 300);
  }, []);

  const isLoading = !isBootstrapped || isNavigating;

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
      <Suspense fallback={null}>
        <SearchParamsTracker hideLoader={hideLoader} isNavigating={isNavigating} />
      </Suspense>
      <AppLoader isLoading={isLoading} isExiting={isExiting} />
    </LoaderContext.Provider>
  );
};

// Tracks route changes to hide the loader when navigation completes
const SearchParamsTracker = ({ hideLoader, isNavigating }: { hideLoader: () => void, isNavigating: boolean }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isNavigating) {
      hideLoader();
    }
  }, [pathname, searchParams, isNavigating, hideLoader]);

  return null;
};
