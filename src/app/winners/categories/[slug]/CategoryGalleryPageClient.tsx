'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import CategoryGalleryClient from './CategoryGalleryClient';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import api from '@/lib/api';

export default function CategoryGalleryPageClient() {
  const params = useParams();
  const slug = (params?.slug as string) || 'all';

  const [categories, setCategories] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [catName, setCatName] = useState('All Winners');

  useEffect(() => {
    if (!slug || slug === 'placeholder') return;
    async function fetchData() {
      try {
        const [catRes, winRes] = await Promise.all([
          api.get('/public/winner-categories/public?limit=100'),
          api.get('/public/winners/public?limit=500'),
        ]);
        const cats = Array.isArray(catRes?.data) ? catRes.data : [];
        let allWinners = Array.isArray(winRes?.data) ? winRes.data : [];
        let current: any = null;

        if (slug !== 'all') {
          current = cats.find((c: any) => c.slug === slug || c.id === slug) || null;
          if (current) {
            setCatName(current.name);
            allWinners = allWinners.filter((w: any) =>
              w.categoryId === current.id || w.category?.slug === slug || w.awardCategory === current.name
            );
          } else {
            allWinners = [];
          }
        } else {
          setCatName('All Winners');
        }
        setCategories(cats);
        setWinners(allWinners);
        setCurrentCategory(current);
      } catch (e) {
        console.error('[CategoryGalleryPage] fetch error:', e);
      }
    }
    fetchData();
  }, [slug]);

  return (
    <PageContainer>
      <BreadcrumbBanner
        slug={`/winners/categories/${slug}`}
        fallbackTitle={catName}
        fallbackSubtitle={`Explore all ${catName} winners from dog shows across India.`}
        fallbackBreadcrumb={catName}
      />
      <PublicContainer className="pb-16">
        <CategoryGalleryClient
          initialWinners={winners}
          categories={categories}
          currentCategory={currentCategory}
        />
      </PublicContainer>
    </PageContainer>
  );
}
