'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Image as ImageIcon, ArrowRight, Camera } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

export default function OutdoorPhotosPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await api.get('/public/media-gallery-mgmt/albums?type=OUTDOOR_PHOTOS');
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
      <div className="w-full bg-[#050505] py-16 border-b border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />
        <PublicContainer>
          <div className="space-y-3 text-center md:text-left relative z-10">
            <span className="text-foreground font-bold text-xs uppercase tracking-widest block">
              Premium Gallery
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">
              Outdoor Photos
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
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
        ) : albums.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-[32px] border border-border/60 border-dashed max-w-md mx-auto p-8 shadow-inner">
            <Camera className="w-16 h-16 text-foreground mx-auto mb-6 opacity-80" />
            <h3 className="text-2xl font-bold text-foreground">No Albums Available</h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Please add albums from the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {albums.map((album) => (
              <Link 
                key={album.id}
                href={`/gallery/album?slug=${album.slug}`}
                className="group flex flex-col bg-card border border-border/50 hover:border-border/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-black/20 w-full lg:w-[380px] lg:max-h-[560px] md:w-[320px] md:max-h-[480px] w-full min-h-[420px] max-h-[560px] h-auto mx-auto"
              >
                {/* Cover Image */}
                <div className="relative w-full flex-grow flex items-center justify-center bg-black overflow-hidden">
                  <Image
                    src={getImageUrl(album.coverImage)}
                    alt={album.title}
                    fill={false}
                    width={800}
                    height={1200}
                    quality={100}
                    unoptimized
                    sizes="100vw"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                      objectPosition: "center"
                    }}
                    className="gallery-image transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {album._count?.images || album.images?.length || 0} Photos
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2">
                      {album.title}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-medium">
                      {album.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span className="truncate">{album.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-foreground shrink-0" />
                        <span>{new Date(album.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full pt-4 border-t border-border/40 mt-4">
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
