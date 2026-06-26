import React from 'react';
import PublicContainer from '@/components/layout/PublicContainer';
import PageContainer from '@/components/layout/PageContainer';
import { fetchServerData, fetchServerDataSingle } from '@/lib/server-api';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { Award, Trophy, ChevronRight } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';

export const revalidate = 60; // Cache for 1 minute

async function CategoriesGrid() {
  const res = await fetchServerData('/public/winner-categories/public?limit=100', 60).catch(() => ({ success: false, data: [] }));
  const categories = Array.isArray(res?.data) ? res.data : [];

  if (categories.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No winner categories found. Please check back later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories.map((cat: any) => {
        const count = cat._count?.winners ?? 0;
        const icon = cat.icon || '🏆';
        
        return (
          <div 
            key={cat.id} 
            className="group relative bg-zinc-900/50 backdrop-blur border border-zinc-800/80 rounded-3xl overflow-hidden hover:border-amber-500/50 shadow-lg hover:shadow-amber-500/5 transition-all duration-500 flex flex-col justify-between"
          >
            {/* Card Top / Banner */}
            <div className="relative h-48 bg-zinc-950 w-full overflow-hidden flex items-center justify-center border-b border-zinc-800/40">
              {cat.thumbnailImage || cat.bannerImage ? (
                <OptimizedImage 
                  src={getImageUrl(cat.thumbnailImage || cat.bannerImage)} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" 
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color || '#FFD700'}15`, color: cat.color || '#FFD700' }}
                >
                  {icon}
                </div>
              )}

              {/* Absolute Badge */}
              <div 
                className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-lg border"
                style={{ 
                  backgroundColor: `${cat.color || '#FFD700'}15`, 
                  borderColor: `${cat.color || '#FFD700'}30`,
                  color: cat.color || '#FFD700' 
                }}
              >
                {count} {count === 1 ? 'Winner' : 'Winners'}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label="icon">{icon}</span>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">
                  {cat.description || 'Championship category for outstanding achievements.'}
                </p>
              </div>

              {/* Action Button */}
              <Link href={`/winners/categories/${cat.slug}`} className="block w-full">
                <button className="w-full py-3 bg-zinc-800 hover:bg-amber-500 hover:text-black text-white text-xs font-extrabold uppercase rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700/50 hover:border-amber-400/50">
                  <span>View Winners</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function WinnerCategoriesPage() {
  const bannerRes = await fetchServerDataSingle('/public/page-banners/winners/categories', 60).catch(() => null);
  const initialBannerData = bannerRes?.success ? { success: true, data: bannerRes.data } : undefined;

  return (
    <PageContainer>
      {/* Hero Banner Section */}
      <BreadcrumbBanner
        slug="/winners/categories"
        fallbackTitle="Winner Categories"
        fallbackSubtitle="Browse championship winners by award category, title, and achievement level from dog shows across India."
        fallbackBreadcrumb="Categories"
        initialBannerData={initialBannerData}
      />

      {/* Grid Content */}
      <PublicContainer className="pb-32 relative z-10">
        <CategoriesGrid />
      </PublicContainer>
    </PageContainer>
  );
}
