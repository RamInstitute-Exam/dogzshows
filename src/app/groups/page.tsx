import React from 'react';
import GroupsClient from './GroupsClient';
import { fetchServerDataSingle } from '@/lib/server-api';

export const revalidate = 60; // 1 minute

export default async function GroupsPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/groups', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return <GroupsClient initialBannerData={initialBannerData} />;
}
