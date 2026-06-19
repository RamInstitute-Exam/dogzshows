'use client';

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
      <section className="py-20 bg-background border-t border-border/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-12">
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
    <section className="py-20 bg-background relative overflow-hidden border-t border-border/40">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] block mb-3">
              PREMIUM GALLERY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Outdoor Photos
            </h2>
            <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
              Explore professional photography and outdoor training and show action from across our active clubs and specialties.
            </p>
          </div>
          <Link 
            href="/gallery/outdoor-photos" 
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border/60 hover:border-brand-orange hover:text-brand-orange rounded-full text-sm font-bold text-foreground transition-all shadow-sm shrink-0 self-start sm:self-end"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Featured Albums Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {albums.map((album) => (
            <Link 
              key={album.id}
              href={`/gallery/${album.slug}`}
              className="group flex flex-col bg-card border border-border/50 hover:border-brand-orange/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-black/20 h-[380px]"
            >
              {/* Cover Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-accent border-b border-border/20">
                <img
                  src={getImageUrl(album.coverImage)}
                  alt={album.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-orange" />
                  {album._count?.images || album.images?.length || 0} Photos
                </div>
              </div>

              {/* Card Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {album.eventName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      {album.eventName}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-foreground group-hover:text-brand-orange transition-colors leading-snug line-clamp-2">
                    {album.title}
                  </h3>
                  
                  <div className="flex flex-col gap-1 text-[11px] text-muted-foreground font-medium">
                    {album.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span className="truncate">{album.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span>{new Date(album.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-border/40 mt-4">
                  <div className="w-full py-2.5 rounded-xl bg-muted group-hover:bg-brand-orange group-hover:text-white text-foreground text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5">
                    View Album
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
