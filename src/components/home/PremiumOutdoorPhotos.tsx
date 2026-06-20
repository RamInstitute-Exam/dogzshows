'use client';

import Image from 'next/image';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ImageIcon, MapPin, Calendar, Camera } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';

export default function PremiumOutdoorPhotos() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await api.get('/public/media-gallery-mgmt/albums?type=OUTDOOR_PHOTOS&limit=4');
        if (res.success && res.data) {
          setAlbums(res.data);
        }
      } catch (error) {
        console.error('Failed to load home page outdoor albums:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  if (isLoading) {
    return (
      <section className="premium-section-spacing bg-background border-t border-border/50">
        <div className="premium-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted/20 w-32 rounded" />
              <div className="h-10 bg-muted/20 w-64 rounded" />
              <div className="h-6 bg-muted/20 w-96 rounded" />
            </div>
            <div className="h-12 bg-muted/20 w-36 rounded-full" />
          </div>
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
        </div>
      </section>
    );
  }

  if (albums.length === 0) return null;

  return (
    <section className="premium-section-spacing bg-background relative overflow-hidden border-t border-border/40">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-foreground/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="premium-container relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] block mb-3">
              PREMIUM GALLERY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight uppercase">
              Outdoor Photos
            </h2>
            <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
              Explore professional photography and outdoor training and show action from across our active clubs and specialties.
            </p>
          </div>
          <Link 
            href="/gallery/outdoor-photos" 
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border/60 hover:border-border hover:text-foreground rounded-full text-sm font-bold text-foreground transition-all shadow-sm shrink-0 self-start sm:self-end uppercase"
          >
            VIEW ALL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Featured Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {albums.map((album) => (
            <Link 
              key={album.id}
              href={`/gallery/album?slug=${album.slug}`}
              className="group flex flex-col bg-card border border-border/50 hover:border-border/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-black/20 w-full max-w-[380px] min-h-[420px] h-auto mx-auto"
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
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md uppercase">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {album._count?.images || album.images?.length || 0} PHOTOS
                </div>
              </div>

              {/* Card Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {album.eventName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      {album.eventName?.toUpperCase()}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2 uppercase">
                    {album.title?.toUpperCase()}
                  </h3>
                  
                  <div className="flex flex-col gap-1 text-[11px] text-muted-foreground font-medium uppercase">
                    {album.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{album.location?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{new Date(album.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-border/40 mt-4">
                  <div className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5 duration-300 uppercase">
                    VIEW ALBUM
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
