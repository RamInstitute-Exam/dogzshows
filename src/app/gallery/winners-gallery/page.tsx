import React from 'react';
import PhotosClient from '../photos/PhotosClient';
import { getAllPhotos } from '@/lib/server-api';


export default async function WinnersGalleryPage() {
  const { data } = await getAllPhotos();
  
  // Filter by winners/winners-gallery category slug
  const filteredPhotos = (data || []).filter((p: any) => 
    p.category?.slug === 'winners' || p.category?.slug === 'winners-gallery'
  );
  
  return <PhotosClient initialPhotos={filteredPhotos} />;
}
