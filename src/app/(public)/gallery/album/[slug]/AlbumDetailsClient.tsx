'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Camera, ImageIcon } from 'lucide-react';
import Masonry from 'react-masonry-css';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import ImageLightbox from '@/components/shared/ImageLightbox';

export default function AlbumDetailsClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    async function fetchAlbumDetails() {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/public/gallery/albums/${slug}`);
        if (res.success && res.data) {
          setAlbum(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch album details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbumDetails();
  }, [slug]);

  // Disable download handlers
  const preventDownload = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
  };

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm mt-4">Loading album details...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ImageIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-3xl font-bold text-foreground">Album Not Found</h1>
        <p className="text-muted-foreground mt-2 mb-6">The photo album you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-white font-bold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const masonryBreakpoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const displayedImages = album.images?.slice(0, visibleCount) || [];
  const hasMore = album.images && album.images.length > visibleCount;

  return (
    <div onContextMenu={preventContextMenu} className="select-none no-download">
      {/* CSS injection to disable image callouts and saving on iOS/Android */}
      <style jsx global>{`
        img {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
      `}</style>

      {/* Album Header/Banner */}
      <div className="relative w-full bg-background dark:bg-[#050505] overflow-hidden border-b border-border/40 pt-10 md:pt-16 pb-10 md:pb-12">
        {/* Cover image blurred background */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={getImageUrl(album.coverImage)} 
            alt="" 
            className="w-full h-full object-cover opacity-15 blur-2xl scale-110"
            onContextMenu={preventContextMenu}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <PublicContainer className="relative z-10 w-full">
          <div className="space-y-6">
            <button 
              onClick={() => router.back()} 
              className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Gallery
            </button>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <span className="bg-foreground/10 border border-border/20 text-foreground text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                  {album.category?.name || 'Photos'}
                </span>
                {album.club?.name && (
                  <span className="bg-muted border border-border/40 text-muted-foreground text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1">
                    Club: {album.club.name}
                  </span>
                )}
                {album.event?.name && (
                  <span className="bg-muted border border-border/40 text-muted-foreground text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1">
                    <Camera className="w-3 h-3 shrink-0 text-foreground" />
                    Show: {album.event.name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight max-w-4xl">
                {album.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs md:text-sm font-medium text-muted-foreground">
                {(album.city || album.state) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-foreground shrink-0" />
                    <span>{[album.city, album.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-foreground shrink-0" />
                  <span>
                    {album.albumDate 
                      ? new Date(album.albumDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                      : new Date(album.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-foreground shrink-0" />
                  <span>{album.images?.length || 0} Photos</span>
                </div>
              </div>
            </div>

            {album.description && (
              <p className="text-muted-foreground text-sm md:text-base max-w-3xl leading-relaxed border-l-2 border-border/50 pl-4 py-1">
                {album.description}
              </p>
            )}
          </div>
        </PublicContainer>
      </div>

      {/* Masonry / Grid of Photos */}
      <PublicContainer className="py-16">
        {(!album.images || album.images.length === 0) ? (
          <div className="text-center py-20 bg-card rounded-[24px] border border-border border-dashed">
            <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">No Photos Found</h3>
            <p className="text-muted-foreground text-sm mt-2">There are currently no photos uploaded to this album.</p>
          </div>
        ) : (
          <>
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="flex w-auto -ml-4"
              columnClassName="pl-4 bg-clip-padding"
            >
              {displayedImages.map((img: any, index: number) => (
                <div 
                  key={img.id || index} 
                  className="mb-4 cursor-pointer overflow-hidden rounded-2xl bg-card border border-border/40 relative group shadow-sm hover:shadow-xl hover:border-border/20 transition-all duration-300 select-none"
                  onClick={() => setLightboxIndex(index)}
                  onContextMenu={preventContextMenu}
                >
                  <img 
                    src={getImageUrl(img.imageUrl)} 
                    alt={`${album.title} gallery ${index + 1}`} 
                    loading="lazy"
                    className="w-full block transform transition-transform duration-700 group-hover:scale-[1.03]" 
                    style={{ pointerEvents: 'none' }}
                    onContextMenu={preventContextMenu}
                    onDragStart={preventDownload}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
              ))}
            </Masonry>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-3 rounded-full bg-foreground hover:opacity-90 text-white font-bold transition-all shadow-md"
                >
                  Load More Photos
                </button>
              </div>
            )}
          </>
        )}
      </PublicContainer>

      {/* Premium Lightbox integration */}
      <ImageLightbox 
        images={album.images || []} 
        initialIndex={lightboxIndex || 0} 
        isOpen={lightboxIndex !== null} 
        onClose={() => setLightboxIndex(null)} 
      />
    </div>
  );
}
