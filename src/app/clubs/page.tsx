import React, { Suspense } from 'react';
import ClubsClient from './ClubsClient';
import Spinner from '@/components/common/loader/Spinner';

export default function ClubsPage() {
  return (
    <Suspense fallback={<Spinner className="min-h-screen" />}>
      <ClubsClient />
    </Suspense>
  );
}
