'use client';

import React, { createContext, useState, useEffect, Suspense } from 'react';
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
  const [isExiting, setIsExiting] = useState(false);
  
  // Set isBootstrapped to true after a short timeout (e.g. 1.2s) to show brand animation once
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsBootstrapped(true);
        setIsExiting(false);
      }, 500); // matches the 500ms exit transition
      return () => clearTimeout(exitTimer);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // No-op triggers so background/subsequent actions do not block user interfaces
  const showLoader = () => {};
  const hideLoader = () => {};

  const isLoading = !isBootstrapped;

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
      <Suspense fallback={null}>
        <SearchParamsTracker />
      </Suspense>
      <AppLoader isLoading={isLoading} isExiting={isExiting} />
    </LoaderContext.Provider>
  );
};

const SearchParamsTracker = () => {
  // Kept here to prevent hydration/bailout issues on static paths
  usePathname();
  useSearchParams();
  return null;
};
