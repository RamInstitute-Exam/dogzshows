'use client';

import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function ShowPhotosPage() {
  return (
    <MediaGalleryClient
      initialTab="photos"
      defaultCategorySlug="show-photos"
      title="Show Photos"
      subtitle="Championship portraits, presentation stands, and arena show captures."
    />
  );
}
