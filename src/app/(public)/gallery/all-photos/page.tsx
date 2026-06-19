'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Image as ImageIcon, ArrowRight, Camera } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';

export default function AllPhotosPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await api.get('/public/media-gallery-mgmt/albums?type=ALL_PHOTOS');
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
      <div className="w-full bg-[#050505] py-12 border-b border-border/40">
        <PublicContainer>
          <div className="space-y-2 text-center md:text-left">
            <span className="text-foreground font-bold text-xs uppercase tracking-widest block">
              Media Gallery
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
              All Photos
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
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
                className="group flex flex-col bg-card border border-border/50 hover:border-border/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-black/20 w-full lg:w-[380px] lg:max-h-[560px] md:w-[320px] md:max-h-[480px] w-full min-h-[420px] max-h-[560px] h-auto mx-auto"
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
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
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
