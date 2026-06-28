import React from 'react';
import VideosClient from '../videos/VideosClient';
import { getAllVideos } from '@/lib/server-api';


export default async function HighlightsPage() {
  const { data } = await getAllVideos();
  
  // Filter by highlights category slug
  const filteredVideos = (data || []).filter((v: any) => 
    v.category?.slug === 'highlights'
  );
  
  return <VideosClient initialVideos={filteredVideos} />;
}
