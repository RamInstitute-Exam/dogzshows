import React, { Suspense } from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import { fetchServerData } from '@/lib/server-api';
import CategoryGalleryClient from './CategoryGalleryClient';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await fetchServerData('/public/winner-categories/public?limit=100');
    const categories = Array.isArray(res?.data) ? res.data : [];
    
    return [
      { slug: 'all' },
      ...categories.map((cat: any) => ({
        slug: cat.slug || cat.id
      }))
    ];
  } catch (error) {
    return [{ slug: 'all' }];
  }
}

async function GalleryWrapper({ slug }: { slug: string }) {
  const [categoriesRes, winnersRes] = await Promise.all([
    fetchServerData('/public/winner-categories/public?limit=100', 60).catch(() => ({ success: false, data: [] })),
    fetchServerData('/public/winners/public?limit=500', 60).catch(() => ({ success: false, data: [] }))
  ]);

  const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];
  let allWinners = Array.isArray(winnersRes?.data) ? winnersRes.data : [];
  
  let currentCategory = null;

  if (slug !== 'all') {
    currentCategory = categories.find((c: any) => c.slug === slug || c.id === slug) || null;
    if (currentCategory) {
      allWinners = allWinners.filter((w: any) => w.categoryId === currentCategory.id || w.category?.slug === slug || w.awardCategory === currentCategory.name);
    } else {
      // If category not found, return empty
      allWinners = [];
    }
  }

  return (
    <CategoryGalleryClient 
      initialWinners={allWinners} 
      categories={categories}
      currentCategory={currentCategory}
    />
  );
}

export default async function CategoryGalleryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  // Let's try to get category name for the title
  let catName = 'All Winners';
  if (slug !== 'all') {
    try {
      const res = await fetchServerData('/public/winner-categories/public?limit=100', 60);
      const categories = Array.isArray(res?.data) ? res.data : [];
      const current = categories.find((c: any) => c.slug === slug || c.id === slug);
      if (current) catName = current.name;
    } catch(e) {}
  }

  return (
    <PageContainer>
      <div className="bg-gradient-to-b from-black to-background pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <PublicContainer className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight uppercase">
            {catName}
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium">
            Explore all {catName} winners from dog shows across India.
          </p>
        </PublicContainer>
      </div>

      <PublicContainer className="pb-24">
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted mt-12 rounded-2xl" />}>
          <GalleryWrapper slug={slug} />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
