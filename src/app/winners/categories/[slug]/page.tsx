import React from 'react';
import { fetchServerData } from '@/lib/server-api';
import CategoryGalleryPageClient from './CategoryGalleryPageClient';

// Static export: generateStaticParams provides placeholder and dynamic slugs.
export async function generateStaticParams() {
  try {
    const res = await fetchServerData('/public/winner-categories/public?limit=100', 300).catch(() => null);
    const categories = (res as any)?.data || (res as any)?.items || [];
    
    const params = [
      { slug: 'all' },
      { slug: 'placeholder' }
    ];
    
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat: any) => {
        if (cat.slug) {
          params.push({ slug: cat.slug });
        }
      });
    }
    return params;
  } catch (_) {}

  // Fallback if API is unreachable
  return [
    { slug: 'all' },
    { slug: 'placeholder' },
    { slug: 'best-in-show' },
    { slug: 'reserve-best-in-show' },
    { slug: 'best-puppy' },
    { slug: 'best-junior' },
    { slug: 'champion-winner' },
    { slug: 'special-award' },
    { slug: 'hall-of-fame' },
    { slug: 'best-in-group' },
  ];
}

export default function CategoryGalleryPage() {
  return <CategoryGalleryPageClient />;
}
