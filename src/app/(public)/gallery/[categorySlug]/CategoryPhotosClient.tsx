'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Image as ImageIcon, ArrowRight, Camera } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

export default function CategoryPhotosClient({ params }: { params: Promise<{ categorySlug: string }> }) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.categorySlug;

  const [albums, setAlbums] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  // Capitalize slug for fallback title
  const fallbackTitle = categorySlug
    ? categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Fetch category name
        const catRes = await api.get('/public/gallery/categories');
        if (catRes.success && Array.isArray(catRes.data)) {
          const currentCat = catRes.data.find((c: any) => c.slug === categorySlug);
          if (currentCat) {
            setCategoryName(currentCat.name);
          } else {
            setCategoryName(fallbackTitle);
          }
        } else {
          setCategoryName(fallbackTitle);
        }

        // 2. Fetch albums for this category
        const res = await api.get(`/public/gallery/albums?category=${categorySlug}`);
        if (res.success && res.data) {
          setAlbums(res.data);
        }
      } catch (err) {
        console.error('Failed to load category photos:', err);
      } finally {
        setLoading(false);
      }
    }
    if (categorySlug) {
      fetchData();
    }
  }, [categorySlug, fallbackTitle]);

  return (
    <PageContainer>
      {/* Premium Header */}
      <div className="w-full bg-background dark:bg-[#050505] py-16 md:py-24 border-b border-border/40 relative overflow-hidden">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=2000&auto=format&fit=crop" 
            alt={categoryName} 
            className="w-full h-full object-cover"
          />
          {/* Light Mode Gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.78)_40%,rgba(255,255,255,0.4)_70%,rgba(255,255,255,0.15)_100%)] dark:hidden" />
          {/* Dark Mode Gradient */}
          <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.7)_40%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.15)_100%)]" />
        </div>

        <PublicContainer className="relative z-10">
          <div className="space-y-4 text-left">
            <span className="text-[#6B7280] dark:text-[#E5E7EB] font-semibold text-sm uppercase tracking-[3px] opacity-100 block">
              Gallery Category
            </span>
            <h1 className="text-[36px] md:text-[48px] lg:text-[60px] xl:text-[72px] font-extrabold text-[#111827] dark:text-[#FFFFFF] tracking-tight leading-tight drop-shadow-sm dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] opacity-100">
              {categoryName || fallbackTitle}
            </h1>
            <p className="text-[#4B5563] dark:text-[#CBD5E1] text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] max-w-[700px] leading-[1.8] opacity-100">
              Explore dynamic dog photography and professional cover collections under {categoryName || fallbackTitle}.
            </p>
          </div>
        </PublicContainer>
      </div>

      <PublicContainer className="py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-[24px] border border-border/50 h-[380px] animate-pulse overflow-hidden">
                <div className="bg-muted/10 h-52 w-full" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted/10 rounded w-2/3" />
                  <div className="h-4 bg-muted/10 rounded w-1/2" />
                  <div className="h-8 bg-muted/10 rounded-xl w-full pt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[24px] border border-border border-dashed">
            <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">No albums available.</h3>
            <p className="text-muted-foreground text-sm mt-2">There are currently no published albums in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {albums.map((album) => (
              <Link 
                key={album.id}
                href={`/gallery/album/${album.slug}`}
                className="group flex flex-col bg-card border border-border/50 hover:border-border/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-black/20 w-full max-w-[380px] min-h-[420px] h-auto mx-auto"
              >
                {/* Cover Image */}
                <div className="relative w-full flex-grow flex items-center justify-center bg-black overflow-hidden aspect-[4/3] max-h-[220px]">
                  <Image
                    src={getImageUrl(album.coverImage)}
                    alt={album.title}
                    fill={false}
                    width={800}
                    height={600}
                    quality={100}
                    unoptimized
                    sizes="100vw"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center"
                    }}
                    className="gallery-image transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1 select-none pointer-events-none">
                    <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {album._count?.images || album.images?.length || 0} Photos
                    </div>
                    <div className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      Downloads: {(album.images?.reduce((sum: number, img: any) => sum + (img.downloadCount || 0), 0) || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#111827] dark:text-[#FFFFFF] group-hover:text-foreground transition-colors leading-snug line-clamp-2">
                      {album.title}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-medium">
                      {(album.city || album.state || album.location) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span className="truncate">
                            {[album.city, album.state].filter(Boolean).join(', ') || album.location}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-foreground shrink-0" />
                        <span>
                          {album.albumDate 
                            ? new Date(album.albumDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : new Date(album.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full pt-4 border-t border-border/40">
                    <div className="w-full py-3 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-white text-foreground text-center font-bold text-sm transition-all flex items-center justify-center gap-1.5">
                      View Album
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PublicContainer>
    </PageContainer>
  );
}
