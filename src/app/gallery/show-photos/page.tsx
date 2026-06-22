import React from 'react';
import PhotosClient from '../photos/PhotosClient';
import { getAllPhotos } from '@/lib/server-api';

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function ShowPhotosPage() {
  const { data } = await getAllPhotos();
  
  // Filter by show-photos category slug
  const filteredPhotos = (data || []).filter((p: any) => 
    p.category?.slug === 'show-photos'
  );
  
  return <PhotosClient initialPhotos={filteredPhotos} />;
}
