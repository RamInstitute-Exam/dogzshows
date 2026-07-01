'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Image as ImageIcon, ArrowRight, Camera } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function OutdoorPhotosPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await api.get('/public/gallery/albums?category=outdoor-photos');
        if (res.success && res.data) {
          setAlbums(res.data);
        }
      } catch (err) {
        console.error('Failed to load outdoor-photos albums:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbums();
  }, []);

  return (
    <PageContainer>
      {/* Premium Header */}
      <div className="w-full bg-background dark:bg-[#050505] py-16 md:py-24 border-b border-border/40 relative overflow-hidden">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=2000&auto=format&fit=crop"
            alt="Outdoor Dog Show"
            className="w-full h-full object-cover"
          />
          {/* Light Mode Gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.75)_40%,rgba(255,255,255,0.4)_70%,rgba(255,255,255,0.15)_100%)] dark:hidden" />
          {/* Dark Mode Gradient */}
          <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.65)_40%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.15)_100%)]" />
        </div>

        <PublicContainer className="relative z-10">
          <div className="space-y-4 text-left">
            <span className="text-[#6B7280] dark:text-[#E5E7EB] font-semibold text-sm uppercase tracking-[3px] opacity-100 block">
              Premium Gallery
            </span>
            <h1 className="text-[36px] md:text-[48px] lg:text-[60px] xl:text-[72px] font-extrabold text-[#111827] dark:text-[#FFFFFF] tracking-tight leading-tight drop-shadow-sm dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] opacity-100">
              Outdoor Photos
            </h1>
            <p className="text-[#4B5563] dark:text-[#CBD5E1] text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] max-w-[700px] leading-[1.8] opacity-100">
              Explore dynamic outdoor photography and action moments from dog shows, training grounds, and fields across the region.
            </p>
          </div>
        </PublicContainer>
      </div>

      <PublicContainer className="py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-[24px] border border-border/50 h-[400px] animate-pulse overflow-hidden">
                <div className="bg-muted/10 h-56 w-full" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted/10 rounded w-2/3" />
                  <div className="h-4 bg-muted/10 rounded w-1/2" />
                  <div className="h-8 bg-muted/10 rounded-xl w-full pt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/album/${album.slug}`}
                className="group relative flex flex-col overflow-hidden bg-card rounded-[24px] border border-border hover:border-border/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out cursor-pointer p-3 md:p-4 w-full max-w-[380px] h-[460px] md:h-[520px] mx-auto"
              >
                {/* Cover Image */}
                <div className="relative w-full h-[180px] md:h-[220px] shrink-0 overflow-hidden bg-black rounded-[16px]">
                  <Image
                    src={getImageUrl(album.coverImage)}
                    alt={album.title}
                    fill
                    quality={100}
                    className="gallery-image transition-transform duration-700 group-hover:scale-[1.05] object-cover object-center rounded-[16px]"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-md">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {album._count?.images || album.images?.length || 0} Photos
                  </div>
                </div>

                {/* Card Info */}
                <div className="px-1 pt-4 pb-1 flex-grow flex flex-col justify-between min-h-0">
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-foreground transition-colors leading-snug min-h-[2.5rem] md:min-h-[3rem]">
                      {album.title}
                    </h3>

                    <div className="text-[13px] font-medium text-primary leading-snug min-h-[1.2rem] md:min-h-[1.4rem]">
                      {album.subtitle || <span className="invisible">No Subtitle</span>}
                    </div>

                    <div className="text-[12px] font-normal text-muted-foreground leading-snug line-clamp-2 mt-1 min-h-[2.2rem] md:min-h-[2.5rem]">
                      {album.shortDescription || album.description || <span className="invisible">No Description</span>}
                    </div>

                    <div className="flex flex-col gap-1.5 md:gap-2 pt-2 justify-end">
                      {(album.city || album.state || album.location) && (
                        <div className="flex items-center gap-2.5 bg-accent/30 p-2 rounded-[12px] border border-border/50">
                          <div className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="overflow-hidden flex-1 text-left">
                            <p className="text-[9px] font-[600] uppercase tracking-wider text-[#8b8b8b] mb-0">Location</p>
                            <p className="text-[12px] font-[700] leading-[1.3] text-foreground truncate uppercase">
                              {[album.city, album.state].filter(Boolean).join(', ') || album.location}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 bg-accent/30 p-2 rounded-[12px] border border-border/50">
                        <div className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center shrink-0 text-foreground shadow-sm">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="overflow-hidden flex-1 text-left">
                          <p className="text-[9px] font-[600] uppercase tracking-wider text-[#8b8b8b] mb-0">Date</p>
                          <p className="text-[12px] font-[700] leading-[1.3] text-foreground truncate uppercase">
                            {album.albumDate
                              ? new Date(album.albumDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : new Date(album.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full pt-3 border-t border-border/40 shrink-0 mt-auto">
                    <div className="w-full py-2.5 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-white text-foreground text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5">
                      View Album
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
