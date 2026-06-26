import React from 'react';
import EventsClient from './EventsClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function EventsPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/events', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <EventsClient initialBannerData={initialBannerData} />;
}
