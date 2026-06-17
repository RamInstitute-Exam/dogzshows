import React from 'react';
import PhotosClient from './PhotosClient';
import { getAllPhotos } from '@/lib/server-api';

export const revalidate = 60; // 1-minute revalidation for ISR caching

export default async function PhotographyGalleryPage() {
  const { data } = await getAllPhotos();
  
  return <PhotosClient initialPhotos={data} />;
}
