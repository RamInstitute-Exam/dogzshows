'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Keyboard } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import api, { getImageUrl } from '@/lib/api';
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
              </div>

              {/* Slider Container with padding for outside arrows */}
              <div className="premium-carousel-wrapper group/sliding-section">

                {/* Custom Navigation Arrows */}
                <button
                  className={`nav-prev-${section.id} premium-slider-nav premium-slider-prev`}
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  className={`nav-next-${section.id} premium-slider-nav premium-slider-next`}
                  aria-label="Next slide"
                >
                  <ChevronRight size={22} />
                </button>

                <Swiper
                  modules={[Autoplay, Navigation, Keyboard]}
                  loop={section.images.length > 1}
                  watchOverflow={true}
                  keyboard={{ enabled: true }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                  }}
                  speed={500}
                  navigation={{
                    prevEl: `.nav-prev-${section.id}`,
                    nextEl: `.nav-next-${section.id}`,
                  }}
                  breakpoints={{
                    0: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 12 },
                    768: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 16 },
                    1024: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 20 },
                    1280: { slidesPerView: 4, slidesPerGroup: 1, spaceBetween: 24 }
                  }}
                  className="premium-carousel-track"
                >
                  {section.images.map((img: any, idx: number) => (
                    <SwiperSlide key={img.id || idx}>
                      {/* Removed ObservedPhotoCard for performance */}
                        <div
                          onClick={() => {
                            setLightboxImages(section.images);
                            setLightboxIndex(idx);
                            setLightboxOpen(true);
                          }}
                          className="group personal-photo-card photo-card photo-wrapper cursor-pointer relative overflow-hidden rounded-2xl border border-border/40 select-none shadow-sm hover:shadow-xl hover:border-border/20 transition-all duration-300"
                        >
                          <Image
                            src={getImageUrl(img.imageUrl)}
                            alt={`${section.title} ${idx + 1}`}
                            fill={false}
                            width={800}
                            height={1200}
                            quality={80}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            loading={idx < 2 ? undefined : "lazy"}
                            priority={idx < 2}
                            className="personal-photo-image photo-card-img transform transition-transform duration-700 group-hover:scale-[1.03]"
                            style={{ pointerEvents: 'none' }}
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
                    </SwiperSlide>
                  ))}
                </Swiper>

              </div>
            </div>

            <style jsx global>{`
              /* Hide locked navigation arrows */
              .nav-prev-${section.id}.swiper-button-lock,
              .nav-next-${section.id}.swiper-button-lock {
                display: none !important;
              }

              .photo-wrapper {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: transparent !important;
              }

              .photo-wrapper img,
              .personal-photo-image,
              .photo-card-img {
                width: 100% !important;
                height: auto !important;
                object-fit: contain !important;
                display: block !important;
                background: transparent !important;
              }

              .personal-photo-card,
              .photo-card {
                overflow: hidden;
                border-radius: 24px !important;
                background: transparent !important;
                box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                transition: 0.3s ease;
                width: 100%;
                height: auto !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }

              .personal-photo-card:hover,
              .photo-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
              }

              @media (max-width: 1440px) {
                .personal-photo-card,
                .photo-card {
                  height: auto !important;
                }
              }

              @media (max-width: 1024px) {
                .personal-photo-card,
                .photo-card {
                  height: auto !important;
                }
              }

              @media (max-width: 768px) {
                .personal-photo-card,
                .photo-card {
                  height: auto !important;
                  border-radius: 20px !important;
                }

                .personal-photo-image,
                .photo-card-img {
                  width: 100% !important;
                  height: auto !important;
                  max-height: none !important;
                  object-fit: contain !important;
                }
              }
            `}</style>
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

