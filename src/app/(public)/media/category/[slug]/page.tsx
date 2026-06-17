import React from 'react';
import MediaGalleryClient from '@/components/media-gallery/MediaGalleryClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${baseUrl}/public/photo-categories`);
    if (res.ok) {
      const json = await res.json();
      const categories = json.data || json || [];
      if (categories.length > 0) {
        return categories.map((cat: any) => ({
          slug: cat.slug,
        }));
      }
    }
  } catch (error) {
    console.error("Failed to generate static params for media categories", error);
  }
  return [{ slug: 'default' }];
}

export const revalidate = 60;

export default async function MediaCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const formattedTitle = slug
    ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Category';

  return (
    <MediaGalleryClient
      initialTab="photos"
      defaultCategorySlug={slug}
      title={formattedTitle}
      subtitle={`Explore all media assets categorized under ${formattedTitle}.`}
    />
  );
}
