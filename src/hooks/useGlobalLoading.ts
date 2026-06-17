'use client';

import { useContext } from 'react';
import { LoaderContext } from '../components/common/loader/LoaderProvider';

export function useGlobalLoading() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a LoaderProvider');
  }
  return context;
}
