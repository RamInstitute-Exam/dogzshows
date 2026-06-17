'use client';

import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

export default function PersonalVideosPage() {
  return (
    <MediaGalleryClient
      initialTab="videos"
      defaultCategorySlug="videos"
      title="Personal Videos"
      subtitle="Fun clips, agility drills, and owner-submitted videography compilations."
    />
  );
}
