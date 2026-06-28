import React from 'react';
import PhotosClient from '../photos/PhotosClient';
import { getAllPhotos } from '@/lib/server-api';


export default async function ChampionshipPhotosPage() {
  const { data } = await getAllPhotos();
  
  // Filter by championship category slug
  const filteredPhotos = (data || []).filter((p: any) => 
    p.category?.slug === 'championship' || p.category?.slug === 'championship-photos'
  );
  
  return <PhotosClient initialPhotos={filteredPhotos} />;
}
