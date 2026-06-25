import React, { Suspense } from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import { fetchServerData } from '@/lib/server-api';
import WinnerGalleryClient from './WinnerGalleryClient';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';

export const revalidate = 300;

async function GalleryWrapper() {
  const [allRes, hofRes] = await Promise.all([
    fetchServerData('/public/winners/public', 300).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/winners/public/hall-of-fame', 300).catch(() => ({ success: false, data: [] }))
  ]);

  return (
    <WinnerGalleryClient 
      allWinners={allRes?.data || []} 
      hallOfFameWinners={hofRes?.data || []} 
    />
  );
}

export default function WinnersPage() {
  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="/winners"
        fallbackTitle="Championship Winners"
        fallbackSubtitle="Explore the elite dogs that have demonstrated ultimate breed perfection and earned top honors."
        fallbackBreadcrumb="Winners"
      />

      <PublicContainer className="pb-24 pt-12">
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted mt-12 rounded-2xl" />}>
          <GalleryWrapper />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
