import React from 'react';
import ClosedEntriesClient from './ClosedEntriesClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function ClosedEntriesPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/entries/closed', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <ClosedEntriesClient initialBannerData={initialBannerData} />;
}
