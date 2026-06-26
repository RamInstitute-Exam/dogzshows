import React from 'react';
import AboutClient from './AboutClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function AboutPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/about', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <AboutClient initialBannerData={initialBannerData} />;
}
