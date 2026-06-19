import React, { Suspense } from 'react';
import ClubsClient from './ClubsClient';

export default function ClubsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse font-medium text-lg">Loading...</div>
      </div>
    }>
      <ClubsClient />
    </Suspense>
  );
}
