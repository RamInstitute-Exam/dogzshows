import React, { Suspense } from 'react';
import JudgesClient from './JudgesClient';
import Spinner from '@/components/common/loader/Spinner';

export default function JudgesPage() {
  return (
    <Suspense fallback={<Spinner className="min-h-screen" />}>
      <JudgesClient />
    </Suspense>
  );
}
