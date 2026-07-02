import React, { Suspense } from 'react';
import WinnerGalleryClient from '@/app/winners/WinnerGalleryClient';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

export default function ShowPhotosPage() {
  return (
    <PageContainer>
      <PublicContainer className="pb-24 pt-8 md:pt-12">
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted mt-12 rounded-2xl" />}>
          <WinnerGalleryClient allWinners={[]} hallOfFameWinners={[]} />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
