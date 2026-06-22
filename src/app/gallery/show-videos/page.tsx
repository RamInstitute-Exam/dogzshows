import React from 'react';
import VideosClient from '../videos/VideosClient';
import { getAllVideos } from '@/lib/server-api';

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function ShowVideosPage() {
  const { data } = await getAllVideos();
  
  // Filter by show-videos category slug
  const filteredVideos = (data || []).filter((v: any) => 
    v.category?.slug === 'show-videos'
  );
  
  return <VideosClient initialVideos={filteredVideos} />;
}
