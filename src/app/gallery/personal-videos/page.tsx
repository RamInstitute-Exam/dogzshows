import React from 'react';
import VideosClient from '../videos/VideosClient';
import { getAllVideos } from '@/lib/server-api';


export default async function PersonalVideosPage() {
  const { data } = await getAllVideos();
  
  // Filter by personal category slug
  const filteredVideos = (data || []).filter((v: any) => 
    v.category?.slug === 'personal' || v.category?.slug === 'personal-videos'
  );
  
  return <VideosClient initialVideos={filteredVideos} />;
}
