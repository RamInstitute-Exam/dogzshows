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
                className="group flex flex-col bg-card border border-border/50 hover:border-border/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-black/20 w-full max-w-[380px] h-[500px] md:h-[600px] mx-auto"
              >
                {/* Cover Image */}
                <div className="relative w-full h-[240px] md:h-[320px] shrink-0 overflow-hidden bg-black">
                  <Image
                    src={getImageUrl(album.coverImage)}
                    alt={album.title}
                    fill
                    quality={100}
                    className="gallery-image transition-transform duration-700 group-hover:scale-[1.05] object-cover object-center"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-md">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {album._count?.images || album.images?.length || 0} Photos
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 flex-grow flex flex-col justify-between min-h-0">
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
                      {album.title}
                    </h3>
                    
                    <div className="text-[14px] font-medium text-primary leading-snug line-clamp-1 min-h-[1.25rem] md:min-h-[1.5rem]">
                      {album.subtitle || <span className="invisible">No Subtitle</span>}
                    </div>

                    <div className="text-[13px] font-normal text-muted-foreground leading-snug line-clamp-2 mt-2 min-h-[2.5rem] md:min-h-[2.75rem]">
                      {album.shortDescription || album.description || <span className="invisible">No Description</span>}
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-medium pt-2 min-h-[2.75rem] justify-end">
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

                  <div className="w-full pt-4 border-t border-border/40 shrink-0 mt-auto">
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
