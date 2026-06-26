import React from 'react';
import UpcomingEntriesClient from './UpcomingEntriesClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function UpcomingEntriesPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/entries/upcoming', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <UpcomingEntriesClient initialBannerData={initialBannerData} />;
}
