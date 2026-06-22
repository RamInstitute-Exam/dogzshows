import React from 'react';
import VideosClient from './VideosClient';
import { getAllVideos } from '@/lib/server-api';

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function VideographyGalleryPage() {
  const { data } = await getAllVideos();
  
  return <VideosClient initialVideos={data} />;
}
