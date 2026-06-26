import React from 'react';
import GalleryClient from './GalleryClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function GalleryPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/gallery', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <GalleryClient initialBannerData={initialBannerData} />;
}
