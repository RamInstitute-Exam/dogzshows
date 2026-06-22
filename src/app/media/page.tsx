'use client';

import React from 'react';
import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function MediaPage() {
  return (
    <MediaGalleryClient
      initialTab="photos"
      title="Media Gallery"
      subtitle="Explore our comprehensive collection of premium dog show photos, videos, and albums."
    />
  );
}
