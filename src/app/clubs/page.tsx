import React, { Suspense } from 'react';
import ClubsClient from './ClubsClient';
import Spinner from '@/components/common/loader/Spinner';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function ClubsPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/clubs', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return (
    <Suspense fallback={<Spinner className="min-h-screen" />}>
      <ClubsClient initialBannerData={initialBannerData} />
    </Suspense>
  );
}
