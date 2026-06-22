'use client';

import React, { useState, useEffect, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { preload } from 'react-dom';
import { ArrowLeft, MapPin, Calendar, Camera, ImageIcon, Download, Eye } from 'lucide-react';
import { Masonry } from 'masonic';
import api, { getImageUrl } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import PublicContainer from '@/components/layout/PublicContainer';
import ImageLightbox from '@/components/shared/ImageLightbox';

// Returns the public backend base URL
function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1$/, '');
  return envUrl || '';
}

// Intersection observers removed for performance

export default function AlbumDetailsClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  let slug = resolvedParams.slug;

  // If served via Firebase rewrite fallback (_/index.html), extract real slug from URL
  if (slug === '_' && typeof window !== 'undefined') {
    const match = window.location.pathname.match(/\/gallery\/album\/([^\/]+)/);
    if (match && match[1]) {
      slug = match[1];
    }
  }

  const router = useRouter();

  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});

  // Pagination
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    async function fetchAlbumDetails() {
      if (!slug) { setLoading(false); return; }
      try {
        const res = await api.get(`/public/gallery/albums/${slug}`);
        if (res.success && res.data) {
          setAlbum(res.data);
          // Seed local download count map from DB values
          const counts: Record<string, number> = {};
          (res.data.images || []).forEach((img: any) => {
            counts[img.id] = img.downloadCount ?? 0;
          });
          setDownloadCounts(counts);
        }
      } catch (err) {
        console.error('Failed to fetch album details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbumDetails();
  }, [slug]);

  // Preload first few images for LCP optimization
  useEffect(() => {
    if (album?.images && album.images.length > 0) {
      const preloadCount = Math.min(album.images.length, 8);
      for (let i = 0; i < preloadCount; i++) {
        const url = getImageUrl(album.images[i].thumbnailUrl || album.images[i].imageUrl);
        preload(url, { as: 'image' });
      }
    }
  }, [album]);

  const handlePhotoVisible = useCallback((photoId: string) => {
    // Disabled view increment on scroll to prevent performance issues
  }, []);

  const handleDownload = useCallback(async (e: React.MouseEvent | null, photoId: string, index?: number) => {
    if (e) e.stopPropagation(); // don't open lightbox
    if (downloadingId) return;

    setDownloadingId(photoId);
    try {
      const apiBase = getApiBase();
      const url = `${apiBase}/api/v1/public/gallery/photos/${photoId}/download`;

      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || 'Download failed. Please try again.');
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Trigger browser download
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `juztdog-photo-${photoId.slice(0, 8)}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);

      // Optimistically increment local count
      setDownloadCounts((prev) => ({
        ...prev,
        [photoId]: (prev[photoId] ?? 0) + 1,
      }));
      setAlbum((prevAlbum: any) => {
        if (!prevAlbum || !prevAlbum.images) return prevAlbum;
        return {
          ...prevAlbum,
          images: prevAlbum.images.map((img: any) =>
            img.id === photoId ? { ...img, downloadCount: (img.downloadCount ?? 0) + 1 } : img
          )
        };
      });
    } catch (err) {
      console.error('[download] Error:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  }, [downloadingId]);

  const handleStatsUpdate = useCallback((photoId: string, stats: { viewCount?: number; downloadCount?: number }) => {
    if (stats.viewCount !== undefined) {
      setAlbum((prevAlbum: any) => {
        if (!prevAlbum || !prevAlbum.images) return prevAlbum;
        return {
          ...prevAlbum,
          images: prevAlbum.images.map((img: any) =>
            img.id === photoId ? { ...img, viewCount: stats.viewCount } : img
          )
        };
      });
    }
    if (stats.downloadCount !== undefined) {
      setDownloadCounts((prev) => ({
        ...prev,
        [photoId]: stats.downloadCount ?? 0,
      }));
      setAlbum((prevAlbum: any) => {
        if (!prevAlbum || !prevAlbum.images) return prevAlbum;
        return {
          ...prevAlbum,
          images: prevAlbum.images.map((img: any) =>
            img.id === photoId ? { ...img, downloadCount: stats.downloadCount } : img
          )
        };
      });
    }
  }, []);

  // ─── Protection handlers ───────────────────────────────────────────────────
  const preventDownload = (e: React.MouseEvent | React.DragEvent) => e.preventDefault();
  const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

  // ─── Loading / Not found ───────────────────────────────────────────────────
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

  const masonryBreakpoints = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const displayedImages = album.images?.slice(0, visibleCount) || [];
  const hasMore = album.images && album.images.length > visibleCount;
  const downloadsEnabled = album.allowDownload === true;

  return (
    <div onContextMenu={preventContextMenu} className="select-none no-download">
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

      {/* Album Header */}
      <div className="relative w-full bg-background dark:bg-[#050505] overflow-hidden border-b border-border/40 pt-10 md:pt-16 pb-10 md:pb-12">
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
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight max-w-4xl">
                {album.title}
              </h1>

              {album.description && (
                <p className="text-muted-foreground text-sm md:text-base font-medium max-w-3xl leading-relaxed">
                  {album.description}
                </p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm font-semibold text-muted-foreground pt-2">
                {album.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4.5 h-4.5 text-foreground shrink-0" />
                    {album.city}{album.state ? `, ${album.state}` : ''}
                  </span>
                )}
                {album.albumDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4.5 h-4.5 text-foreground shrink-0" />
                    {new Date(album.albumDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </PublicContainer>
      </div>

      {/* Virtualized Masonry Image Gallery */}
      <PublicContainer className="py-12 md:py-16">
        {(!album.images || album.images.length === 0) ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No photos uploaded to this album yet.</p>
          </div>
        ) : (
          <div className="w-full">
            <Masonry
              items={album.images}
              columnGutter={16}
              columnWidth={280}
              overscanBy={2}
              render={({ index, data: img, width }: { index: number; data: any; width: number }) => (
                <div
                  className="mb-4 overflow-hidden rounded-2xl bg-card border border-border/40 relative group shadow-sm hover:shadow-xl hover:border-border/20 transition-all duration-300 select-none"
                  onContextMenu={preventContextMenu}
                >
                  <div
                    className="cursor-pointer relative min-h-[200px]"
                    onClick={() => setLightboxIndex(index)}
                  >
                    <div className="absolute inset-0 bg-muted/40 animate-pulse -z-10" />

                    <Image
                      src={getImageUrl(img.thumbnailUrl || img.imageUrl)}
                      alt={`${album.title} gallery ${index + 1}`}
                      priority={index < 8}
                      loading={index < 8 ? undefined : "lazy"}
                      width={400}
                      height={600}
                      quality={80}
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                      className="w-full block transform transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ pointerEvents: 'none', width: '100%', height: 'auto' }}
                      onContextMenu={preventContextMenu}
                      onDragStart={preventDownload}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors pointer-events-none" />
                  </div>

                  <div className="absolute inset-0 bg-black/45 z-10 flex flex-col justify-between p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="flex justify-between items-center w-full pointer-events-auto">
                      <span className="flex items-center gap-1.5 text-white text-xs md:text-sm font-semibold drop-shadow-md select-none">
                        <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {(img.viewCount ?? 0).toLocaleString()} Visitors
                      </span>
                      <span className="flex items-center gap-1.5 text-white text-xs md:text-sm font-semibold drop-shadow-md select-none">
                        <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {(downloadCounts[img.id] ?? img.downloadCount ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-center w-full pointer-events-auto mt-auto">
                      {(downloadsEnabled && img.allowDownload !== false) && (
                        <button
                          onClick={(e) => handleDownload(e, img.id, index)}
                          disabled={downloadingId === img.id}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs md:text-sm transition-all shadow-lg border border-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {downloadingId === img.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </PublicContainer>

      {/* Lightbox */}
      <ImageLightbox
        images={album.images || []}
        initialIndex={lightboxIndex !== null ? lightboxIndex : 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        allowDownload={downloadsEnabled}
        onDownload={async (photoId, index) => {
          await handleDownload(null, photoId, index);
        }}
        downloadingId={downloadingId}
        downloadCounts={downloadCounts}
        onStatsUpdate={handleStatsUpdate}
      />
    </div>
  );
}
