'use client';

import React from 'react';
import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function MediaAlbumsPage() {
  return (
    <MediaGalleryClient
      initialTab="photos"
      title="Albums Gallery"
      subtitle="Filter and browse our photography and videos by dedicated event albums."
    />
  );
}
