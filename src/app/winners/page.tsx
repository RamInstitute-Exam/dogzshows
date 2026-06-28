import React, { Suspense } from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import WinnerGalleryClient from './WinnerGalleryClient';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';

// Static shell — WinnerGalleryClient fetches its own data client-side via useEffect
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
          <WinnerGalleryClient allWinners={[]} hallOfFameWinners={[]} />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
