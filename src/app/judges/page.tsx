import React from 'react';
import JudgesClient from './JudgesClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function JudgesPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/judges', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <JudgesClient initialBannerData={initialBannerData} />;
}
