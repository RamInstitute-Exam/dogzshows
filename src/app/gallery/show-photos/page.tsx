'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import ShowPhotosListingClient from './ShowPhotosListingClient';
import EventGalleryClient from './EventGalleryClient';
import { Loader2 } from 'lucide-react';

function ShowPhotosContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  if (eventId) {
    return <EventGalleryClient eventId={eventId} />;
  }
  return <ShowPhotosListingClient />;
}

export default function ShowPhotosPage() {
  return (
    <PageContainer>
      <PublicContainer className="pb-24 pt-8 md:pt-12">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        }>
          <ShowPhotosContent />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
