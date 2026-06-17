import React from 'react';
import PhotosClient from '../photos/PhotosClient';
import { getAllPhotos } from '@/lib/server-api';

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function PersonalPhotosPage() {
  const { data } = await getAllPhotos();
  
  // Filter by personal category slug
  const filteredPhotos = (data || []).filter((p: any) => 
    p.category?.slug === 'personal' || p.category?.slug === 'personal-photos'
  );
  
  return <PhotosClient initialPhotos={filteredPhotos} />;
}
