import React from 'react';
import PhotosClient from '../photos/PhotosClient';
import { getAllPhotos } from '@/lib/server-api';

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function IndoorPhotosPage() {
  const { data } = await getAllPhotos();
  
  // Filter by indoor category slug
  const filteredPhotos = (data || []).filter((p: any) => 
    p.category?.slug === 'indoor' || p.category?.slug === 'indoor-photos'
  );
  
  return <PhotosClient initialPhotos={filteredPhotos} />;
}
