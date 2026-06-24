'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Image as ImageIcon, ArrowRight, Camera } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function AllPhotosPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await api.get('/public/gallery/albums');
        if (res.success && res.data) {
          setAlbums(res.data);
        }
      } catch (err) {
        console.error('Failed to load all-photos albums:', err);
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
            src="https://images.unsplash.com/photo-1444212477490-ca407925329e?q=80&w=2000&auto=format&fit=crop" 
            alt="All Photos Dog Show" 
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
              Media Gallery
            </span>
            <h1 className="text-[36px] md:text-[48px] lg:text-[60px] xl:text-[72px] font-extrabold text-[#111827] dark:text-[#FFFFFF] tracking-tight leading-tight drop-shadow-sm dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] opacity-100">
              All Photos
            </h1>
            <p className="text-[#4B5563] dark:text-[#CBD5E1] text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] max-w-[700px] leading-[1.8] opacity-100">
              Explore professional dog photography albums from shows, competitions, and specialties across India.
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
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1 select-none pointer-events-none z-10">
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
                <div className="p-6 flex-grow flex flex-col justify-between min-h-0">
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2">
                      {album.title}
                    </h3>

                    {album.subtitle && album.subtitle.trim() !== '' && album.subtitle !== 'null' && album.subtitle !== 'undefined' && (
                      <div className="text-[14px] font-medium text-primary leading-snug line-clamp-1 mt-1">
                        {album.subtitle}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-medium pt-2 justify-end">
                      {(album.city || album.state || album.location) && (
                        <div className="flex items-center gap-1.5">
                          <span className="shrink-0 text-sm">📍</span>
                          <span className="truncate">
                            {[album.city, album.state].filter(Boolean).join(', ') || album.location}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 text-sm">📅</span>
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
