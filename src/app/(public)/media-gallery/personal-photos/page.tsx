'use client';

import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function PersonalPhotosPage() {
  return (
    <MediaGalleryClient
      initialTab="photos"
      defaultCategorySlug="personal"
      title="Personal Photos"
      subtitle="Memorable moments, portraits, and training clicks submitted by dog owners."
    />
  );
}
