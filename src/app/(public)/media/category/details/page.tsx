"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

function MediaCategoryPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';

  return (
    <MediaGalleryClient 
      defaultCategorySlug={slug}
      title="Category Media"
      subtitle={`Viewing media for category: ${slug}`}
    />
  );
}

export default function MediaCategoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <MediaCategoryPageContent />
    </Suspense>
  );
}
