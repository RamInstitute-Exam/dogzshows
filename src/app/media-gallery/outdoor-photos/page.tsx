'use client';

import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function OutdoorPhotosPage() {
  return (
    <MediaGalleryClient
      initialTab="photos"
      defaultCategorySlug="outdoor"
      title="Outdoor Photos"
      subtitle="Scenic photography sessions, parks, fields, and natural outdoor dog portraits."
    />
  );
}
