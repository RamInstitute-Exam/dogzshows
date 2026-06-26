import React from 'react';
import ContactClient from './ContactClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function ContactPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/contact', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <ContactClient initialBannerData={initialBannerData} />;
}
