'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Download, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import api, { getImageUrl, getThumbnailUrl } from '@/lib/api';
import ImageLightbox from '@/components/shared/ImageLightbox';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Returns the public backend base URL
function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1$/, '');
  return envUrl || '';
}

// Subcomponent to optimize and lazy-load individual slider images
function ImageCard({ img, alt }: { img: any; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(getThumbnailUrl(img.imageUrl));

  const preventDownload = (e: React.MouseEvent | React.DragEvent) => e.preventDefault();
  const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse z-10 rounded-2xl" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={800}
        height={1200}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        quality={85}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          // Fall back to original imageUrl if thumbnail is missing or fails
          setImageSrc(img.imageUrl);
        }}
        className={`w-full h-auto object-contain md:object-cover md:h-full max-h-[70vh] md:max-h-none transform transition-transform duration-700 group-hover:scale-[1.03] transition-opacity duration-300 pointer-events-none select-none ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onContextMenu={preventContextMenu}
        onDragStart={preventDownload}
        draggable={false}
      />
    </>
  );
}

// Carousel subcomponent for a single sliding photos section
function SlidingPhotoSectionCarousel({
  section,
  handleDownload,
  downloadingId,
  downloadCounts,
  onPhotoClick,
}: {
  section: any;
  handleDownload: (e: React.MouseEvent | null, photoId: string) => Promise<void>;
  downloadingId: string | null;
  downloadCounts: Record<string, number>;
  onPhotoClick: (clickedId: string, allImages: any[]) => void;
}) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Limit display to the latest 15 photos
  const slicedImages = (section.images || []).slice(0, 15);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!swiperInstance || !swiperInstance.autoplay) return;
    if (inView) {
      swiperInstance.autoplay.start();
    } else {
      swiperInstance.autoplay.stop();
    }
  }, [inView, swiperInstance]);

  if (slicedImages.length === 0) return null;

  return (
    <section ref={containerRef} key={section.id} className="premium-section-spacing overflow-hidden relative border-b border-border/40 last:border-b-0">
      <div className="premium-container relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {section.title || section.name}
            </h2>
            {section.subtitle && section.subtitle.trim() !== '' && section.subtitle !== 'null' && section.subtitle !== 'undefined' && (
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">
                {section.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative w-full">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoHeight={true}
            navigation={{
              prevEl,
              nextEl,
            }}
            pagination={{
              clickable: true,
            }}
            onBeforeInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevEl;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextEl;
            }}
            onSwiper={(swiper) => {
              setSwiperInstance(swiper);
            }}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={slicedImages.length > 4}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="!pb-4 sm:!pb-12 photos-swiper premium-carousel-track !h-auto min-h-0"
          >
            {slicedImages.map((img: any, idx: number) => (
              <SwiperSlide key={img.id || idx} className="!h-auto flex">
                <div
                  className="relative group w-full cursor-pointer overflow-hidden rounded-2xl border border-border/40 select-none shadow-sm hover:shadow-xl hover:border-border/20 transition-all duration-300 flex flex-col justify-between"
                  onClick={() => onPhotoClick(img.id, slicedImages)}
                >
                  {/* Photo container to preserve aspect ratio */}
                  <div className="relative w-full h-auto aspect-auto md:aspect-[4/5] bg-black/10 dark:bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center">
                    <ImageCard
                      img={img}
                      alt={`${section.title || section.name} ${idx + 1}`}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Container - Mobile: Below, Tablet: Inside, Desktop: Outside */}
          <div className="flex md:absolute md:top-1/2 md:-translate-y-1/2 md:left-4 md:right-4 xl:-left-[64px] xl:-right-[64px] justify-center md:justify-between items-center gap-4 mt-6 md:mt-0 z-20 pointer-events-none">
            <button
              ref={(node) => setPrevEl(node)}
              className="pointer-events-auto shrink-0 flex items-center justify-center !w-[52px] !h-[52px] !min-w-[52px] !max-w-[52px] bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:scale-[1.08] active:scale-[0.96] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-border/5"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="text-black" />
            </button>
            <button
              ref={(node) => setNextEl(node)}
              className="pointer-events-auto shrink-0 flex items-center justify-center !w-[52px] !h-[52px] !min-w-[52px] !max-w-[52px] bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:scale-[1.08] active:scale-[0.96] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-border/5"
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="text-black" />
            </button>
          </div>
        </div>

        {/* View All Photos Button */}
        <div className="flex flex-col items-center justify-center mt-6 gap-3 text-center">
          <Link
            href="/gallery/all-photos"
            className="btn-primary-luxury group gap-2.5 px-8 uppercase"
          >
            View All Photos
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        /* Hide Swiper default navigation icons inside our custom buttons */
        .photos-swiper-prev.swiper-button-prev::after,
        .photos-swiper-next.swiper-button-next::after {
          display: none !important;
          content: "" !important;
        }

        /* Fix empty space below image on mobile */
        .photos-swiper .swiper-wrapper {
          align-items: flex-start !important;
        }
        
        /* Glassmorphism circular navigation buttons, vertically centered */
        .photos-swiper-prev.swiper-button-prev,
        .photos-swiper-next.swiper-button-next {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          margin-top: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 9999px !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          color: #000000 !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          z-index: 20 !important;
          transition: all 0.25s ease !important;
        }

        .dark .photos-swiper-prev.swiper-button-prev,
        .dark .photos-swiper-next.swiper-button-next {
          background: rgba(0, 0, 0, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
        }

        .photos-swiper-prev.swiper-button-prev {
          left: 16px !important;
        }

        .photos-swiper-next.swiper-button-next {
          right: 16px !important;
        }

        .photos-swiper-prev.swiper-button-prev:hover,
        .photos-swiper-next.swiper-button-next:hover {
          transform: translateY(-50%) scale(1.08) !important;
          background: #ffffff !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18) !important;
        }

        .dark .photos-swiper-prev.swiper-button-prev:hover,
        .dark .photos-swiper-next.swiper-button-next:hover {
          background: #111111 !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45) !important;
        }

        /* Visibility: Always visible on Desktop and Tablet (screens > 768px) */
        @media (min-width: 769px) {
          .photos-swiper-prev.swiper-button-prev,
          .photos-swiper-next.swiper-button-next {
            display: flex !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        }

        /* Hide side arrows on mobile (screens <= 768px) */
        @media (max-width: 768px) {
          .photos-swiper-prev.swiper-button-prev,
          .photos-swiper-next.swiper-button-next {
            display: none !important;
          }
        }

        /* Disable Swiper default styling affecting layout */
        .photos-swiper-prev.swiper-button-disabled,
        .photos-swiper-next.swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Show pagination only on mobile */
        @media (min-width: 769px) {
          .photos-swiper .swiper-pagination {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .photos-swiper .swiper-pagination {
            display: block !important;
            bottom: 0px !important;
          }
        }

        /* Style Swiper pagination bullets */
        .photos-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.4) !important;
          width: 8px !important;
          height: 8px !important;
          opacity: 1 !important;
          transition: all 0.25s ease !important;
        }

        .photos-swiper .swiper-pagination-bullet-active {
          background: white !important;
          width: 24px !important;
          border-radius: 4px !important;
        }

        /* For light mode */
        :root:not(.dark) .photos-swiper .swiper-pagination-bullet {
          background: rgba(0, 0, 0, 0.25) !important;
        }

        :root:not(.dark) .photos-swiper .swiper-pagination-bullet-active {
          background: #000000 !important;
        }
      `}</style>
    </section>
  );
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

  const handlePhotoClick = useCallback((clickedId: string, allImages: any[]) => {
    const idx = allImages.findIndex((p: any) => p.id === clickedId);
    setLightboxImages(allImages);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  }, []);

  const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

  if (isLoading) {
    return null;
  }

  if (sections.length === 0) return null;

  return (
    <div onContextMenu={preventContextMenu} className="w-full bg-background border-t border-border/50 select-none">
      {sections.map((section) => (
        <SlidingPhotoSectionCarousel
          key={section.id}
          section={section}
          handleDownload={handleDownload}
          downloadingId={downloadingId}
          downloadCounts={downloadCounts}
          onPhotoClick={handlePhotoClick}
        />
      ))}

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

