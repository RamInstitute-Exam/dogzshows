import React from 'react';
import PhotosClient from '../photos/PhotosClient';
import { getAllPhotos } from '@/lib/server-api';


export default async function OutdoorPhotosPage() {
  const { data } = await getAllPhotos();
  
  // Filter by outdoor category slug
  const filteredPhotos = (data || []).filter((p: any) => 
    p.category?.slug === 'outdoor' || p.category?.slug === 'outdoor-photos'
  );
  
  return <PhotosClient initialPhotos={filteredPhotos} />;
}
