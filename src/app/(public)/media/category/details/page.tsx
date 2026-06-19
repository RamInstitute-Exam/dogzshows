"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';
import Spinner from '@/components/common/loader/Spinner';

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
    <Suspense fallback={<Spinner className="p-8" />}>
      <MediaCategoryPageContent />
    </Suspense>
  );
}
