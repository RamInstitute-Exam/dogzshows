import React from 'react';
import VideosClient from './VideosClient';
import { getAllVideos } from '@/lib/server-api';


export default async function VideographyGalleryPage() {
  const res = await getAllVideos().catch(() => ({ data: [] }));
  
  return <VideosClient initialVideos={res?.data ?? []} />;
}
