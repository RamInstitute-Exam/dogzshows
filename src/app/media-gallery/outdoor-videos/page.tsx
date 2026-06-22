'use client';

import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function OutdoorVideosPage() {
  return (
    <MediaGalleryClient
      initialTab="videos"
      defaultCategorySlug="outdoor"
      title="Outdoor Videos"
      subtitle="Scenic outdoor agility tests, park training sessions, and open-space runs."
    />
  );
}
