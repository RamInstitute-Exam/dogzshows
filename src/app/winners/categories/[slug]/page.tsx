import React, { Suspense } from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import { fetchServerData } from '@/lib/server-api';
import CategoryGalleryClient from './CategoryGalleryClient';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';

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
  
  let currentCategory: any = null;

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
      <BreadcrumbBanner
        slug={`/winners/categories/${slug}`}
        fallbackTitle={catName}
        fallbackSubtitle={`Explore all ${catName} winners from dog shows across India.`}
        fallbackBreadcrumb={catName}
      />

      <PublicContainer className="pb-16">
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted mt-8 rounded-2xl" />}>
          <GalleryWrapper slug={slug} />
        </Suspense>
      </PublicContainer>
    </PageContainer>
  );
}
