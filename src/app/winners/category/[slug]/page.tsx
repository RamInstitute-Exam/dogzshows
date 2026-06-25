import React from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import { fetchServerData } from '@/lib/server-api';
import CategoryWinnersClient from './CategoryWinnersClient';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// Required for static export (output: 'export')
export async function generateStaticParams() {
  try {
    const res = await fetchServerData('/public/winner-categories', 300).catch(() => null);
    const categories = res?.data || res?.items || [];
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((cat: any) => ({ slug: cat.slug || cat.id }));
    }
  } catch (_) {}
  // Fallback: pre-generate known slugs
  return [
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

export default async function CategoryDetailPage({ params }: PageProps) {
  // Resolve params if promise (Next.js 15 compatibility)
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch category data by slug
  const catRes = await fetchServerData(`/public/winner-categories/public/slug/${slug}`, 60)
    .catch(() => null);

  const category = catRes?.data || catRes?.item || catRes;

  if (!category || !category.id) {
    notFound();
  }

  // Fetch initial option lists
  const [eventsRes, clubsRes, breedsRes] = await Promise.all([
    fetchServerData('/public/events?limit=1000', 300).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/clubs?limit=1000', 300).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/breeds?limit=1000', 300).catch(() => ({ success: false, data: [] }))
  ]);

  const events = eventsRes?.data || eventsRes?.events || [];
  const clubs = clubsRes?.data || clubsRes?.items || [];
  const breeds = breedsRes?.data || breedsRes?.items || [];

  return (
    <CategoryWinnersClient 
      category={category} 
      initialEvents={events}
      initialClubs={clubs}
      initialBreeds={breeds}
    />
  );
}
