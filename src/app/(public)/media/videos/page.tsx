'use client';

import React from 'react';
import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function MediaVideosPage() {
  return (
    <MediaGalleryClient
      initialTab="videos"
      title="Video Gallery"
      subtitle="Watch all of our professional dog show videography and event coverage."
    />
  );
}
