'use client';

import React from 'react';
import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function MediaPhotosPage() {
  return (
    <MediaGalleryClient
      initialTab="photos"
      title="Photo Gallery"
      subtitle="Browse and search through all of our high-quality photography."
    />
  );
}
