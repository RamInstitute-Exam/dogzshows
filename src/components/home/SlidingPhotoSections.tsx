'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Eye, Download } from 'lucide-react';
import api, { getImageUrl, getThumbnailUrl } from '@/lib/api';
import ImageLightbox from '@/components/shared/ImageLightbox';

// Returns the public backend base URL
function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1$/, '');
  return envUrl || '';
}

// Observed wrapper for viewport views tracking
function ObservedPhotoCard({ photoId, onVisible, children }: { photoId: string; onVisible: () => void; children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || observed.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          onVisible();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [photoId, onVisible]);

  return <div ref={cardRef} className="w-full h-full relative">{children}</div>;
}

export default function SlidingPhotoSections({ initialSections = [] }: { initialSections?: any[] }) {
  const [sections, setSections] = useState<any[]>(initialSections);
  const [isLoading, setIsLoading] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);

  // Downloads & Views States
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Seed initial download counts
    const counts: Record<string, number> = {};
    initialSections.forEach((sec: any) => {
      (sec.images || []).forEach((img: any) => {
        counts[img.id] = img.downloadCount ?? 0;
      });
    });
    setDownloadCounts(counts);
    setSections(initialSections);
  }, [initialSections]);



  const handlePhotoVisible = useCallback((sectionId: string, photoId: string) => {
    // Disabled to prevent massive performance issues on scroll
  }, []);

  const handleDownload = useCallback(async (e: React.MouseEvent | null, photoId: string) => {
    if (e) e.stopPropagation();
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

      // Update local section images list
      setSections((prevSections) => 
        prevSections.map((sec) => ({
          ...sec,
          images: sec.images.map((img: any) => 
            img.id === photoId ? { ...img, downloadCount: (img.downloadCount ?? 0) + 1 } : img
          )
        }))
      );
    } catch (err) {
      console.error('[download] Error:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  }, [downloadingId]);

  const handleStatsUpdate = useCallback((photoId: string, stats: { viewCount?: number; downloadCount?: number }) => {
    if (stats.viewCount !== undefined) {
      setSections((prevSections) => 
        prevSections.map((sec) => ({
          ...sec,
          images: sec.images.map((img: any) => 
            img.id === photoId ? { ...img, viewCount: stats.viewCount } : img
          )
        }))
      );
    }
    if (stats.downloadCount !== undefined) {
      setDownloadCounts((prev) => ({
        ...prev,
        [photoId]: stats.downloadCount ?? 0,
      }));
      setSections((prevSections) => 
        prevSections.map((sec) => ({
          ...sec,
          images: sec.images.map((img: any) => 
            img.id === photoId ? { ...img, downloadCount: stats.downloadCount } : img
          )
        }))
      );
    }
  }, []);

  const preventDownload = (e: React.MouseEvent | React.DragEvent) => e.preventDefault();
  const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

  if (isLoading) {
    return null;
  }

  if (sections.length === 0) return null;

  return (
    <div onContextMenu={preventContextMenu} className="w-full bg-background border-t border-border/50 select-none">
      {sections.map((section) => {
        if (!section.images || section.images.length === 0) return null;

        return (
          <section key={section.id} className="premium-section-spacing overflow-hidden relative">
            <div className="premium-container relative z-10">

              {/* Header */}
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  {section.title || section.name}
                </h2>
                {section.subtitle && (
                  <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-3xl">
                    {section.subtitle}
                  </p>
                )}
              </div>

              {/* Masonry Layout Container */}
              <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
                {section.images.map((img: any, idx: number) => (
                  <div 
                    key={img.id || idx}
                    className="break-inside-avoid relative group personal-photo-card photo-card photo-wrapper cursor-pointer overflow-hidden rounded-2xl border border-border/40 select-none shadow-sm hover:shadow-xl hover:border-border/20 transition-all duration-300"
                    onClick={() => {
                      setLightboxImages(section.images);
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                  >
                    <Image
                      src={img.fallbackFailed ? img.imageUrl : getThumbnailUrl(img.imageUrl)}
                      alt={`${section.title} ${idx + 1}`}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: '100%', height: 'auto' }}
                      quality={85}
                      unoptimized={true}
                      loading={idx < 4 ? undefined : "lazy"}
                      priority={idx < 4}
                      onError={(e) => {
                        if (!img.fallbackFailed) {
                          img.fallbackFailed = true;
                          const target = e.target as HTMLImageElement;
                          target.src = img.imageUrl;
                          target.srcset = '';
                        }
                      }}
                      className="personal-photo-image photo-card-img block transform transition-transform duration-700 group-hover:scale-[1.03]"
                      onContextMenu={preventContextMenu}
                      onDragStart={preventDownload}
                    />

                    {/* Dark transparent overlay actions bar */}
                    <div className="absolute inset-0 bg-black/45 z-10 flex flex-col justify-between p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {/* Top Row: Views and Downloads */}
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

                      {/* Bottom Row: Download Button */}
                      <div className="flex justify-center w-full pointer-events-auto mt-auto">
                        {img.allowDownload !== false && (
                          <button
                            onClick={(e) => handleDownload(e, img.id)}
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
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Reusable Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        allowDownload={true}
        onDownload={async (photoId) => {
          await handleDownload(null, photoId);
        }}
        downloadingId={downloadingId}
        downloadCounts={downloadCounts}
        onStatsUpdate={handleStatsUpdate}
      />
    </div>
  );
}

