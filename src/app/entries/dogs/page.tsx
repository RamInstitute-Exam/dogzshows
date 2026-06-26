import React from 'react';
import DogsEntriesClient from './DogsEntriesClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function DogEntriesCatalogPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/entries/dogs', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <DogsEntriesClient initialBannerData={initialBannerData} />;
}
