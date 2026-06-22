'use client';

import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function ShowVideosPage() {
  return (
    <MediaGalleryClient
      initialTab="videos"
      defaultCategorySlug="show-videos"
      title="Show Videos"
      subtitle="Championship runs, breeder rings, group finals, and official event footage."
    />
  );
}
