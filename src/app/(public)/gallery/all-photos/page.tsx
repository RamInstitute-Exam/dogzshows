'use client';

import React, { useEffect, useState } from 'react';
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
            <span className="text-brand-orange font-bold text-xs uppercase tracking-widest block">
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
            <Camera className="w-16 h-16 text-brand-orange mx-auto mb-6 opacity-80" />
            <h3 className="text-2xl font-bold text-foreground">No Albums Available</h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Please add albums from the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {albums.map((album) => (
              <Link 
                key={album.id}
                href={`/gallery/${album.slug}`}
                className="group flex flex-col bg-card border border-border/50 hover:border-brand-orange/30 rounded-[24px] overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-black/20"
              >
                {/* Cover Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-accent border-b border-border/20">
                  <img
                    src={getImageUrl(album.coverImage)}
                    alt={album.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {album._count?.images || album.images?.length || 0} Photos
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand-orange transition-colors leading-snug line-clamp-2">
                      {album.title}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-medium">
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

                  <div className="w-full pt-4 border-t border-border/40">
                    <div className="w-full py-3 rounded-xl bg-muted group-hover:bg-brand-orange group-hover:text-white text-foreground text-center font-bold text-sm transition-all flex items-center justify-center gap-1.5">
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
