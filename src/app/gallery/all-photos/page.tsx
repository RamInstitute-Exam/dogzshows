'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Image as ImageIcon, ArrowRight, Camera } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import OptimizedImage from '@/components/shared/OptimizedImage';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';

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
      <BreadcrumbBanner
        slug="/gallery/all-photos"
        fallbackImage="https://images.unsplash.com/photo-1444212477490-ca407925329e?q=80&w=2000&auto=format&fit=crop" fallbackTitle={''} />

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
                className="group relative flex flex-col overflow-hidden bg-card rounded-[24px] border border-border hover:border-border/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out cursor-pointer p-3 md:p-4 w-full max-w-[380px] h-[450px] md:h-[500px] mx-auto"
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
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1 select-none pointer-events-none z-10">
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
                <div className="px-1 pt-4 pb-1 flex-grow flex flex-col justify-between min-h-0">
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-foreground transition-colors leading-snug">
                      {album.title}
                    </h3>

                    {album.subtitle && album.subtitle.trim() !== '' && album.subtitle !== 'null' && album.subtitle !== 'undefined' && (
                      <div className="text-[13px] font-medium text-primary leading-snug mt-1">
                        {album.subtitle}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 md:gap-2 pt-3 justify-end">
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
