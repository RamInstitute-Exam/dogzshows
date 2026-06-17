import React from 'react';
import VideosClient from '../videos/VideosClient';
import { getAllVideos } from '@/lib/server-api';

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function InterviewsPage() {
  const { data } = await getAllVideos();
  
  // Filter by interviews category slug
  const filteredVideos = (data || []).filter((v: any) => 
    v.category?.slug === 'interviews'
  );
  
  return <VideosClient initialVideos={filteredVideos} />;
}
